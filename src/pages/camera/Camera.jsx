import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { VisensaCanvas } from "../../components/VisensaCanvas";
import VisionTracker from "../../components/VisionTracker";
import { useKalidokitBridge } from "../../services/kalidokit/useKalidokitBridge";
import LeftHandWarningModal from "../../components/LeftHandWarningModal";
import { useExerciseStore } from "../../store/zustand/useExerciseStore";

// Data Exercises dengan tambahan instruksi detail dan repetisi
const exercises = [
  {
    id: 1,
    title: "Open & close — gentle",
    duration: 60,
    reps: 12,
    instruction: "Slowly extend your fingers outward, then let them relax back",
  },
  {
    id: 2,
    title: "Wrist flexion/extension",
    duration: 60,
    reps: 10,
    instruction:
      "Bend your wrist upward like a stop gesture, then flex it downward",
  },
  {
    id: 3,
    title: "Pinch grip — coin",
    duration: 60,
    reps: 12,
    instruction:
      "Pinch the tip of your thumb and index finger together like holding a coin, then release",
  },
  {
    id: 4,
    title: "Wrist deviation — floating",
    duration: 60,
    reps: 15,
    instruction:
      "Wave or tilt your wrist horizontally to the left and right without rotating arm",
  },
  {
    id: 5,
    title: "Finger tap sequence",
    duration: 60,
    reps: 12,
    instruction:
      "Tap each finger gently on a flat surface in a continuous sequence",
  },
  {
    id: 6,
    title: "Static open hold",
    duration: 60,
    reps: 10,
    instruction:
      "Hold your palm open and still in a neutral relaxed position",
  },
  {
    id: 7,
    title: "Single finger lift",
    duration: 60,
    reps: 15,
    instruction:
      "Gently lift individual fingers one by one while keeping palm flat",
  },
  {
    id: 8,
    title: "Fist hold",
    duration: 60,
    reps: 10,
    instruction:
      "Make a tight fist and hold it for 10 seconds",
  },
];

const Camera = () => {
  useKalidokitBridge();
  const navigate = useNavigate();

  // Zustand Store Synchronization
  const activeExerciseId = useExerciseStore((state) => state.activeExerciseId);
  const setActiveExerciseId = useExerciseStore((state) => state.setActiveExerciseId);
  const currentStep = Math.max(0, activeExerciseId - 1);

  // States Utama
  const [cameraStatus, setCameraStatus] = useState("requesting");
  const [timeLeft, setTimeLeft] = useState(exercises[0].duration);

  // State untuk Modal Pause 
  const [isPaused, setIsPaused] = useState(false);

  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);

  // Logika Timer
  useEffect(() => {
    if (cameraStatus !== "granted" || isPaused) return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          if (currentStep < exercises.length - 1) {
            setActiveExerciseId(currentStep + 2);
            return exercises[currentStep + 1].duration;
          }
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cameraStatus, isPaused, currentStep, setActiveExerciseId]);

  // Logika Izin Kamera
  const handleRequestPermission = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
      });
      setStream(mediaStream);
      setCameraStatus("success");
      setTimeout(() => {
        setCameraStatus("granted");
      }, 2000);
    } catch (error) {
      console.error("Camera error:", error);
      setCameraStatus("blocked");
    }
  };

  // Efek Menyambungkan Kamera
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, cameraStatus]);

  // Cleanup Kamera
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  // Handler Tombol Rest
  const handleRest = () => {
    setIsPaused(false);
    setTimeLeft((prev) => prev + 60);
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        backgroundColor: "#0C1119",
        position: "relative",
        overflow: "hidden",
        fontFamily: "Space Grotesk, sans-serif",
      }}
    >
      {/* ELEMEN VIDEO KAMERA (original) */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: "scaleX(-1)",
          zIndex: 0,
          opacity: cameraStatus === "granted" ? 1 : 0,
          transition: "opacity 1s ease-in-out",
        }}
      />

      {/* 3D TRACKING SCENE — overlay transparan di atas video */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          pointerEvents: "none",
        }}
      >
        <VisensaCanvas />
        <LeftHandWarningModal />
      </div>

      {/* VisionTracker — tersembunyi, jalan saat izin kamera sudah diberikan */}
      {cameraStatus === "granted" && (
        <div
          style={{
            position: "absolute",
            width: 0,
            height: 0,
            overflow: "hidden",
            opacity: 0,
          }}
        >
          <VisionTracker showCanvas={false} />
        </div>
      )}

      {/* GLOW & BLUR OVERLAYS */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          background:
            "radial-gradient(ellipse 50.00% 60.00% at 30.00% 50.00%, rgba(59, 184, 176, 0.05) 0%, rgba(0, 0, 0, 0) 55%), radial-gradient(ellipse 50.00% 60.00% at 70.00% 50.00%, rgba(59, 184, 176, 0.04) 0%, rgba(0, 0, 0, 0) 55%)",
          zIndex: 2,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          background:
            "radial-gradient(ellipse 55.00% 65.00% at 50.00% 50.00%, rgba(0, 0, 0, 0) 25%, rgba(12, 17, 25, 0.55) 80%, rgba(12, 17, 25, 0.88) 100%)",
          zIndex: 2,
          pointerEvents: "none",
        }}
      />

      {/* HEADER BARS */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          paddingTop: "19.98px",
          paddingLeft: "24.97px",
          paddingRight: "24.97px",
          top: 0,
          left: 0,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          zIndex: 10,
        }}
      >
        {/* Tombol Kiri (Pause Saja) */}
        <div style={{ display: "flex", gap: "9.99px" }}>
          <div
            onClick={() => setIsPaused(true)}
            style={{
              width: "44.95px",
              height: "44.95px",
              background: "rgba(255, 255, 255, 0.10)",
              borderRadius: "50%",
              outline: "1.25px rgba(255, 255, 255, 0.12) solid",
              outlineOffset: "-1.25px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <div style={{ display: "flex", gap: "3px" }}>
              <div
                style={{
                  width: "2.71px",
                  height: "10.82px",
                  border: "1.35px solid #F2EDE8",
                }}
              />
              <div
                style={{
                  width: "2.71px",
                  height: "10.82px",
                  border: "1.35px solid #F2EDE8",
                }}
              />
            </div>
          </div>
        </div>

        {/* Progress Circle (Kanan) */}
        <div style={{ display: "flex", alignItems: "center", gap: "9.99px" }}>
          <div
            style={{
              position: "relative",
              width: "44.95px",
              height: "44.95px",
            }}
          >
            <svg width="45" height="45" style={{ transform: "rotate(-90deg)" }}>
              <circle
                cx="22.5"
                cy="22.5"
                r="20"
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="3.12"
              />
              <circle
                cx="22.5"
                cy="22.5"
                r="20"
                fill="none"
                stroke="#0099A6"
                strokeWidth="3.12"
                strokeDasharray={125.6}
                strokeDashoffset={125.6 * (1 - (currentStep + 1) / 8)}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 0.5s ease" }}
              />
            </svg>
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "#F2EDE8",
                fontSize: "9.99px",
                fontFamily: "Space Mono",
                fontWeight: "700",
              }}
            >
              {currentStep + 1}
            </div>
          </div>
          <div
            style={{
              color: "white",
              fontSize: "12.49px",
              fontFamily: "Space Mono",
              letterSpacing: "1.87px",
            }}
          ></div>
        </div>
      </div>

      {/* BOTTOM BAR (Teks Instruksi Detail) */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          width: "100%",
          height: "180px",
          background:
            "linear-gradient(0deg, rgba(12, 17, 25, 0.85) 0%, rgba(12, 17, 25, 0.45) 60%, rgba(0, 0, 0, 0) 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-end",
          paddingBottom: "25px",
          zIndex: 10,
        }}
      >
        <div
          style={{ display: "flex", gap: "7.49px", marginBottom: "24.97px" }}
        >
          {exercises.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === currentStep ? "27.47px" : "7.49px",
                height: "7.49px",
                background:
                  i === currentStep ? "#3BB8B0" : "rgba(255, 255, 255, 0.15)",
                borderRadius: "10px",
                transition: "all 0.3s",
                boxShadow:
                  i === currentStep
                    ? "0px 0px 12.48px rgba(200, 112, 74, 0.60)"
                    : "none",
              }}
            />
          ))}
        </div>
        <div
          style={{
            color: "#A6C8FF",
            fontSize: "12.49px",
            fontFamily: "Space Mono",
            textTransform: "uppercase",
            letterSpacing: "1.87px",
            marginBottom: "9.99px",
          }}
        >
          Exercise {currentStep + 1} of 8
        </div>
        <div
          style={{
            color: "#F2EDE8",
            fontSize: "37.46px",
            fontFamily: "Space Grotesk",
            fontWeight: "600",
            textAlign: "center",
            maxWidth: "800px",
            lineHeight: "46.82px",
            padding: "0 20px",
          }}
        >
          {exercises[currentStep].instruction}
        </div>
      </div>

      {/* SIDEBAR EXERCISES (Kanan) */}
      <div
        style={{
          position: "absolute",
          right: "24.97px",
          top: "50%",
          transform: "translateY(-50%)",
          width: "234.72px",
          zIndex: 20,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: "-17.48px",
            top: "50%",
            transform: "translateY(-50%)",
            width: "34.96px",
            height: "34.96px",
            background: "white",
            borderRadius: "9.99px",
            outline: "1.25px rgba(0, 0, 0, 0.10) solid",
            outlineOffset: "-1.25px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
            zIndex: 21,
          }}
        >
          <span style={{ fontSize: "14px", color: "rgba(0,0,0,0.5)" }}>
            &lt;
          </span>
        </div>

        <div
          style={{
            background: "white",
            borderRadius: "17.48px",
            outline: "1.25px rgba(255, 255, 255, 0.08) solid",
            outlineOffset: "-1.25px",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              padding: "12.49px 14.98px 7.49px",
              borderBottom: "1.25px solid rgba(0,0,0, 0.06)",
            }}
          >
            <div
              style={{
                color: "rgba(0, 0, 0, 0.30)",
                fontSize: "11.24px",
                fontFamily: "Space Mono",
                letterSpacing: "1.35px",
              }}
            >
              EXERCISES
            </div>
          </div>

          <div
            style={{
              maxHeight: "380px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {exercises.map((item, index) => {
              const isCompleted = index < currentStep;
              const isActive = index === currentStep;

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setActiveExerciseId(item.id);
                    setTimeLeft(exercises[index].duration);
                  }}
                  style={{
                    padding: "9.99px 14.98px",
                    display: "flex",
                    alignItems: "center",
                    gap: "9.99px",
                    background: isActive
                      ? "rgba(200, 112, 74, 0.08)"
                      : "transparent",
                    borderLeft: isActive
                      ? "2.5px solid #0099A6"
                      : "2.5px solid transparent",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      width: "19.98px",
                      height: "19.98px",
                      borderRadius: "50%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      background: isCompleted
                        ? "rgba(75, 168, 130, 0.20)"
                        : isActive
                          ? "rgba(0, 153, 166, 0.1)"
                          : "rgba(0, 0, 0, 0.05)",
                      outline: isCompleted
                        ? "1.25px rgba(75, 168, 130, 0.40) solid"
                        : isActive
                          ? "1.25px rgba(0, 153, 166, 0.4) solid"
                          : "1.25px rgba(0, 0, 0, 0.10) solid",
                      outlineOffset: "-1.25px",
                    }}
                  >
                    {isCompleted ? (
                      <span
                        style={{
                          color: "#4BA882",
                          fontSize: "10px",
                          fontWeight: "bold",
                        }}
                      >
                        ✓
                      </span>
                    ) : (
                      <span
                        style={{
                          color: "rgba(0, 0, 0, 0.25)",
                          fontSize: "8.74px",
                          fontFamily: "Space Mono",
                          fontWeight: "700",
                        }}
                      >
                        {item.id}
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      color:
                        isCompleted || isActive
                          ? "rgba(0, 0, 0, 0.8)"
                          : "rgba(0, 0, 0, 0.45)",
                      fontSize: "12.49px",
                      fontFamily: "Space Grotesk",
                      fontWeight: isActive ? "600" : "400",
                      lineHeight: "16.23px",
                      flex: 1,
                    }}
                  >
                    {item.title}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* MODALS POP-UP PERMISSION */}
      {cameraStatus !== "granted" && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(12, 17, 25, 0.6)",
            backdropFilter: "blur(8px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 100,
          }}
        >
          {cameraStatus === "requesting" && (
            <div
              style={{
                width: "420px",
                padding: "32px",
                background: "white",
                boxShadow: "0px 8px 40px rgba(28, 24, 22, 0.08)",
                borderRadius: "16px",
                outline: "1px #DCE7E8 solid",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: "100%",
                  padding: "16px",
                  background: "rgba(74, 195.8, 200, 0.08)",
                  borderRadius: "14px",
                  outline: "1px rgba(74, 200, 189.5, 0.18) solid",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  position: "relative",
                  marginBottom: "32px",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "-11.25px",
                    background: "#0099A6",
                    borderRadius: "20px",
                    padding: "4px 10px",
                    color: "white",
                    fontSize: "9px",
                    fontFamily: "Space Mono",
                    textTransform: "uppercase",
                  }}
                >
                  Look at the top of your screen ↑
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "8px",
                    alignSelf: "flex-start",
                  }}
                >
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      background: "#9AA6A5",
                      borderRadius: "50%",
                    }}
                  />
                  <div
                    style={{
                      color: "#9AA6A5",
                      fontSize: "10px",
                      fontFamily: "Space Mono",
                      textTransform: "uppercase",
                      letterSpacing: "1.5px",
                    }}
                  >
                    Browser permission prompt appears here
                  </div>
                </div>
                <div
                  style={{
                    width: "100%",
                    height: "64px",
                    background: "rgba(255, 255, 255, 0.5)",
                    borderRadius: "14px",
                    outline: "1px rgba(0, 0, 0, 0.05) solid",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      textAlign: "center",
                      color: "#445570",
                      fontSize: "11px",
                      fontFamily: "Space Mono",
                      textTransform: "uppercase",
                      letterSpacing: "1.65px",
                    }}
                  >
                    'visensa.app wants to use your camera' · [Block] [Allow]
                  </div>
                </div>
              </div>
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  background: "rgba(59, 184, 176, 0.08)",
                  borderRadius: "16px",
                  outline: "1px rgba(59, 184, 176, 0.20) solid",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: "16px",
                }}
              >
                <span style={{ fontSize: "24px", color: "#3BB8B0" }}>📷</span>
              </div>
              <div
                style={{
                  textAlign: "center",
                  color: "#1C1816",
                  fontSize: "22px",
                  fontFamily: "Space Grotesk",
                  fontWeight: "700",
                  marginBottom: "8px",
                }}
              >
                Allow camera access to begin
              </div>
              <div
                style={{
                  textAlign: "center",
                  color: "#606B6A",
                  fontSize: "14px",
                  fontFamily: "Space Grotesk",
                  lineHeight: "22.75px",
                  marginBottom: "24px",
                }}
              >
                Your browser will ask for permission. Click{" "}
                <span style={{ color: "#0099A6", fontWeight: "700" }}>
                  "Allow"
                </span>{" "}
                when the prompt appears at the top of your screen.
              </div>
              <button
                onClick={handleRequestPermission}
                style={{
                  width: "100%",
                  padding: "15px",
                  background: "#0099A6",
                  boxShadow: "0px 4px 17px rgba(200, 112, 74, 0.28)",
                  borderRadius: "30px",
                  border: "none",
                  color: "white",
                  fontSize: "15px",
                  fontFamily: "Space Grotesk",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                📷 Request camera access
              </button>
            </div>
          )}

          {cameraStatus === "success" && (
            <div
              style={{
                width: "420px",
                padding: "32px",
                background: "white",
                boxShadow: "0px 8px 40px rgba(28, 24, 22, 0.08)",
                borderRadius: "16px",
                outline: "1px #DCE7E8 solid",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  background: "rgba(75, 168, 130, 0.08)",
                  borderRadius: "16px",
                  outline: "1px rgba(75, 168, 130, 0.20) solid",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: "16px",
                }}
              >
                <span style={{ fontSize: "24px", color: "#4BA882" }}>✓</span>
              </div>
              <div
                style={{
                  textAlign: "center",
                  color: "#1C1816",
                  fontSize: "22px",
                  fontFamily: "Space Grotesk",
                  fontWeight: "700",
                  marginBottom: "8px",
                }}
              >
                Camera connected
              </div>
              <div
                style={{
                  textAlign: "center",
                  color: "#606B6A",
                  fontSize: "14px",
                  fontFamily: "Space Grotesk",
                  lineHeight: "22.75px",
                  marginBottom: "24px",
                }}
              >
                We can see your camera. Now let's make sure you're positioned
                correctly.
              </div>
              <button
                style={{
                  width: "100%",
                  padding: "15px",
                  background: "#0099A6",
                  boxShadow: "0px 4px 17px rgba(200, 112, 74, 0.28)",
                  borderRadius: "30px",
                  border: "none",
                  color: "white",
                  fontSize: "15px",
                  fontFamily: "Space Grotesk",
                  fontWeight: "600",
                }}
              >
                Continue to camera setup →
              </button>
            </div>
          )}

          {cameraStatus === "blocked" && (
            <div
              style={{
                width: "420px",
                padding: "32px",
                background: "white",
                boxShadow: "0px 8px 40px rgba(28, 24, 22, 0.08)",
                borderRadius: "16px",
                outline: "1px #DCE7E8 solid",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  background: "rgba(200, 112, 74, 0.08)",
                  borderRadius: "16px",
                  outline: "1px rgba(200, 112, 74, 0.20) solid",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: "16px",
                }}
              >
                <span style={{ fontSize: "24px", color: "#C8704A" }}>⚠</span>
              </div>
              <div
                style={{
                  textAlign: "center",
                  color: "#1C1816",
                  fontSize: "22px",
                  fontFamily: "Space Grotesk",
                  fontWeight: "700",
                  marginBottom: "8px",
                }}
              >
                Your camera is blocked
              </div>
              <div
                style={{
                  textAlign: "center",
                  color: "#606B6A",
                  fontSize: "14px",
                  fontFamily: "Space Grotesk",
                  lineHeight: "22.75px",
                  marginBottom: "24px",
                }}
              >
                VISENSA needs camera access to work. Here's how to allow it in
                your browser.
              </div>
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                  marginBottom: "32px",
                }}
              >
                <div
                  style={{ display: "flex", gap: "12px", alignItems: "center" }}
                >
                  <div
                    style={{
                      background: "rgba(0,153,166,0.1)",
                      color: "#0099A6",
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      fontSize: "12px",
                      fontFamily: "Space Mono",
                      fontWeight: "bold",
                    }}
                  >
                    1
                  </div>
                  <div
                    style={{
                      color: "#606B6A",
                      fontSize: "14px",
                      fontFamily: "Space Grotesk",
                    }}
                  >
                    Click the camera or lock icon in your browser's address bar
                  </div>
                </div>
                <div
                  style={{ display: "flex", gap: "12px", alignItems: "center" }}
                >
                  <div
                    style={{
                      background: "rgba(0,153,166,0.1)",
                      color: "#0099A6",
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      fontSize: "12px",
                      fontFamily: "Space Mono",
                      fontWeight: "bold",
                    }}
                  >
                    2
                  </div>
                  <div
                    style={{
                      color: "#606B6A",
                      fontSize: "14px",
                      fontFamily: "Space Grotesk",
                    }}
                  >
                    Select 'Allow' next to Camera permissions
                  </div>
                </div>
                <div
                  style={{ display: "flex", gap: "12px", alignItems: "center" }}
                >
                  <div
                    style={{
                      background: "rgba(0,153,166,0.1)",
                      color: "#0099A6",
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      fontSize: "12px",
                      fontFamily: "Space Mono",
                      fontWeight: "bold",
                    }}
                  >
                    3
                  </div>
                  <div
                    style={{
                      color: "#606B6A",
                      fontSize: "14px",
                      fontFamily: "Space Grotesk",
                    }}
                  >
                    Refresh this page and try again
                  </div>
                </div>
              </div>
              <button
                onClick={() => window.location.reload()}
                style={{
                  width: "100%",
                  padding: "15px",
                  background: "#0099A6",
                  boxShadow: "0px 4px 17px rgba(200, 112, 74, 0.28)",
                  borderRadius: "30px",
                  border: "none",
                  color: "white",
                  fontSize: "15px",
                  fontFamily: "Space Grotesk",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                ↻ Try again
              </button>
            </div>
          )}
        </div>
      )}

      {/* MODAL SESSION CONTROL (Pause Saja) */}
      {isPaused && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(12, 17, 25, 0.75)",
            backdropFilter: "blur(8px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 110,
          }}
        >
          {/* Modal: Pause */}
          <div
            style={{
              width: "420px",
              padding: "40px 32px",
              background: "#1F252C",
              boxShadow: "0px 10px 40px rgba(0, 0, 0, 0.5)",
              borderRadius: "16px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                background: "rgba(255, 255, 255, 0.05)",
                borderRadius: "16px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: "24px",
              }}
            >
              <div style={{ display: "flex", gap: "4px" }}>
                <div
                  style={{
                    width: "3px",
                    height: "14px",
                    background: "#F2EDE8",
                    borderRadius: "2px",
                  }}
                />
                <div
                  style={{
                    width: "3px",
                    height: "14px",
                    background: "#F2EDE8",
                    borderRadius: "2px",
                  }}
                />
              </div>
            </div>
            <div
              style={{
                textAlign: "center",
                color: "white",
                fontSize: "22px",
                fontFamily: "Space Grotesk",
                fontWeight: "700",
                marginBottom: "12px",
              }}
            >
              Session paused
            </div>
            <div
              style={{
                textAlign: "center",
                color: "rgba(255,255,255,0.6)",
                fontSize: "14px",
                fontFamily: "Space Grotesk",
                lineHeight: "22px",
                marginBottom: "32px",
              }}
            >
              Take your time. When you’re ready, continue from where you left
              off.
            </div>
            <button
              onClick={() => setIsPaused(false)}
              style={{
                width: "100%",
                padding: "15px",
                background: "#0099A6",
                borderRadius: "30px",
                border: "none",
                color: "white",
                fontSize: "15px",
                fontFamily: "Space Grotesk",
                fontWeight: "600",
                cursor: "pointer",
                marginBottom: "12px",
              }}
            >
              Resume session
            </button>
            <button
              onClick={handleRest}
              style={{
                width: "100%",
                padding: "15px",
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "30px",
                color: "rgba(255,255,255,0.6)",
                fontSize: "15px",
                fontFamily: "Space Grotesk",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.target.style.background = "rgba(255,255,255,0.05)")
              }
              onMouseLeave={(e) =>
                (e.target.style.background = "transparent")
              }
            >
              Rest for 1 minute
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Camera;