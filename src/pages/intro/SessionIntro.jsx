import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";

const SessionIntro = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);

  // Live camera preview — hanya untuk cek posisi & pencahayaan
  useEffect(() => {
    let stream = null;
    const startPreview = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720, facingMode: "user" },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.warn("[SessionIntro] Camera preview not available:", err);
      }
    };
    startPreview();
    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const exercises = [
    { id: 1, name: "Open & close — gentle", time: "60s" },
    { id: 2, name: "Wrist flexion/extension", time: "45s" },
    { id: 3, name: "Pinch grip — koin", time: "60s" },
    { id: 4, name: "Wrist deviation — floating", time: "60s" },
    { id: 5, name: "Finger tap sequence", time: "60s" },
    { id: 6, name: "Static open hold", time: "60s" },
    { id: 7, name: "Single finger lift", time: "60s" },
    { id: 8, name: "Fist hold", time: "60s" },
  ];

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "row",
        overflow: "hidden",
        backgroundColor: "#F0FAFB",
        margin: 0,
        padding: 0,
      }}
    >
      {/* SISI KIRI: Visualisasi (Camera Placeholder)  */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "40px",
          position: "relative",
        }}
      >
        <div style={{ textAlign: "center", color: "#7AAAB4", fontSize: "14px", fontFamily: "Space Mono", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "20px" }}>
          Your session visualization
        </div>

        {/* Live Camera Preview */}
        <div
          style={{
            width: "100%",
            maxWidth: "730px",
            height: "560px",
            background: "#0C1119",
            borderRadius: "21px",
            border: "1.5px rgba(196, 232, 236, 0.5) solid",
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-end",
            paddingBottom: "24px",
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: "scaleX(-1)",
              borderRadius: "21px",
            }}
          />
          <div style={{
            position: "absolute",
            top: "16px",
            left: "16px",
            background: "rgba(0,153,166,0.18)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(0,153,166,0.35)",
            borderRadius: "20px",
            padding: "5px 12px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            zIndex: 2,
          }}>
            <div style={{ width: "7px", height: "7px", background: "#3ED8C8", borderRadius: "50%" }} />
            <span style={{ color: "#3ED8C8", fontSize: "11px", fontFamily: "Space Mono", letterSpacing: "1.5px", textTransform: "uppercase" }}>Camera Preview</span>
          </div>
          <div
            style={{
              width: "90%",
              backgroundColor: "white",
              padding: "16px 20px",
              boxShadow: "0px 3px 18px rgba(28, 24, 22, 0.06)",
              borderRadius: "20px",
              border: "1.5px solid #C4E8EC",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              position: "absolute",
              bottom: "-30px",
              zIndex: 10,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "8px", height: "8px", background: "#0099A6", borderRadius: "50%" }} />
              <div style={{ color: "#0099A6", fontSize: "14px", fontFamily: "Space Mono", textTransform: "uppercase", letterSpacing: "1.5px" }}>
                Preview — Exercise 1
              </div>
            </div>
            <div style={{ color: "#3A6870", fontSize: "19px", fontFamily: "Space Grotesk", fontWeight: "400" }}>
              Gentle open-and-close — following the mirrored movement
            </div>
          </div>
        </div>

        <div style={{ marginTop: "60px", textAlign: "center", color: "#7AAAB4", fontSize: "16px", fontFamily: "Space Grotesk", maxWidth: "550px" }}>
          This is what you'll see during therapy. The mirrored hand guides each exercise.
        </div>
      </div>

      {/* SISI KANAN: Panel Detail Sesi (VERSI ULTRA COMPACT) */}
      <div
        style={{
          width: "380px", 
          height: "100vh",
          backgroundColor: "white",
          borderLeft: "1px solid #C4E8EC",
          overflowY: "auto",
          padding: "16px 20px", // Padding atas-bawah sangat minim
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "space-between" }}>
          
          {/* Header Sesi */}
          <div>
            <div style={{ color: "#3ED8C8", fontSize: "10px", fontFamily: "Space Mono", textTransform: "uppercase", letterSpacing: "1.5px" }}>
              Today's session
            </div>
            <div style={{ color: "#0C2830", fontSize: "20px", fontFamily: "Space Grotesk", fontWeight: "700", marginTop: "4px" }}>
              You're ready to begin
            </div>
            <div style={{ color: "#3A6870", fontSize: "12px", fontFamily: "Space Grotesk", marginTop: "2px" }}>
              Mirror therapy · Hand movement rehabilitation
            </div>
          </div>

          {/* Grid Statistik Sesi */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "14px" }}>
            <div style={{ background: "rgba(0, 153, 166, 0.08)", padding: "10px", borderRadius: "10px", border: "1px solid rgba(0, 153, 166, 0.20)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#7AAAB4", fontSize: "9px", fontFamily: "Space Mono", textTransform: "uppercase" }}>
                <span style={{ fontSize: "11px" }}>▤</span> Exercises
              </div>
              <div style={{ color: "#0C2830", fontSize: "15px", fontFamily: "Space Grotesk", fontWeight: "600", marginTop: "2px" }}>8</div>
            </div>
            <div style={{ background: "rgba(0, 153, 166, 0.08)", padding: "10px", borderRadius: "10px", border: "1px solid rgba(0, 153, 166, 0.20)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#7AAAB4", fontSize: "9px", fontFamily: "Space Mono", textTransform: "uppercase" }}>
                <span style={{ fontSize: "11px" }}>⏱</span> Duration
              </div>
              <div style={{ color: "#0C2830", fontSize: "15px", fontFamily: "Space Grotesk", fontWeight: "600", marginTop: "2px" }}>~12 min</div>
            </div>
            <div style={{ background: "rgba(0, 153, 166, 0.08)", padding: "10px", borderRadius: "10px", border: "1px solid rgba(0, 153, 166, 0.20)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#7AAAB4", fontSize: "9px", fontFamily: "Space Mono", textTransform: "uppercase" }}>
                <span style={{ fontSize: "11px" }}>📈</span> Difficulty
              </div>
              <div style={{ color: "#0C2830", fontSize: "15px", fontFamily: "Space Grotesk", fontWeight: "600", marginTop: "2px" }}>Starting</div>
            </div>
            <div style={{ background: "rgba(0, 153, 166, 0.08)", padding: "10px", borderRadius: "10px", border: "1px solid rgba(0, 153, 166, 0.20)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#7AAAB4", fontSize: "9px", fontFamily: "Space Mono", textTransform: "uppercase" }}>
                <span style={{ fontSize: "11px" }}>🎯</span> Focus
              </div>
              <div style={{ color: "#0C2830", fontSize: "15px", fontFamily: "Space Grotesk", fontWeight: "600", marginTop: "2px" }}>Grip & flex</div>
            </div>
          </div>

          {/* List Exercise */}
          <div style={{ marginTop: "14px" }}>
            <div style={{ color: "#7AAAB4", fontSize: "10px", fontFamily: "Space Mono", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "6px" }}>
              Session exercises
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {exercises.map((item) => (
                <div key={item.id} style={{ display: "flex", alignItems: "center", padding: "5px 0", borderBottom: "1px solid #C4E8EC" }}>
                  <div style={{ color: "#7AAAB4", fontSize: "11px", fontFamily: "Space Mono", width: "20px" }}>{item.id}.</div>
                  <div style={{ color: "#3A6870", fontSize: "13px", fontFamily: "Space Grotesk", flex: 1 }}>{item.name}</div>
                  <div style={{ color: "#7AAAB4", fontSize: "11px", fontFamily: "Space Mono" }}>{item.time}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Info Box (Padding dan margin ditekan) */}
          <div style={{ background: "rgba(62, 216, 200, 0.08)", padding: "10px", borderRadius: "10px", border: "1px solid rgba(62, 216, 200, 0.20)", marginTop: "14px", display: "flex", gap: "8px", alignItems: "flex-start" }}>
            <div style={{ color: "#3ED8C8", marginTop: "1px", fontSize: "13px" }}>ⓘ</div>
            <div style={{ color: "#3A6870", fontSize: "11px", fontFamily: "Space Grotesk", lineHeight: "1.4" }}>
              You can pause at any moment. Your progress is saved. Stop if you feel discomfort.
            </div>
          </div>

          {/* Action Buttons (Padding Y ditekan jadi 12px) */}
          <div style={{ marginTop: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <button
              onClick={() => navigate('/camera')}
              style={{
                width: "100%",
                padding: "12px",
                background: "linear-gradient(135deg, #0099A6 0%, #007580 100%)",
                boxShadow: "0px 4px 18px rgba(0, 153, 166, 0.30)",
                borderRadius: "12px",
                border: "none",
                color: "white",
                fontSize: "14px",
                fontFamily: "Space Grotesk",
                fontWeight: "600",
                cursor: "pointer",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "8px"
              }}
            >
              Begin Session <span>→</span>
            </button>

            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "6px", cursor: "pointer" }}>
              <span style={{ color: "#7AAAB4", fontSize: "12px" }}>⚙</span>
              <span style={{ color: "#7AAAB4", fontSize: "12px", fontFamily: "Space Grotesk", fontWeight: "500" }}>Adjust session settings</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SessionIntro;