import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "https://visensa-production.up.railway.app/api/v1";

const SessionComplete = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Duration in seconds passed from ExerciseHUD via navigate state
  const durationSeconds = location.state?.durationSeconds ?? 0;

  // State untuk menyimpan nilai slider rasa sakit (0 - 10)
  const [painScore, setPainScore] = useState(7);
  const [isSaving, setIsSaving] = useState(false);
  const [previousPain, setPreviousPain] = useState(null);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const fetchPreviousPain = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch(`${API_BASE}/sessions/exercise/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const responseBody = await res.json();
          const logs = responseBody.data;
          if (logs && logs.length > 0) {
            setPreviousPain(logs[0].pain_level ?? null);
          }
        }
      } catch (e) {
        console.error("Failed to fetch previous pain", e);
      }
    };
    fetchPreviousPain();
  }, []);

  const handleSubmit = async (navigateToInteractive = false) => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${API_BASE}/sessions/exercise/direct`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          durationSeconds,
          painLevel: painScore,
          notes: notes
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('Backend error:', errorText);
        alert('Gagal menyimpan sesi: ' + errorText);
        setIsSaving(false);
        return; // Don't navigate if it failed
      }

    } catch (e) {
      console.error('Failed to save session:', e);
      alert('Network error: ' + e.message);
      setIsSaving(false);
      return;
    }

    // If successful, navigate
    if (navigateToInteractive) {
      navigate('/patient-dashboard', { state: { activeMenu: 'Interactive Practice' } });
    } else {
      navigate('/patient-dashboard');
    }
  };

  // Logika dinamis untuk warna, teks, dan emoji berdasarkan score
  const getPainDetails = (score) => {
    if (score <= 2)
      return { label: "Excellent", color: "#4BA882", emojiIndex: 0 }; // Hijau
    if (score <= 4) return { label: "Good", color: "#3ED8C8", emojiIndex: 1 }; // Tosca
    if (score <= 6)
      return { label: "Fair", color: "#D4A843", emojiIndex: 2 }; // Kuning
    if (score <= 8) return { label: "Poor", color: "#C0574C", emojiIndex: 3 }; // Merah Muda
    return { label: "Very Poor", color: "#C84A4A", emojiIndex: 4 }; // Merah Gelap
  };

  const getStatusFromPain = (painLevel) => {
    if (painLevel <= 3) return { status: 'Excellent', color: '#4BA882' };
    if (painLevel <= 5) return { status: 'Good', color: '#3ED8C8' };
    if (painLevel <= 7) return { status: 'Fair', color: '#D4A843' };
    return { status: 'Poor', color: '#C0574C' };
  };

  const currentPain = getPainDetails(painScore);
  const quality = getStatusFromPain(painScore);
  const emojis = ["😌", "🙂", "😐", "😟", "😣"];

  const mins = Math.floor(durationSeconds / 60);
  const secs = durationSeconds % 60;
  const formattedDuration = `${mins}:${secs.toString().padStart(2, "0")}`;

  return (
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        backgroundColor: "#F0FAFB",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px 20px",
        boxSizing: "border-box",
        fontFamily: "Space Grotesk, sans-serif",
        overflowY: "auto",
      }}
    >
      {/* CSS Khusus untuk Slider agar bentuknya cantik seperti desain Figma */}
      <style>
        {`
            .custom-slider {
              -webkit-appearance: none;
              width: 100%;
              height: 8px;
              background: #E2E8F0;
              outline: none;
              border-radius: 4px;
              margin: 20px 0;
            }
            .custom-slider::-webkit-slider-thumb {
              -webkit-appearance: none;
              appearance: none;
              width: 20px;
              height: 24px;
              background: #1C1816;
              cursor: pointer;
              border-radius: 4px;
              box-shadow: 0 2px 6px rgba(0,0,0,0.2);
              transition: transform 0.1s;
            }
            .custom-slider::-webkit-slider-thumb:hover {
              transform: scale(1.1);
            }
            .custom-slider::-moz-range-thumb {
              width: 20px;
              height: 24px;
              background: #1C1816;
              cursor: pointer;
              border-radius: 4px;
              border: none;
            }
          `}
      </style>

      {/* Container Utama: Dibagi 2 Kolom (Kiri & Kanan) */}
      <div
        style={{
          width: "100%",
          maxWidth: "1086px",
          display: "flex",
          flexWrap: "wrap",
          gap: "24px",
          justifyContent: "center",
          alignItems: "flex-start",
        }}
      >
        {/* =======================================
            KOLOM KIRI (Complete, Summary, Note)
            ======================================= */}
        <div
          style={{
            width: "100%",
            maxWidth: "478px",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          {/* Card 1: Session Complete */}
          <div
            style={{
              background: "white",
              padding: "40px",
              borderRadius: "20px",
              boxShadow: "0px 10px 48px rgba(28, 24, 22, 0.08)",
              border: "1px solid #C4E8EC",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: "68px",
                height: "68px",
                background: "linear-gradient(135deg, #0099A6 0%, #007580 100%)",
                boxShadow: "0px 0px 34px rgba(0, 153, 166, 0.2)",
                borderRadius: "20px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: "24px",
              }}
            >
              <span style={{ color: "white", fontSize: "32px" }}>✓</span>
            </div>
            <div
              style={{
                color: "#0C2830",
                fontSize: "26px",
                fontWeight: "700",
                marginBottom: "8px",
              }}
            >
              Session complete
            </div>
            <div
              style={{
                color: "#3A6870",
                fontSize: "16px",
                textAlign: "center",
                lineHeight: "1.5",
              }}
            >
              Well done. Consistency like this is how progress is made.
            </div>
          </div>

          {/* Card 2: Session Summary */}
          <div
            style={{
              background: "white",
              padding: "30px",
              borderRadius: "20px",
              boxShadow: "0px 2px 14px rgba(28, 24, 22, 0.06)",
              border: "1px solid #C4E8EC",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                color: "#3ED8C8",
                fontSize: "12px",
                fontFamily: "Space Mono",
                textTransform: "uppercase",
                letterSpacing: "1.8px",
                marginBottom: "24px",
              }}
            >
              Session summary
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "16px",
                marginBottom: "24px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    color: "#7AAAB4",
                    fontSize: "12px",
                    fontFamily: "Space Mono",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    marginBottom: "8px",
                  }}
                >
                  ▤ Exercises
                </div>
                <div
                  style={{
                    color: "#0C2830",
                    fontSize: "22px",
                    fontWeight: "700",
                  }}
                >
                  8 of 8
                </div>
                <div style={{ color: "#7AAAB4", fontSize: "14px" }}>
                  Completed
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    color: "#7AAAB4",
                    fontSize: "12px",
                    fontFamily: "Space Mono",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    marginBottom: "8px",
                  }}
                >
                  ⏱ Duration
                </div>
                <div
                  style={{
                    color: "#0C2830",
                    fontSize: "22px",
                    fontWeight: "700",
                  }}
                >
                  {formattedDuration}
                </div>
                <div style={{ color: "#7AAAB4", fontSize: "14px" }}>
                  Minutes
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    color: "#7AAAB4",
                    fontSize: "12px",
                    fontFamily: "Space Mono",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    marginBottom: "8px",
                  }}
                >
                  📈 Quality
                </div>
                <div
                  style={{
                    color: quality.color,
                    fontSize: "22px",
                    fontWeight: "700",
                  }}
                >
                  {quality.status}
                </div>
                <div style={{ color: "#7AAAB4", fontSize: "14px" }}>
                  Movement
                </div>
              </div>
            </div>

            <div
              style={{
                borderTop: "1px solid #C4E8EC",
                paddingTop: "20px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <span style={{ color: "#4BA882", fontSize: "16px" }}>📉</span>
              <div style={{ color: "#3A6870", fontSize: "14px" }}>
                Compared to last session:{" "}
                <span style={{ color: "#4BA882", fontWeight: "600" }}>
                  +2 exercises · +1 min duration
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Optional Note */}
          <div
            style={{
              background: "white",
              padding: "30px",
              borderRadius: "20px",
              boxShadow: "0px 2px 14px rgba(28, 24, 22, 0.06)",
              border: "1px solid #C4E8EC",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                color: "#3ED8C8",
                fontSize: "12px",
                fontFamily: "Space Mono",
                textTransform: "uppercase",
                letterSpacing: "1.8px",
                marginBottom: "16px",
              }}
            >
              Optional note
            </div>
            <textarea
              placeholder="Anything to note? (e.g. 'Felt a tingling sensation during exercise 4') — visible to your therapist."
              value={notes} // <-- Ikat ke state
              onChange={(e) => setNotes(e.target.value)} 
              style={{
                width: "100%",
                height: "100px",
                padding: "16px",
                background: "rgba(0, 153, 166, 0.08)",
                borderRadius: "16px",
                border: "1px solid rgba(0, 153, 166, 0.2)",
                color: "#0C2830",
                fontSize: "16px",
                fontFamily: "Space Grotesk",
                outline: "none",
                resize: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>

        {/* =======================================
            KOLOM KANAN (Interactive Pain Check-in)
            ======================================= */}
        <div
          style={{
            flex: 1,
            minWidth: "400px",
            background: "white",
            padding: "40px",
            borderRadius: "20px",
            boxShadow: "0px 10px 48px rgba(28, 24, 22, 0.08)",
            border: "1px solid #C4E8EC",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              color: "#3ED8C8",
              fontSize: "12px",
              fontFamily: "Space Mono",
              textTransform: "uppercase",
              letterSpacing: "1.8px",
              marginBottom: "12px",
            }}
          >
            Pain check-in
          </div>
          <div
            style={{
              color: "#0C2830",
              fontSize: "24px",
              fontWeight: "700",
              marginBottom: "8px",
            }}
          >
            How does your hand feel right now?
          </div>
          <div
            style={{ color: "#7AAAB4", fontSize: "15px", marginBottom: "40px" }}
          >
            This helps track your progress over time. Your therapist may also
            see this.
          </div>

          {/* Area Angka Dinamis */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginBottom: "20px",
              transition: "color 0.3s ease",
            }}
          >
            <div
              style={{ display: "flex", alignItems: "baseline", gap: "8px" }}
            >
              <span
                style={{
                  color: currentPain.color,
                  fontSize: "80px",
                  fontFamily: "Space Grotesk",
                  fontWeight: "700",
                  lineHeight: "1",
                  transition: "color 0.3s ease",
                }}
              >
                {painScore}
              </span>
              <span
                style={{
                  color: "#7AAAB4",
                  fontSize: "28px",
                  fontFamily: "Space Grotesk",
                }}
              >
                / 10
              </span>
            </div>
            <div
              style={{
                color: currentPain.color,
                fontSize: "18px",
                fontWeight: "600",
                marginTop: "8px",
                transition: "color 0.3s ease",
              }}
            >
              {currentPain.label}
            </div>
          </div>

          {/* Slider (Geseran) */}
          <input
            type="range"
            min="0"
            max="10"
            value={painScore}
            onChange={(e) => setPainScore(parseInt(e.target.value))}
            className="custom-slider"
          />

          {/* Label Slider */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "24px",
              padding: "0",
            }}
          >
            <div
              style={{
                color: "#7AAAB4",
                fontSize: "11px",
                fontFamily: "Space Mono",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              0 · Excellent
            </div>
            <div
              style={{
                color: "#7AAAB4",
                fontSize: "11px",
                fontFamily: "Space Mono",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              5 · Fair
            </div>
            <div
              style={{
                color: "#7AAAB4",
                fontSize: "11px",
                fontFamily: "Space Mono",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              10 · Very Poor
            </div>
          </div>

          {/* Emojis Interaktif */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "40px",
              padding: "0 10px",
            }}
          >
            {emojis.map((emoji, index) => {
              const isActive = index === currentPain.emojiIndex;
              return (
                <span
                  key={index}
                  style={{
                    fontSize: "36px",
                    opacity: isActive ? 1 : 0.25,
                    transform: isActive ? "scale(1.15)" : "scale(1)",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                    filter: isActive
                      ? "drop-shadow(0px 4px 6px rgba(0,0,0,0.1))"
                      : "none",
                  }}
                  onClick={() => {
                    // Kalau di-klik langsung lompat ke angkanya
                    const scoreMapping = [0, 3, 5, 7, 10];
                    setPainScore(scoreMapping[index]);
                  }}
                >
                  {emoji}
                </span>
              );
            })}
          </div>

          {/* Info Box */}
          <div
            style={{
              padding: "20px",
              background: "rgba(75, 168, 130, 0.07)",
              borderRadius: "16px",
              border: "1px solid rgba(75, 168, 130, 0.15)",
              marginBottom: "32px",
            }}
          >
            <div
              style={{
                color: "#7AAAB4",
                fontSize: "12px",
                fontFamily: "Space Mono",
                textTransform: "uppercase",
                letterSpacing: "1px",
                marginBottom: "8px",
              }}
            >
              Before this session
            </div>
            <div style={{ color: "#3A6870", fontSize: "16px" }}>
              {previousPain === null ? (
                <>
                  Your first session! Slide to indicate your current pain level.
                </>
              ) : (
                <>
                  Your pain was{" "}
                  <span style={{ color: "#0C2830", fontWeight: "700" }}>{previousPain}/10</span>{" "}
                  — that's{" "}
                  <span style={{ color: painScore <= previousPain ? "#4BA882" : "#C84A4A", fontWeight: "600" }}>
                    {Math.abs(previousPain - painScore)} points {painScore <= previousPain ? "lower" : "higher"}
                  </span>{" "}
                  now.
                </>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <button
              onClick={() => handleSubmit(false)}
              disabled={isSaving}
              style={{
                width: "100%",
                padding: "18px",
                background: isSaving
                  ? "#7AAAB4"
                  : "linear-gradient(135deg, #0099A6 0%, #007580 100%)",
                boxShadow: isSaving ? "none" : "0px 4px 20px rgba(0, 153, 166, 0.3)",
                borderRadius: "16px",
                border: "none",
                color: "white",
                fontSize: "18px",
                fontFamily: "Space Grotesk",
                fontWeight: "600",
                cursor: isSaving ? "not-allowed" : "pointer",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.2s ease"
              }}
            >
              {isSaving ? "Saving..." : "Back to Dashboard"}
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionComplete;
