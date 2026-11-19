import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

// ============== 配置常量 ==============
const PARTICLE_CONFIG = {
    nebula: {
        name: '星云',
        createPositions: (count) => {
            const positions = new Float32Array(count * 3);
            for (let i = 0; i < count; i++) {
                const radius = Math.random() * 5 + 2;
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(2 * Math.random() - 1);
                positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
                positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
                positions[i * 3 + 2] = radius * Math.cos(phi);
            }
            return positions;
        },
        animation: (particles, time, handData) => {
            const positions = particles.geometry.attributes.position.array;
            for (let i = 0; i < positions.length; i += 3) {
                const x = positions[i];
                const y = positions[i + 1];
                const z = positions[i + 2];
                const dist = Math.sqrt(x * x + y * y + z * z);
                const scale = 1 + Math.sin(time * 0.5 + dist * 2) * 0.1;
                positions[i] = x * scale;
                positions[i + 1] = y * scale;
                positions[i + 2] = z * scale;
            }
        }
    },
    fireworks: {
        name: '烟花',
        createPositions: (count) => {
            const positions = new Float32Array(count * 3);
            for (let i = 0; i < count; i++) {
                const angle = Math.random() * Math.PI * 2;
                const radius = Math.random() * 3;
                const height = (Math.random() - 0.5) * 4;
                positions[i * 3] = Math.cos(angle) * radius;
                positions[i * 3 + 1] = height;
                positions[i * 3 + 2] = Math.sin(angle) * radius;
            }
            return positions;
        },
        animation: (particles, time, handData) => {
            const positions = particles.geometry.attributes.position.array;
            const velocities = particles.userData.velocities;
            // 首次运行动画时初始化速度数组（createMainParticles 中创建的是空数组，不能用真值判断）
            if (!velocities || velocities.length === 0) {
                particles.userData.velocities = [];
                for (let i = 0; i < positions.length / 3; i++) {
                    particles.userData.velocities.push({
                        x: (Math.random() - 0.5) * 0.02,
                        y: (Math.random() - 0.5) * 0.02,
                        z: (Math.random() - 0.5) * 0.02
                    });
                }
            }
            const vels = particles.userData.velocities;
            for (let i = 0; i < positions.length; i += 3) {
                const idx = i / 3;
                positions[i] += vels[idx].x;
                positions[i + 1] += vels[idx].y;
                positions[i + 2] += vels[idx].z;
                if (Math.abs(positions[i]) > 6) vels[idx].x *= -1;
                if (Math.abs(positions[i + 1]) > 6) vels[idx].y *= -1;
                if (Math.abs(positions[i + 2]) > 6) vels[idx].z *= -1;
            }
        }
    },
    heart: {
        name: '爱心',
        createPositions: (count) => {
            const positions = new Float32Array(count * 3);
            for (let i = 0; i < count; i++) {
                // 2D 爱心参数曲线，向内随机填充形成饱满心形
                const theta = Math.random() * Math.PI * 2;
                const shrink = Math.sqrt(Math.random()); // 偏向边缘
                let x = 16 * Math.pow(Math.sin(theta), 3);
                let y = 13 * Math.cos(theta) - 5 * Math.cos(2 * theta)
                      - 2 * Math.cos(3 * theta) - Math.cos(4 * theta);
                x *= shrink * 0.19;
                y *= shrink * 0.19;
                // 厚度：中心厚、边缘薄，形成立体心
                const thickness = 1.7 * Math.sqrt(Math.max(0, 1 - shrink * shrink));
                positions[i * 3] = x;
                positions[i * 3 + 1] = y + 0.5;
                positions[i * 3 + 2] = (Math.random() - 0.5) * thickness;
            }
            return positions;
        },
        animation: (particles, time, handData) => {
            const positions = particles.geometry.attributes.position.array;
            // 记录初始形状，心跳基于原始位置缩放（非累积变形）
            let base = particles.userData.basePositions;
            if (!base) base = particles.userData.basePositions = positions.slice();
            // 心跳节律：咚咚-停（双峰脉冲，周期约 1.3 秒）
            const t = (time * 0.75) % 1;
            let beat = 0;
            if (t < 0.15) beat = Math.sin(Math.PI * t / 0.15);
            else if (t > 0.25 && t < 0.45) beat = 0.6 * Math.sin(Math.PI * (t - 0.25) / 0.2);
            const scale = 1 + beat * 0.12;
            for (let i = 0; i < positions.length; i++) {
                positions[i] = base[i] * scale;
            }
        }
    },
    flower: {
        name: '花朵',
        createPositions: (count) => {
            const positions = new Float32Array(count * 3);
            const petals = 6;
            for (let i = 0; i < count; i++) {
                const petal = Math.floor(Math.random() * petals);
                const angle = (petal / petals) * Math.PI * 2;
                const radius = Math.random() * 2 + 0.5;
                const spread = Math.random() * 0.5;
                positions[i * 3] = Math.cos(angle) * radius + (Math.random() - 0.5) * spread;
                positions[i * 3 + 1] = (Math.random() - 0.5) * 0.5;
                positions[i * 3 + 2] = Math.sin(angle) * radius + (Math.random() - 0.5) * spread;
            }
            return positions;
        },
        animation: (particles, time, handData) => {
            const positions = particles.geometry.attributes.position.array;
            for (let i = 0; i < positions.length; i += 3) {
                const x = positions[i];
                const z = positions[i + 2];
                const dist = Math.sqrt(x * x + z * z);
                const angle = Math.atan2(z, x);
                const breathe = 1 + Math.sin(time * 2) * 0.05;
                positions[i] = Math.cos(angle) * dist * breathe;
                positions[i + 2] = Math.sin(angle) * dist * breathe;
                positions[i + 1] += Math.sin(time * 3 + dist * 2) * 0.002;
            }
        }
    },
    christmastree: {
        name: '圣诞树',
        createPositions: (count) => {
            const positions = new Float32Array(count * 3);
            // 树身占 70%：从顶到底逐渐变粗的锥形螺旋
            const treeCount = Math.floor(count * 0.7);
            for (let i = 0; i < treeCount; i++) {
                const t = i / treeCount;            // 0=顶 1=底
                const angle = t * Math.PI * 14;     // 螺旋缠绕彩灯感
                const radius = t * 1.7 + 0.08;
                const jitter = (Math.random() - 0.5) * 0.25 * t + 0.04;
                positions[i * 3] = Math.cos(angle) * (radius + jitter);
                positions[i * 3 + 1] = 2.6 - t * 5.2;
                positions[i * 3 + 2] = Math.sin(angle) * (radius + jitter);
            }
            // 顶部星形占 10%：五角星轮廓
            const starCount = Math.floor(count * 0.1);
            for (let s = 0; s < starCount; s++) {
                const pointIdx = Math.floor(Math.random() * 5);
                const outer = 0.55;
                const inner = outer * 0.42;
                const aOut = (pointIdx / 5) * Math.PI * 2 - Math.PI / 2;
                const aIn = aOut + Math.PI / 5;
                const f = Math.random(); // 在角点与内点之间插值
                const r = inner + (outer - inner) * f;
                const a = aIn + (aOut - aIn) * (Math.random() < 0.5 ? 0 : 1) + (Math.random() - 0.5) * 0.25;
                positions[(treeCount + s) * 3] = Math.cos(a) * r * (f * 0.6 + 0.4);
                positions[(treeCount + s) * 3 + 1] = 3.3 + Math.sin(a) * r;
                positions[(treeCount + s) * 3 + 2] = Math.sin(a) * r * (f * 0.6 + 0.4) * 0.3;
            }
            // 落雪占 20%：树周围的雪花
            for (let s = 0; s < count - treeCount - starCount; s++) {
                const idx = treeCount + starCount + s;
                const angle = Math.random() * Math.PI * 2;
                const radius = 2 + Math.random() * 3;
                positions[idx * 3] = Math.cos(angle) * radius;
                positions[idx * 3 + 1] = (Math.random() - 0.5) * 8;
                positions[idx * 3 + 2] = Math.sin(angle) * radius;
            }
            return positions;
        },
        animation: (particles, time, handData) => {
            const positions = particles.geometry.attributes.position.array;
            const count = positions.length / 3;
            const treeCount = Math.floor(count * 0.7);
            const starCount = Math.floor(count * 0.1);
            const snowCount = count - treeCount - starCount;
            // 记录树与星星的初始位置（雪花单独处理）
            if (!particles.userData.snowBase) {
                particles.userData.snowBase = true;
            }
            // 星星闪烁：顶部星微幅缩放
            let starBase = particles.userData.starBase;
            if (!starBase) starBase = particles.userData.starBase = positions.slice(treeCount * 3, (treeCount + starCount) * 3);
            const twinkle = 1 + Math.sin(time * 3) * 0.12;
            for (let s = 0; s < starCount; s++) {
                positions[(treeCount + s) * 3] = starBase[s * 3] * twinkle;
                positions[(treeCount + s) * 3 + 1] = starBase[s * 3 + 1] + (starBase[s * 3 + 1] - 3.3) * (twinkle - 1);
                positions[(treeCount + s) * 3 + 2] = starBase[s * 3 + 2] * twinkle;
            }
            // 雪花缓慢飘落 + 水平摆动，落到底部回到顶部
            let snowXZ = particles.userData.snowXZ;
            if (!snowXZ) snowXZ = particles.userData.snowXZ = [];
            for (let s = 0; s < snowCount; s++) {
                if (!snowXZ[s]) {
                    snowXZ[s] = { x: positions[(treeCount + starCount + s) * 3], z: positions[(treeCount + starCount + s) * 3 + 1] };
                }
                const idx = treeCount + starCount + s;
                let y = positions[idx * 3 + 1] - 0.25 - (s % 3) * 0.03; // 不同的雪花速度不同
                if (y < -4.5) y = 4.5;
                positions[idx * 3 + 1] = y;
                positions[idx * 3] = snowXZ[s].x + Math.sin(time * 1.2 + s) * 0.25;
                positions[idx * 3 + 2] = snowXZ[s].z + Math.cos(time + s * 0.7) * 0.2;
            }
        }
    },
    galaxy: {
        name: '星系',
        createPositions: (count) => {
            const positions = new Float32Array(count * 3);
            for (let i = 0; i < count; i++) {
                const arm = Math.floor(Math.random() * 3);
                const angle = arm * (Math.PI * 2 / 3) + Math.random() * 2;
                const radius = Math.random() * 5 + 0.5;
                const spread = Math.random() * 0.3;
                positions[i * 3] = Math.cos(angle) * radius + (Math.random() - 0.5) * spread;
                positions[i * 3 + 1] = (Math.random() - 0.5) * 0.5;
                positions[i * 3 + 2] = Math.sin(angle) * radius + (Math.random() - 0.5) * spread;
            }
            return positions;
        },
        animation: (particles, time, handData) => {
            const positions = particles.geometry.attributes.position.array;
            const count = positions.length / 3;
            for (let i = 0; i < count; i++) {
                const x = positions[i * 3];
                const z = positions[i * 3 + 2];
                const dist = Math.sqrt(x * x + z * z);
                const angle = Math.atan2(z, x);
                positions[i * 3] = Math.cos(angle + time * 0.1) * dist;
                positions[i * 3 + 2] = Math.sin(angle + time * 0.1) * dist;
            }
        }
    }
};

// ============== 全局变量 ==============
let scene, camera, renderer, composer;
let mainParticles, backgroundParticles;
let currentModel = 'nebula';
let particleColor = new THREE.Color(0x00ffff);
let particleDensity = 5000;
let glowIntensity = 1.5;
let rotationSpeed = 1;
let targetExpansion = 1;
let currentExpansion = 1;
let handData = { detected: false, palmOpen: 1, position: { x: 0, y: 0 } };

// 模型顺序（✌ 手势按此顺序循环切换）
const MODEL_ORDER = ['nebula', 'fireworks', 'heart', 'flower', 'christmastree', 'galaxy'];
const VICTORY_HOLD_FRAMES = 15; // ✌ 手势需保持的帧数（约 0.5~1 秒）
let victoryHoldFrames = 0;       // ✌ 手势已连续保持的帧数
let victoryLock = false;         // 触发切换后的锁，手势松开后解除

// MediaPipe
let hands, videoElement;
let cameraRunning = false;

// ============== 初始化 ==============
async function init() {
    try {
        setupScene();
        setupBackgroundParticles();
        createMainParticles(currentModel);
        setupPostProcessing();
        setupEventListeners();

        // Start animation immediately so particles render
        animate();

        // Try to setup MediaPipe, but don't block on failure
        setupMediaPipe().catch(err => {
            console.warn('MediaPipe initialization failed:', err);
        });
    } catch (err) {
        console.error('Initialization error:', err);
    } finally {
        // Always hide loading screen after a timeout
        setTimeout(hideLoadingScreen, 3000);
    }
}

function setupScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050510);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 8;

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // 光源
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x00ffff, 1, 100);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    const pointLight2 = new THREE.PointLight(0xff00ff, 0.8, 100);
    pointLight2.position.set(-10, -10, 10);
    scene.add(pointLight2);
}

function setupBackgroundParticles() {
    const bgCount = 3000;
    const bgGeometry = new THREE.BufferGeometry();
    const bgPositions = new Float32Array(bgCount * 3);
    const bgColors = new Float32Array(bgCount * 3);

    for (let i = 0; i < bgCount; i++) {
        bgPositions[i * 3] = (Math.random() - 0.5) * 100;
        bgPositions[i * 3 + 1] = (Math.random() - 0.5) * 100;
        bgPositions[i * 3 + 2] = (Math.random() - 0.5) * 100 - 30;

        const color = new THREE.Color();
        color.setHSL(Math.random(), 0.8, 0.6);
        bgColors[i * 3] = color.r;
        bgColors[i * 3 + 1] = color.g;
        bgColors[i * 3 + 2] = color.b;
    }

    bgGeometry.setAttribute('position', new THREE.BufferAttribute(bgPositions, 3));
    bgGeometry.setAttribute('color', new THREE.BufferAttribute(bgColors, 3));

    const bgMaterial = new THREE.PointsMaterial({
        size: 0.15,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });

    backgroundParticles = new THREE.Points(bgGeometry, bgMaterial);
    scene.add(backgroundParticles);
}

function createMainParticles(modelName) {
    if (mainParticles) {
        scene.remove(mainParticles);
        mainParticles.geometry.dispose();
        mainParticles.material.dispose();
    }

    const config = PARTICLE_CONFIG[modelName];
    const positions = config.createPositions(particleDensity);

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // 创建颜色数组
    const colors = new Float32Array(particleDensity * 3);
    const baseColor = new THREE.Color(particleColor);
    for (let i = 0; i < particleDensity; i++) {
        const hue = (Math.random() * 0.3 + baseColor.getHSL({}).h) % 1;
        const color = new THREE.Color().setHSL(hue, 1, 0.6);
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
    }
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 0.08,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true
    });

    mainParticles = new THREE.Points(geometry, material);
    mainParticles.userData.velocities = [];
    mainParticles.userData.config = config;
    scene.add(mainParticles);
}

function setupPostProcessing() {
    composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        glowIntensity,
        0.4,
        0.85
    );
    composer.addPass(bloomPass);

    // Store bloomPass for later updates
    window.bloomPass = bloomPass;
}

// ============== MediaPipe ==============

// 移动端检测
const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    || window.matchMedia('(max-width: 768px)').matches;

// 移动端优化参数
const CAMERA_WIDTH = isMobileDevice ? 320 : 640;
const CAMERA_HEIGHT = isMobileDevice ? 240 : 480;
const HAND_MODEL_COMPLEXITY = isMobileDevice ? 0 : 1; // 0=lite模型快 1=完整模型准
const HAND_MIN_DETECTION = isMobileDevice ? 0.5 : 0.7;
const HAND_MIN_TRACKING = isMobileDevice ? 0.4 : 0.5;

// MediaPipe 文件路径：全部本地托管，加载快且不依赖外部 CDN
const MP_CDN = 'libs/mediapipe';

// 帧处理节流：防止手机端帧堆积
let isProcessingHandFrame = false;

async function setupMediaPipe() {
    videoElement = document.getElementById('camera-video');
    const statusEl = document.getElementById('hand-status');

    // iOS Safari 需要用户手势才能启动摄像头，先挂一次性触摸监听
    if (isMobileDevice && /iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        statusEl.textContent = '点击页面任意位置启用手势';
        return new Promise((resolve) => {
            const startOnTouch = () => {
                document.removeEventListener('touchstart', startOnTouch);
                document.removeEventListener('click', startOnTouch);
                _setupMediaPipeCore().then(resolve);
            };
            document.addEventListener('touchstart', startOnTouch, { once: true });
            document.addEventListener('click', startOnTouch, { once: true });
        });
    }

    return _setupMediaPipeCore();
}

async function _setupMediaPipeCore() {
    const statusEl = document.getElementById('hand-status');

    // Check if MediaPipe is loaded
    console.log('Checking MediaPipe...', typeof window.Hands, typeof window.Camera);

    if (typeof window.Hands === 'undefined') {
        console.warn('MediaPipe scripts not loaded yet, waiting...');
        statusEl.textContent = '正在加载手势追踪...';

        // 等待脚本加载，移动端给更长时间
        let waited = 0;
        const maxWait = isMobileDevice ? 15000 : 10000;
        while (typeof window.Hands === 'undefined' && waited < maxWait) {
            await new Promise(r => setTimeout(r, 500));
            waited += 500;
        }

        if (typeof window.Hands === 'undefined') {
            console.error('MediaPipe scripts failed to load');
            statusEl.textContent = '手势追踪脚本加载失败，请刷新重试';
            return;
        }
    }

    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: CAMERA_WIDTH },
                height: { ideal: CAMERA_HEIGHT },
                facingMode: 'user'
            }
        });
        videoElement.srcObject = stream;
        videoElement.muted = true; // 静音，避免移动端自动播放被拦截
        videoElement.playsInline = true;
        await videoElement.play();
        cameraRunning = true;
        statusEl.textContent = '摄像头就绪，正在初始化手势追踪...';
    } catch (err) {
        console.warn('Camera access failed:', err);
        let reason = '摄像头不可用，手势追踪已停用';
        if (err.name === 'NotAllowedError') {
            reason = '摄像头权限被拒绝，请在浏览器设置中允许后刷新';
        } else if (err.name === 'NotFoundError' || err.name === 'OverconstrainedError') {
            reason = '未检测到可用摄像头设备';
        } else if (err.name === 'NotReadableError') {
            reason = '摄像头被其他程序占用，请关闭后刷新';
        } else if (err.name === 'NotSupportedError') {
            reason = '请使用 HTTPS 访问或 Safari/Chrome 浏览器';
        }
        statusEl.textContent = reason;
        return;
    }

    try {
        statusEl.textContent = '正在加载手势识别模型（首次需下载）...';

        hands = new window.Hands({
            locateFile: (file) => `${MP_CDN}/${file}`
        });

        hands.setOptions({
            maxNumHands: 1,
            modelComplexity: HAND_MODEL_COMPLEXITY,
            minDetectionConfidence: HAND_MIN_DETECTION,
            minTrackingConfidence: HAND_MIN_TRACKING,
            selfieMode: false
        });

        hands.onResults(onHandResults);

        // 手动帧驱动循环替代 MediaPipe Camera utils，便于节流控制
        const processFrame = async () => {
            if (hands && cameraRunning && videoElement.readyState >= 2 && !isProcessingHandFrame) {
                isProcessingHandFrame = true;
                try {
                    await hands.send({ image: videoElement });
                } catch (err) {
                    console.warn('Hand frame error:', err);
                }
                isProcessingHandFrame = false;
            }
            if (cameraRunning) {
                // 移动端降到约 15fps，PC 保持约 30fps
                setTimeout(processFrame, isMobileDevice ? 66 : 33);
            }
        };
        processFrame();

        statusEl.textContent = '等待手势...';
    } catch (err) {
        console.error('MediaPipe Hands loading failed:', err);
        statusEl.textContent = '手势追踪不可用';
    }
}

function onHandResults(results) {
    const statusEl = document.getElementById('hand-status');

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];
        handData.detected = true;
        statusEl.textContent = '已检测到手势';
        statusEl.classList.add('active');

        // 计算手掌开合程度
        const thumbTip = landmarks[4];
        const indexTip = landmarks[8];
        const middleTip = landmarks[12];
        const ringTip = landmarks[16];
        const pinkyTip = landmarks[20];

        const palmCenter = landmarks[9];
        const fingerTips = [indexTip, middleTip, ringTip, pinkyTip];

        let openCount = 0;
        fingerTips.forEach(tip => {
            const dist = Math.sqrt(
                Math.pow(tip.x - palmCenter.x, 2) +
                Math.pow(tip.y - palmCenter.y, 2)
            );
            if (dist > 0.15) openCount++;
        });

        handData.palmOpen = openCount / 4;
        targetExpansion = 0.5 + handData.palmOpen * 1.5;

        // 手部位置
        handData.position.x = (palmCenter.x - 0.5) * 10;
        handData.position.y = (palmCenter.y - 0.5) * 10;

        // ============== ✌ 手势：切换粒子模型 ==============
        // 手指伸直判定：指尖到手腕的距离 > 对应指根到手腕的距离 * 1.15
        const wrist = landmarks[0];
        const distTo = (a) => Math.hypot(a.x - wrist.x, a.y - wrist.y, (a.z - wrist.z) || 0);
        // 食指：根关节6、近端8  中指：根关节12、近端12... 标准索引：
        const fingerExtended = (tipIdx, pipIdx) =>
            distTo(landmarks[tipIdx]) > distTo(landmarks[pipIdx]) * 1.15;

        const indexExt  = fingerExtended(8, 6);    // 食指伸直
        const middleExt = fingerExtended(12, 10);   // 中指伸直
        const ringExt   = fingerExtended(16, 14);   // 无名指伸直
        const pinkyExt  = fingerExtended(20, 18);   // 小指伸直

        const isVictory = indexExt && middleExt && !ringExt && !pinkyExt;

        if (isVictory && !victoryLock) {
            victoryHoldFrames++;
            if (victoryHoldFrames >= VICTORY_HOLD_FRAMES) {
                switchToNextModel();
                victoryLock = true;
            }
        } else if (!isVictory) {
            victoryHoldFrames = 0;
            victoryLock = false;
        }
    } else {
        handData.detected = false;
        statusEl.textContent = '等待手势...';
        statusEl.classList.remove('active');
        targetExpansion = 1;
    }
}

// ============== 动画循环 ==============
function animate() {
    requestAnimationFrame(animate);

    const time = performance.now() * 0.001;

    // 平滑过渡
    currentExpansion += (targetExpansion - currentExpansion) * 0.05;

    // 旋转
    if (mainParticles) {
        if (handData.detected) {
            mainParticles.rotation.x = handData.position.y * 0.3;
            mainParticles.rotation.y = handData.position.x * 0.3;
        } else {
            mainParticles.rotation.y += 0.002 * rotationSpeed;
            mainParticles.rotation.x += 0.001 * rotationSpeed;
        }

        // 缩放
        mainParticles.scale.setScalar(currentExpansion);

        // 应用预设动画
        const config = mainParticles.userData.config;
        if (config && config.animation) {
            config.animation(mainParticles, time, handData);
        }

        // 更新颜色（基于旋转角度变化色相）
        const hueShift = (mainParticles.rotation.y % (Math.PI * 2)) / (Math.PI * 2);
        const colors = mainParticles.geometry.attributes.color.array;
        const baseHSL = {};
        particleColor.getHSL(baseHSL);

        for (let i = 0; i < colors.length / 3; i++) {
            const originalColor = new THREE.Color().setHSL(
                (baseHSL.h + hueShift + Math.random() * 0.1) % 1,
                1,
                0.6
            );
            colors[i * 3] = originalColor.r;
            colors[i * 3 + 1] = originalColor.g;
            colors[i * 3 + 2] = originalColor.b;
        }
        mainParticles.geometry.attributes.color.needsUpdate = true;
    }

    // 背景粒子缓慢漂移
    if (backgroundParticles) {
        backgroundParticles.rotation.y += 0.0002;
        backgroundParticles.rotation.x += 0.0001;
    }

    // Only render if composer is available
    if (composer) {
        composer.render();
    } else {
        renderer.render(scene, camera);
    }
}

// ✌ 手势触发：按顺序切换到下一个粒子模型，并同步右侧按钮高亮
function switchToNextModel() {
    const idx = MODEL_ORDER.indexOf(currentModel);
    currentModel = MODEL_ORDER[(idx + 1) % MODEL_ORDER.length];
    createMainParticles(currentModel);

    // 同步右侧面板按钮高亮
    document.querySelectorAll('.preset-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.model === currentModel);
    });

    // 在摄像头窗口短暂提示当前模型
    const statusEl = document.getElementById('hand-status');
    const prevText = statusEl.textContent;
    statusEl.textContent = '✌ 已切换：' + PARTICLE_CONFIG[currentModel].name;
    setTimeout(() => { statusEl.textContent = '已检测到手势'; }, 1500);
    console.log('✌ 切换模型:', PARTICLE_CONFIG[currentModel].name);
}

// ============== 事件监听 ==============
function setupEventListeners() {
    // 窗口调整大小
    window.addEventListener('resize', onWindowResize);

    // 模型选择按钮
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentModel = btn.dataset.model;
            createMainParticles(currentModel);
        });
    });

    // 颜色选择器
    document.getElementById('particle-color').addEventListener('input', (e) => {
        particleColor.set(e.target.value);
    });

    // 粒子密度
    document.getElementById('particle-density').addEventListener('input', (e) => {
        particleDensity = parseInt(e.target.value);
        document.getElementById('density-value').textContent = particleDensity;
        createMainParticles(currentModel);
    });

    // 辉光强度
    document.getElementById('glow-intensity').addEventListener('input', (e) => {
        glowIntensity = parseFloat(e.target.value);
        document.getElementById('glow-value').textContent = glowIntensity.toFixed(1);
        if (window.bloomPass) {
            window.bloomPass.strength = glowIntensity;
        }
    });

    // 旋转速度
    document.getElementById('rotation-speed').addEventListener('input', (e) => {
        rotationSpeed = parseFloat(e.target.value);
        document.getElementById('speed-value').textContent = rotationSpeed.toFixed(1);
    });

    // 全屏按钮
    document.getElementById('fullscreen-btn').addEventListener('click', toggleFullscreen);

    // 摄像头窗口大小调整
    let cameraSizeIndex = 0;
    const cameraSizes = ['', 'small', 'mini'];
    document.getElementById('camera-resize-btn').addEventListener('click', () => {
        const cameraWindow = document.getElementById('camera-window');
        cameraSizeIndex = (cameraSizeIndex + 1) % cameraSizes.length;
        cameraWindow.className = 'camera-window ' + cameraSizes[cameraSizeIndex];
    });

    // 关闭摄像头窗口
    document.getElementById('camera-close-btn').addEventListener('click', () => {
        document.getElementById('camera-window').classList.add('hidden');
    });

    // 重新打开摄像头窗口
    document.getElementById('camera-window').addEventListener('dblclick', () => {
        document.getElementById('camera-window').classList.remove('hidden');
    });

    // 手势指南侧边栏：收起与展开
    const guidePanel = document.getElementById('guide-panel');
    const guideToggleBtn = document.getElementById('guide-toggle-btn');

    document.getElementById('guide-close-btn').addEventListener('click', () => {
        guidePanel.classList.add('hidden');
        guideToggleBtn.classList.add('visible');
    });

    guideToggleBtn.addEventListener('click', () => {
        guidePanel.classList.remove('hidden');
        guideToggleBtn.classList.remove('visible');
    });

    // 手机端控制面板：点击标题栏展开/收起（点按钮和滑块本身不触发）
    const controlPanel = document.querySelector('.control-panel');
    controlPanel.addEventListener('click', (e) => {
        if (window.matchMedia('(max-width: 768px)').matches) {
            // 点击的是控件（按钮/滑块/颜色选择）时不折叠，避免误触
            if (e.target.closest('.preset-btn, input')) return;
            controlPanel.classList.toggle('expanded');
        }
    });
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.warn('全屏模式不可用:', err);
        });
    } else {
        document.exitFullscreen();
    }
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen && !loadingScreen.classList.contains('hidden')) {
        loadingScreen.classList.add('hidden');
    }
}

// 启动
init();
