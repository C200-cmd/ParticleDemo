# ParticleDemo

Real-time 3D particle vision system with hand tracking using Three.js and MediaPipe.

## Features

- **Hand Tracking Interaction** - Control particle models with hand gestures via webcam
  - Palm open/close to expand/contract particles
  - Hand position to rotate the model

- **Multiple Particle Presets** - 6 beautiful 3D particle models:
  - Nebula
  - Fireworks
  - Saturn
  - Flower
  - Spiral
  - Galaxy

- **Visual Effects**
  - Glowing particles with bloom post-processing
  - Colorful rainbow particles
  - Hue shifts based on rotation angle
  - Deep space background particles for depth

- **Controls**
  - Particle color picker
  - Particle density slider (1,000 - 20,000)
  - Glow intensity adjustment
  - Rotation speed control

- **UI Features**
  - Fullscreen mode
  - Resizable camera preview window
  - Modern glassmorphism design

## Tech Stack

- **Three.js** - 3D rendering and particle systems
- **MediaPipe Hands** - Real-time hand tracking
- **WebGL** - GPU-accelerated graphics

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- Webcam access
- Internet connection (for CDN resources)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/han04/ParticleDemo.git
cd ParticleDemo
```

2. Open `index.html` in a web browser

Or use a local server:
```bash
# Python 3
python -m http.server 8000

# Node.js
npx serve
```

Then visit `http://localhost:8000`

## Usage

1. Allow camera access when prompted
2. Show your hand to the camera
3. Open/close your palm to expand/contract particles
4. Move your hand to rotate the model
5. Use the control panel on the right to switch models and adjust settings

## Project Structure

```
ParticleDemo/
├── index.html          # Main HTML file
├── css/
│   └── style.css       # Styles
├── js/
│   └── app.js          # Main application logic
└── README.md           # This file
```

## Browser Compatibility

| Browser | Status |
|---------|--------|
| Chrome  | ✅ Recommended |
| Firefox | ✅ Supported |
| Safari  | ✅ Supported |
| Edge    | ✅ Supported |

## License

MIT License - feel free to use and modify.

## Acknowledgments

- [Three.js](https://threejs.org/) - 3D library
- [MediaPipe Hands](https://google.github.io/mediapipe/solutions/hands) - Hand tracking solution
