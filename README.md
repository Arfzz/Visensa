<p align="center">
  <img src="public/favicon.svg" width="80" alt="Visensa Logo" />
</p>

<h1 align="center">Visensa</h1>

<p align="center">
  <strong>AI-Powered Hand Rehabilitation Platform with Real-Time 3D Visualization</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.x-61DAFB?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Vite-8.x-646CFF?style=flat-square&logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/Three.js-r185-000000?style=flat-square&logo=three.js" alt="Three.js" />
  <img src="https://img.shields.io/badge/MediaPipe-Vision_AI-4285F4?style=flat-square&logo=google" alt="MediaPipe" />
  <img src="https://img.shields.io/badge/Deploy-Vercel-000000?style=flat-square&logo=vercel" alt="Vercel" />
</p>

---

## 📖 Overview

**Visensa** (*Visualizing Your Recovery*) is a web-based rehabilitation platform that leverages Artificial Intelligence to track hand movements in real-time via webcam and visualize them on a 3D robotic prosthetic arm model. The platform aims to make physiotherapy interactive, accessible, and data-driven — all within a browser, with zero software installation required.

### Key Highlights
- 🤖 **AI Hand Tracking** — MediaPipe detects 21 hand landmarks at 60 FPS directly in the browser.
- 🦾 **3D Prosthetic Arm** — Real-time mirroring of hand movements onto a rigged 3D robotic arm model using React Three Fiber.
- 🧠 **Kinematics Engine** — Kalidokit translates 2D/3D landmark coordinates into accurate bone rotations (Euler/Quaternion).
- 🎨 **Premium UI/UX** — Glassmorphism design, GSAP scroll animations, Lenis smooth scrolling, and Space Grotesk typography.
- 🔒 **Privacy-First** — All AI processing runs locally on the user's device. No video is sent to any server.

---

## 🛠️ Tech Stack

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | React 19 + Vite 8 | Core SPA framework with lightning-fast HMR |
| **3D Engine** | React Three Fiber + Three.js | WebGL rendering for the 3D prosthetic model |
| **AI / Vision** | MediaPipe Tasks-Vision | Real-time hand landmark detection |
| **Kinematics** | Kalidokit | MediaPipe → bone rotation conversion |
| **State** | Zustand | Lightweight global state for tracking data |
| **Animation** | GSAP + Lenis | Scroll-triggered animations & smooth scrolling |
| **Routing** | React Router DOM v7 | Client-side page navigation |
| **Backend** | Firebase | Authentication & data persistence |
| **Deployment** | Vercel | Automated CI/CD from GitHub |

---

## 📂 Project Structure

```
src/
├── assets/              # Static images, SVGs, icons
├── components/          # Reusable UI components
│   ├── reactbits/       # Animation components (TextType, SpotlightCard)
│   ├── sections/        # Landing page sections (Hero, Features, Testimonial)
│   ├── ui/              # Small UI elements (Navbar, Preloader, Footer)
│   ├── VisensaCanvas.jsx  # R3F canvas for 3D model rendering
│   └── VisionTracker.jsx  # MediaPipe camera + AI pipeline
├── hooks/               # Custom React Hooks
│   ├── useGsapAnimations.js  # GSAP ScrollTrigger logic
│   ├── useHeroAnimation.js   # Hero section animation sequence
│   ├── useExerciseTracker.js # Exercise progress tracking
│   └── useLenis.js           # Smooth scrolling initialization
├── models/              # GLTF/GLB → React components (3D arm model)
├── pages/               # Page-level components (routes)
│   ├── admin-dashboard/ # Analytics & management dashboard
│   ├── camera/          # Active rehabilitation session UI
│   ├── intro/           # Pre-session camera preview
│   ├── login/           # User & Doctor authentication
│   ├── register/        # User & Doctor registration
│   └── session-complete/ # Post-session summary
├── services/            # External integrations
│   ├── kalidokit/       # Kalidokit rotation bridge
│   └── mediapipe/       # MediaPipe Hand Landmarker setup
├── store/zustand/       # Global state management
├── styles/              # Modular CSS files
├── App.jsx              # Root routing & global hooks
└── index.css            # Global styles & CSS variables
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18 or higher
- **npm** v9 or higher
- A device with a **webcam**

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Arfzz/Visensa.git
cd Visensa

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Start development server with HMR |
| `npm run build` | Build for production (output to `dist/`) |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint to check code quality |

---

## 🔄 AI Tracking Pipeline

The core of Visensa is the real-time synchronization between the physical webcam and the virtual 3D model:

```
┌──────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Webcam  │───▶│ VisionTracker.jsx│───▶│ MediaPipe Hand  │
│  Feed    │    │ (Frame capture)  │    │ Landmarker (AI) │
└──────────┘    └──────────────────┘    └────────┬────────┘
                                                 │
                                    Extract 21 3D landmarks
                                                 │
                                                 ▼
┌──────────────────┐    ┌──────────────────┐    ┌─────────────┐
│ VisensaCanvas.jsx│◀───│ Kalidokit Solver │◀───│ Zustand     │
│ (R3F 3D Render)  │    │ (Bone Rotations) │    │ VisionStore │
└──────────────────┘    └──────────────────┘    └─────────────┘
```

1. **VisionTracker** captures webcam frames and processes them through MediaPipe.
2. Extracted hand landmarks are stored in **Zustand** (`VisionStore`).
3. **Kalidokit** reads the store and computes inverse kinematics (bone rotations).
4. **VisensaCanvas** applies rotations to the 3D prosthetic arm model at 60 FPS.

---

## 📄 Available Routes

| Route | Description |
| :--- | :--- |
| `/` | Landing page with hero, features, and testimonials |
| `/login` | Patient login |
| `/register` | Patient registration |
| `/login-doctor` | Doctor/therapist login |
| `/register-doctor` | Doctor/therapist registration |
| `/intro` | Pre-session camera preview & exercise selection |
| `/camera` | Active rehabilitation session with 3D tracking |
| `/session-complete` | Post-session results summary |
| `/tracking-3d` | Standalone 3D tracking playground |
| `/admin-dashboard` | Doctor analytics dashboard |

---

## 🌐 Deployment

This project is deployed on **Vercel** with automatic CI/CD. Every push to the `main` branch triggers an automatic rebuild and deployment.

The `vercel.json` configuration handles SPA routing rewrites to prevent 404 errors on direct URL access.

---

## 🤝 Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m "feat: add amazing feature"`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request to the `develop` branch.

### Branch Strategy
- **`main`** — Production-ready code (auto-deployed to Vercel).
- **`develop`** — Active development branch. All PRs target this branch first.

---

## 📜 License

This project is developed as part of an academic research initiative.

---

<p align="center">
  <strong>Visensa</strong> — <em>Visualizing Your Recovery</em>
</p>
