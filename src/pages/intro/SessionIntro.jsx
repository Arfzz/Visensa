import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";

const SessionIntro = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);

  // Live camera preview — hanya untuk cek posisi & pencahayaan
  // TIDAK ada MediaPipe atau Kalidokit di halaman ini
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

  // Data untuk list exercise agar tidak perlu nulis HTML berulang-ulang
  const exercises = [
    { id: 1, name: "Open & close — gentle", time: "60s" },
    { id: 2, name: "Finger spread", time: "45s" },
    { id: 3, name: "Thumb opposition", time: "60s" },
    { id: 4, name: "Wrist rotation — slow", time: "90s" },
    { id: 5, name: "Finger tap sequence", time: "60s" },
    { id: 6, name: "Grip & release", time: "60s" },
    { id: 7, name: "Wrist flexion/extension", time: "90s" },
    { id: 8, name: "Full hand movement", time: "60s" },
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
      {/* SISI KIRI: Visualisasi (Camera Placeholder) */}
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
        <div style={{ textAlign: "center", color: "#7AAAB4", fontSize: "15px", fontFamily: "Space Mono", textTransform: "uppercase", letterSpacing: "2.28px", marginBottom: "24px" }}>
          Your session visualization
        </div>

        {/* Live Camera Preview */}
        <div
          style={{
            width: "100%",
            maxWidth: "730px",
            height: "580px",
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
          {/* Video feed */}
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
          {/* Overlay label */}
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
          {/* Card Preview Exercise 1 yang menumpuk di bawah kotak kamera */}
          <div
            style={{
              width: "90%",
              backgroundColor: "white",
              padding: "18px 24px",
              boxShadow: "0px 3px 18px rgba(28, 24, 22, 0.06)",
              borderRadius: "24px",
              border: "1.5px solid #C4E8EC",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              position: "absolute",
              bottom: "-40px", // Membuat efek overlap keluar dari kotak kamera
              zIndex: 10,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "9px", height: "9px", background: "#0099A6", borderRadius: "50%" }} />
              <div style={{ color: "#0099A6", fontSize: "15px", fontFamily: "Space Mono", textTransform: "uppercase", letterSpacing: "2px" }}>
                Preview — Exercise 1
              </div>
            </div>
            <div style={{ color: "#3A6870", fontSize: "21px", fontFamily: "Space Grotesk", fontWeight: "400" }}>
              Gentle open-and-close — following the mirrored movement
            </div>
          </div>
        </div>

        <div style={{ marginTop: "70px", textAlign: "center", color: "#7AAAB4", fontSize: "18px", fontFamily: "Space Grotesk", maxWidth: "600px" }}>
          This is what you'll see during therapy. The mirrored hand guides each exercise.
        </div>
      </div>

      {/* SISI KANAN: Panel Detail Sesi */}
      <div
        style={{
          width: "425px",
          height: "100vh",
          backgroundColor: "white",
          borderLeft: "1px solid #C4E8EC",
          overflowY: "scroll", // Mengizinkan scroll jika layar kecil
          padding: "35px",
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
        }}
      >
        <div style={{ padding: "35px", display: "flex", flexDirection: "column" }}>
          {/* Header Sesi */}
          <div style={{ color: "#3ED8C8", fontSize: "11px", fontFamily: "Space Mono", textTransform: "uppercase", letterSpacing: "1.6px" }}>
            Today's session
          </div>
          <div style={{ color: "#0C2830", fontSize: "26px", fontFamily: "Space Grotesk", fontWeight: "700", marginTop: "12px" }}>
            You're ready to begin
          </div>
          <div style={{ color: "#3A6870", fontSize: "15px", fontFamily: "Space Grotesk", marginTop: "4px" }}>
            Mirror therapy · Hand movement rehabilitation
          </div>

          {/* Grid Statistik Sesi (Menggantikan posisi Absolute dari Figma agar lebih rapi) */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "35px" }}>
            {/* Card 1: Exercises */}
            <div style={{ background: "rgba(0, 153, 166, 0.08)", padding: "16px", borderRadius: "16px", border: "1px solid rgba(0, 153, 166, 0.20)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#7AAAB4", fontSize: "11px", fontFamily: "Space Mono", textTransform: "uppercase" }}>
                <span style={{ fontSize: "14px" }}>▤</span> Exercises
              </div>
              <div style={{ color: "#0C2830", fontSize: "18px", fontFamily: "Space Grotesk", fontWeight: "600", marginTop: "8px" }}>8</div>
            </div>
            {/* Card 2: Duration */}
            <div style={{ background: "rgba(0, 153, 166, 0.08)", padding: "16px", borderRadius: "16px", border: "1px solid rgba(0, 153, 166, 0.20)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#7AAAB4", fontSize: "11px", fontFamily: "Space Mono", textTransform: "uppercase" }}>
                <span style={{ fontSize: "14px" }}>⏱</span> Duration
              </div>
              <div style={{ color: "#0C2830", fontSize: "18px", fontFamily: "Space Grotesk", fontWeight: "600", marginTop: "8px" }}>~12 min</div>
            </div>
            {/* Card 3: Difficulty */}
            <div style={{ background: "rgba(0, 153, 166, 0.08)", padding: "16px", borderRadius: "16px", border: "1px solid rgba(0, 153, 166, 0.20)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#7AAAB4", fontSize: "11px", fontFamily: "Space Mono", textTransform: "uppercase" }}>
                <span style={{ fontSize: "14px" }}>📈</span> Difficulty
              </div>
              <div style={{ color: "#0C2830", fontSize: "18px", fontFamily: "Space Grotesk", fontWeight: "600", marginTop: "8px" }}>Starting</div>
            </div>
            {/* Card 4: Focus */}
            <div style={{ background: "rgba(0, 153, 166, 0.08)", padding: "16px", borderRadius: "16px", border: "1px solid rgba(0, 153, 166, 0.20)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#7AAAB4", fontSize: "11px", fontFamily: "Space Mono", textTransform: "uppercase" }}>
                <span style={{ fontSize: "14px" }}>🎯</span> Focus
              </div>
              <div style={{ color: "#0C2830", fontSize: "18px", fontFamily: "Space Grotesk", fontWeight: "600", marginTop: "8px" }}>Grip & flex</div>
            </div>
          </div>

          {/* List Exercise (Dibuat otomatis menggunakan map) */}
          <div style={{ marginTop: "35px" }}>
            <div style={{ color: "#7AAAB4", fontSize: "11px", fontFamily: "Space Mono", textTransform: "uppercase", letterSpacing: "1.6px", marginBottom: "16px" }}>
              Session exercises
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {exercises.map((item) => (
                <div key={item.id} style={{ display: "flex", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #C4E8EC" }}>
                  <div style={{ color: "#7AAAB4", fontSize: "11px", fontFamily: "Space Mono", width: "24px" }}>{item.id}.</div>
                  <div style={{ color: "#3A6870", fontSize: "15px", fontFamily: "Space Grotesk", flex: 1 }}>{item.name}</div>
                  <div style={{ color: "#7AAAB4", fontSize: "13px", fontFamily: "Space Mono" }}>{item.time}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Info Box */}
          <div style={{ background: "rgba(62, 216, 200, 0.08)", padding: "16px", borderRadius: "16px", border: "1px solid rgba(62, 216, 200, 0.20)", marginTop: "35px", display: "flex", gap: "12px" }}>
            <div style={{ color: "#3ED8C8", marginTop: "2px" }}>ⓘ</div>
            <div style={{ color: "#3A6870", fontSize: "13px", fontFamily: "Space Grotesk", lineHeight: "1.6" }}>
              You can pause at any moment. Your progress is always saved. If a movement causes discomfort, simply stop and rest.
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ marginTop: "35px", display: "flex", flexDirection: "column", gap: "16px", paddingBottom: "40px" }}>
            <button
              onClick={() => navigate('/camera')} // Nanti arahkan ke halaman kamera
              style={{
                width: "100%",
                padding: "16px",
                background: "linear-gradient(135deg, #0099A6 0%, #007580 100%)",
                boxShadow: "0px 4px 18px rgba(0, 153, 166, 0.30)",
                borderRadius: "16px",
                border: "none",
                color: "white",
                fontSize: "16px",
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

            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", cursor: "pointer" }}>
              <span style={{ color: "#7AAAB4" }}>⚙</span>
              <span style={{ color: "#7AAAB4", fontSize: "15px", fontFamily: "Space Grotesk", fontWeight: "500" }}>Adjust session settings</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionIntro;