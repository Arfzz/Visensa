import { useEffect, useRef, useState } from 'react';
import { setupMediaPipe } from '../services/mediapipe/visionSetup'; 
import { useVisionStore } from '../store/zustand/VisionStore'; 

export default function VisionTracker({ showCanvas = true }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const requestRef = useRef(null); 
  
  const [landmarker, setLandmarker] = useState(null);

  // 1. Load Model
  useEffect(() => {
    setupMediaPipe().then((ai) => {
      setLandmarker(ai);
      useVisionStore.getState().setModelReady(true);
    }).catch(err => console.error("Gagal load model:", err));
  }, []);

  // 2. Auto-Start Kamera Pas Komponen Dipanggil
  useEffect(() => {
    if (!landmarker) return;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 640, height: 480 } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.addEventListener("loadeddata", predictWebcam);
        }
      } catch (err) {
        console.error("Gagal akses kamera:", err);
      }
    };

    startCamera();

    // Matiin kamera otomatis pas pindah halaman
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [landmarker]);

  // 3. Looping Deteksi & Update Zustand
  const predictWebcam = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !landmarker) return;

    const ctx = canvas?.getContext("2d");
    if (canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    let lastVideoTime = -1;
    let frameCount = 0; 
    const REQUIRED_FRAMES = 60; 
    
    // --- TAMBAHAN OPTIMASI: REM KHUSUS BUAT POSE ---
    let lastPoseDetectTime = 0;
    const POSE_FPS = 12; // Sweet spot: responsif tapi tetap hemat GPU
    const POSE_THROTTLE_MS = 1000 / POSE_FPS;

    const renderLoop = () => {
      let startTimeMs = performance.now();
      
      if (video.currentTime !== lastVideoTime) {
        lastVideoTime = video.currentTime;
        
        // 1. HAND TETEP GASPOL (Ngikutin FPS kamera lu, biasanya 30 FPS)
        const handResults = landmarker.hand.detectForVideo(video, startTimeMs);
        
        // 2. POSE DI-REM (Cuma jalan tiap ~83ms)
        let poseResults = null;
        if (startTimeMs - lastPoseDetectTime >= POSE_THROTTLE_MS) {
          poseResults = landmarker.pose.detectForVideo(video, startTimeMs);
          lastPoseDetectTime = startTimeMs;
        }
        
        if (showCanvas && ctx && canvas) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        
        const visionState = useVisionStore.getState();
        
        // --- BLOK HAND (Sama persis kayak sebelumnya) ---
        if (handResults.landmarks && handResults.landmarks.length > 0) {
          if (visionState.calibrationWarning) {
            visionState.setCalibrationWarning(false);
          }
          visionState.setLandmarks(handResults.landmarks[0]);
          
          if (handResults.handedness && handResults.handedness[0] && handResults.handedness[0][0]) {
            const side = handResults.handedness[0][0].categoryName || handResults.handedness[0][0].label;
            visionState.setHandedness(side);
          }

          if (showCanvas && ctx && canvas) {
            for (const landmark of handResults.landmarks[0]) {
              const x = landmark.x * canvas.width;
              const y = landmark.y * canvas.height;
              ctx.beginPath();
              ctx.arc(x, y, 5, 0, 2 * Math.PI);
              ctx.fillStyle = "#00FF00";
              ctx.fill();
            }
          }
          
          if (!visionState.isCalibrated) {
            frameCount++;
            let progress = Math.min((frameCount / REQUIRED_FRAMES) * 100, 100);
            visionState.setCalibrationProgress(progress);
            if (frameCount >= REQUIRED_FRAMES) {
              visionState.setCalibrated(true);
            }
          }
        } else {
          if (!visionState.isCalibrated) {
            if (frameCount > 0 && !visionState.calibrationWarning) {
              visionState.setCalibrationWarning(true);
            }
            frameCount = 0;
            if (visionState.calibrationProgress > 0) {
              visionState.setCalibrationProgress(0);
            }
          } else {
            visionState.setLandmarks(null);
          }
        }

        // --- BLOK POSE (Update Zustand cuma kalau AI-nya pas lagi jalan) ---
        if (poseResults) { 
          if (poseResults.landmarks && poseResults.landmarks.length > 0) {
            visionState.setPoseLandmarks(
              poseResults.landmarks[0], 
              poseResults.worldLandmarks[0]
            );
            
            if (showCanvas && ctx && canvas) {
              const lenganLandmarks = [14, 16]; 
              for (const index of lenganLandmarks) {
                const landmark = poseResults.landmarks[0][index];
                if (landmark) {
                  const x = landmark.x * canvas.width;
                  const y = landmark.y * canvas.height;
                  ctx.beginPath();
                  ctx.arc(x, y, 6, 0, 2 * Math.PI);
                  ctx.fillStyle = "#FF0000"; 
                  ctx.fill();
                }
              }
            }
          } else {
            // Kalau pas lagi ngecek ternyata badan lu ilang dari kamera
            visionState.setPoseLandmarks(null, null);
          }
        }
      }
      
      requestRef.current = requestAnimationFrame(renderLoop);
    };
    
    renderLoop();
  };

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: "640px", margin: "0 auto" }}>
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        style={{ transform: "scaleX(-1)", width: "100%", background: "#1f2937", borderRadius: "8px" }} 
      />
      {/* Canvas cuma dirender kalau props showCanvas true */}
      {showCanvas && (
        <canvas 
          ref={canvasRef} 
          style={{ position: "absolute", top: 0, left: 0, transform: "scaleX(-1)", width: "100%", height: "100%" }} 
        />
      )}
    </div>
  );
}