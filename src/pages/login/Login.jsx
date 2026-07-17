import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Import asset gambar asli dari folder assets kamu
import visensaLogo from "../../assets/visensa-logo.png";
import avatarHands from "../../assets/avatar-hands.png";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false); // Tambahan state untuk icon mata

  return (
    <div
      style={{
        width: "100vw", // Disamakan dengan Register
        height: "100vh", // Disamakan dengan Register
        display: "flex",
        flexDirection: "row",
        backgroundColor: "#F1F7F7",
        overflow: "hidden", // Disamakan dengan Register
        margin: 0,
        padding: 0,
      }}
    >
      {/* SISI KIRI: Dark Branding Panel */}
      <div
        style={{
          width: "40%",
          minWidth: "480px",
          height: "100vh", // Disamakan dengan Register
          background: "#0C1119",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "54.86px",
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        {/* Glow Radial Gradient Background */}
        <div
          style={{
            width: "100%",
            height: "100%",
            left: 0,
            top: 0,
            position: "absolute",
            background:
              "radial-gradient(ellipse 98.99% 98.99% at 70.00% 30.00%, rgba(59, 184, 176, 0.07) 0%, rgba(0, 0, 0, 0) 55%), radial-gradient(ellipse 113.14% 113.14% at 20.00% 80.00%, rgba(200, 112, 74, 0.08) 0%, rgba(0, 0, 0, 0) 50%)",
            pointerEvents: "none",
          }}
        />

        {/* LOGO (Atas) */}
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: "11.43px",
            zIndex: 2,
          }}
        >
          <img
            src={visensaLogo}
            alt="Visensa Logo"
            style={{ height: "27px", width: "auto" }}
          />
          <div
            style={{
              color: "white",
              fontSize: "22.86px",
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: "800",
              lineHeight: "27.43px",
              letterSpacing: "0.5px",
            }}
          >
            VISENSA
          </div>
        </div>

        {/* ILUSTRASI & TEKS UTAMA (Tengah) */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            zIndex: 2,
            margin: "auto 0",
          }}
        >
          <div
            style={{
              width: "240px",
              height: "140px",
              position: "relative",
              marginBottom: "45.72px",
            }}
          >
            {/* Tangan Kiri */}
            <img
              src={avatarHands}
              alt="Left Hand"
              style={{
                width: "110px",
                height: "auto",
                position: "absolute",
                left: "15px",
                top: "5px",
                transform: "rotate(-6deg)",
                opacity: 0.85,
              }}
            />

            {/* Tangan Kanan: Di-mirror + Filter Toska */}
            <img
              src={avatarHands}
              alt="Right Hand"
              style={{
                width: "110px",
                height: "auto",
                position: "absolute",
                right: "15px",
                top: "5px",
                transform: "scaleX(-1) rotate(-6deg)",
                filter:
                  "invert(52%) sepia(87%) saturate(1832%) hue-rotate(141deg) brightness(95%) contrast(101%)",
                opacity: 0.85,
              }}
            />
          </div>

          <div
            style={{
              color: "#F2EDE8",
              fontSize: "32px",
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: "700",
              lineHeight: "38.41px",
              marginBottom: "18.29px",
            }}
          >
            Your recovery,
            <br />
            on your schedule.
          </div>
          <div
            style={{
              maxWidth: "320.04px",
              color: "#445570",
              fontSize: "17.15px",
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: "400",
              lineHeight: "28.29px",
            }}
          >
            Guided mirror therapy sessions from your browser. No hardware, no
            appointment, no waiting room.
          </div>
        </div>

        {/* STATISTIK DATA (Bawah) */}
        <div
          style={{
            position: "relative",
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
            zIndex: 2,
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                color: "#0099A6",
                fontSize: "25.15px",
                fontFamily: "Space Mono, monospace",
                fontWeight: "700",
                lineHeight: "25.15px",
              }}
            >
              94%
            </div>
            <div
              style={{
                color: "#445570",
                fontSize: "12.57px",
                fontFamily: "Space Grotesk, sans-serif",
                fontWeight: "400",
                lineHeight: "18.86px",
                marginTop: "4.57px",
              }}
            >
              Completion rate
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                color: "#0099A6",
                fontSize: "25.15px",
                fontFamily: "Space Mono, monospace",
                fontWeight: "700",
                lineHeight: "25.15px",
              }}
            >
              42%
            </div>
            <div
              style={{
                color: "#445570",
                fontSize: "12.57px",
                fontFamily: "Space Grotesk, sans-serif",
                fontWeight: "400",
                lineHeight: "18.86px",
                marginTop: "4.57px",
              }}
            >
              Pain reduction
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                color: "#0099A6",
                fontSize: "25.15px",
                fontFamily: "Space Mono, monospace",
                fontWeight: "700",
                lineHeight: "25.15px",
              }}
            >
              200+
            </div>
            <div
              style={{
                color: "#445570",
                fontSize: "12.57px",
                fontFamily: "Space Grotesk, sans-serif",
                fontWeight: "400",
                lineHeight: "18.86px",
                marginTop: "4.57px",
              }}
            >
              Studies backing
            </div>
          </div>
        </div>
      </div>

      {/* SISI KANAN: Login / Register Form */}
      <div
        style={{
          flex: 1,
          height: "100vh",
          overflowY: "scroll", // <--- UBAH "auto" JADI "scroll" DI SINI
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          paddingTop: "120px",
          paddingBottom: "120px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "480px", // Disamakan dengan Register
            display: "flex",
            flexDirection: "column",
            padding: "0 27px", // Disamakan dengan Register
          }}
        >
          {/* Back to Home Link */}
          <div
            onClick={() => navigate("/")}
            style={{
              color: "#7AAAB4",
              fontSize: "14.86px",
              fontFamily: "Space Mono, monospace",
              fontWeight: "400",
              lineHeight: "22.29px",
              cursor: "pointer",
              marginBottom: "45.72px",
            }}
          >
            ← Back to home
          </div>

          {/* Toggle Tab (Sign In / Create Account) */}
          <div
            style={{
              height: "54.86px",
              padding: "4.57px",
              background: "#C4E8EC",
              borderRadius: "18.29px",
              display: "flex",
              boxSizing: "border-box",
              marginBottom: "36.58px",
              flexShrink: 0,
            }}
          >
            {/* Tab Sign In (Aktif) */}
            <div
              style={{
                flex: 1,
                background: "white",
                boxShadow: "0px 1.14px 4.57px rgba(28, 24, 22, 0.08)",
                borderRadius: "16px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                cursor: "default",
              }}
            >
              <div
                style={{
                  color: "#18687E",
                  fontSize: "16px",
                  fontFamily: "Space Grotesk, sans-serif",
                  fontWeight: "600",
                  lineHeight: "22.86px",
                }}
              >
                Sign in
              </div>
            </div>

            {/* Tab Create Account (Gak Aktif, Menuju Halaman Register) */}
            <div
              onClick={() => navigate("/register")}
              style={{
                flex: 1,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  color: "#7AAAB4",
                  fontSize: "16px",
                  fontFamily: "Space Grotesk, sans-serif",
                  fontWeight: "600",
                  lineHeight: "22.86px",
                }}
              >
                Create account
              </div>
            </div>
          </div>

          {/* Form Header */}
          <div style={{ marginBottom: "36.58px", flexShrink: 0 }}>
            <div
              style={{
                color: "#1C1816",
                fontSize: "32px",
                fontFamily: "Space Grotesk, sans-serif",
                fontWeight: "800",
                lineHeight: "48.01px",
              }}
            >
              Welcome back
            </div>
            <div
              style={{
                color: "#7AAAB4",
                fontSize: "17.15px",
                fontFamily: "Space Grotesk, sans-serif",
                fontWeight: "400",
                lineHeight: "25.72px",
                marginTop: "6.86px",
              }}
            >
              Continue your therapy programme.
            </div>
          </div>

          {/* Input Fields Container */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "22.86px",
              marginBottom: "36.58px",
              flexShrink: 0,
            }}
          >
            {/* Input Email */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  color: "#7AAAB4",
                  fontSize: "13.72px",
                  fontFamily: "Space Mono, monospace",
                  fontWeight: "400",
                  lineHeight: "20.57px",
                  letterSpacing: "1.10px",
                  marginBottom: "8px",
                }}
              >
                EMAIL ADDRESS
              </div>
              <input
                type="email"
                placeholder="your@email.com"
                style={{
                  width: "100%",
                  height: "55.44px",
                  paddingLeft: "18.29px",
                  paddingRight: "18.29px",
                  background: "#F0FAFB",
                  border: "1.14px solid #C4E8EC",
                  borderRadius: "13.72px",
                  color: "#1C1816",
                  fontSize: "17.15px",
                  fontFamily: "Space Grotesk, sans-serif",
                  fontWeight: "400",
                  boxSizing: "border-box",
                  outline: "none",
                }}
              />
            </div>

            {/* Input Password */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  color: "#7AAAB4",
                  fontSize: "13.72px",
                  fontFamily: "Space Mono, monospace",
                  fontWeight: "400",
                  lineHeight: "20.57px",
                  letterSpacing: "1.10px",
                  marginBottom: "8px",
                }}
              >
                PASSWORD
              </div>
              <div style={{ position: "relative", width: "100%" }}>
                <input
                  type={showPassword ? "text" : "password"} // Fungsi toggle tipe password
                  placeholder="••••••••"
                  style={{
                    width: "100%",
                    height: "55.44px",
                    paddingLeft: "18.29px",
                    paddingRight: "50.29px",
                    background: "#F0FAFB",
                    border: "1.14px solid #C4E8EC",
                    borderRadius: "13.72px",
                    color: "#1C1816",
                    fontSize: "17.15px",
                    fontFamily: "Space Grotesk, sans-serif",
                    fontWeight: "400",
                    boxSizing: "border-box",
                    outline: "none",
                  }}
                />
                {/* Icon Eye */}
                <div
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "18.29px",
                    top: "18.57px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={showPassword ? "#0099A6" : "#7AAAB4"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </div>
              </div>
            </div>

            {/* Forgot Password */}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <div
                style={{
                  color: "#0099A6",
                  fontSize: "13.72px",
                  fontFamily: "Space Mono, monospace",
                  fontWeight: "400",
                  lineHeight: "20.57px",
                  cursor: "pointer",
                }}
              >
                Forgot password?
              </div>
            </div>
          </div>

          {/* Action Button & Bottom Link */}
          <button
              onClick={() => navigate('/intro')} // <--- TAMBAHKAN BARIS INI
              style={{ width: "100%", height: "57.72px", background: "#0099A6", border: "none", borderRadius: "38px", boxShadow: "0px 4.57px 18.28px rgba(200, 112, 74, 0.28)", display: "flex", justifyContent: "center", alignItems: "center", gap: "9.14px", cursor: "pointer" }}
            >
              <span style={{ color: "white", fontSize: "17.15px", fontFamily: "Space Grotesk, sans-serif", fontWeight: "600", lineHeight: "25.72px" }}>
                Sign in to VISENSA
              </span>
            </button>
          </div>
        </div>
      </div>
  );
};

export default Login;