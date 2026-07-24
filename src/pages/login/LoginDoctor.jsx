import { useState } from "react";
import { useNavigate } from "react-router-dom";
import visensaLogo from "../../assets/visensa-logo.png";
import avatarHands from "../../assets/avatar-hands.png";

const LoginDoctor = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "row",
        backgroundColor: "#F1F7F7",
        overflow: "hidden",
        margin: 0,
        padding: 0,
      }}
    >
      {/* SISI KIRI */}
      <div
        style={{
          width: "40%",
          minWidth: "480px",
          height: "100vh",
          background: "#0C1119",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "54.86px",
          boxSizing: "border-box",
        }}
      >
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
            }}
          >
            VISENSA
          </div>
        </div>
        <div
          style={{
            position: "relative",
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
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
              marginBottom: "18px",
            }}
          >
            Empower recovery,
            <br />
            monitor remotely.
          </div>
          <div
            style={{
              color: "#445570",
              fontSize: "17.15px",
              fontFamily: "Space Grotesk, sans-serif",
              maxWidth: "340px",
              lineHeight: "1.6",
            }}
          >
            Seamlessly track your patients' mirror therapy progress, review
            compliance, and adjust protocols from your clinical dashboard.
          </div>
        </div>
        <div
          style={{
            position: "relative",
            display: "flex",
            justifyContent: "space-between",
            zIndex: 2,
          }}
        >
          {[
            { v: "94%", l: "Patient compliance" },
            { v: "42%", l: "Avg. pain reduction" },
            { v: "50+", l: "Clinics worldwide" },
          ].map((stat, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div
                style={{
                  color: "#0099A6",
                  fontSize: "25px",
                  fontFamily: "Space Mono",
                  fontWeight: "700",
                }}
              >
                {stat.v}
              </div>
              <div
                style={{
                  color: "#445570",
                  fontSize: "12.5px",
                  fontFamily: "Space Grotesk",
                  marginTop: "4px",
                }}
              >
                {stat.l}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SISI KANAN */}
      <div
        style={{
          flex: 1,
          height: "100vh",
          overflowY: "scroll",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: "120px",
          paddingBottom: "120px",
          boxSizing: "border-box",
        }}
      >
        <div style={{ width: "100%", maxWidth: "480px", padding: "0 27px" }}>
          <div
            onClick={() => navigate("/")}
            style={{
              color: "#7AAAB4",
              fontSize: "14.86px",
              fontFamily: "Space Mono",
              cursor: "pointer",
              marginBottom: "45px",
            }}
          >
            ← Back to home
          </div>

          {/* TOGGLE: Diatur width 50:50 fix */}
          <div
            style={{
              height: "54.86px",
              padding: "4.57px",
              background: "#C4E8EC",
              borderRadius: "18.29px",
              display: "flex",
              boxSizing: "border-box",
              marginBottom: "36px",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                flex: "1 1 0",
                width: "50%",
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
                }}
              >
                Sign in
              </div>
            </div>
            <div
              onClick={() => navigate("/register-doctor")}
              style={{
                flex: "1 1 0",
                width: "50%",
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
                }}
              >
                Create account
              </div>
            </div>
          </div>

          <div style={{ marginBottom: "36px" }}>
            <div
              style={{
                color: "#1C1816",
                fontSize: "32px",
                fontFamily: "Space Grotesk",
                fontWeight: "800",
              }}
            >
              Welcome back, Clinician
            </div>
            <div
              style={{
                color: "#7AAAB4",
                fontSize: "17.15px",
                fontFamily: "Space Grotesk",
                marginTop: "6px",
              }}
            >
              Access your patient monitoring portal.
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "22px",
              marginBottom: "36px",
            }}
          >
            <div>
              <div
                style={{
                  color: "#7AAAB4",
                  fontSize: "13.7px",
                  fontFamily: "Space Mono",
                  letterSpacing: "1.1px",
                  marginBottom: "8px",
                }}
              >
                EMAIL ADDRESS / CLINIC ID
              </div>
              <input
                type="text"
                placeholder="dr.smith@clinic.com"
                style={{
                  width: "100%",
                  height: "55px",
                  padding: "0 18px",
                  background: "#F0FAFB",
                  border: "1.14px solid #C4E8EC",
                  borderRadius: "13.7px",
                  fontSize: "17px",
                  boxSizing: "border-box",
                  outline: "none",
                  fontFamily: "Space Grotesk",
                }}
              />
            </div>
            <div>
              <div
                style={{
                  color: "#7AAAB4",
                  fontSize: "13.7px",
                  fontFamily: "Space Mono",
                  letterSpacing: "1.1px",
                  marginBottom: "8px",
                }}
              >
                PASSWORD
              </div>
              <div style={{ position: "relative", width: "100%" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  style={{
                    width: "100%",
                    height: "55px",
                    padding: "0 18px",
                    paddingRight: "50px",
                    background: "#F0FAFB",
                    border: "1.14px solid #C4E8EC",
                    borderRadius: "13.7px",
                    fontSize: "17px",
                    boxSizing: "border-box",
                    outline: "none",
                    fontFamily: "Space Grotesk",
                  }}
                />
                <div
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "18px",
                    top: "18px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={showPassword ? "#0099A6" : "#7AAAB4"}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <div
                style={{
                  color: "#0099A6",
                  fontSize: "13.7px",
                  fontFamily: "Space Mono",
                  cursor: "pointer",
                }}
              >
                Forgot password?
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate("/admin-dashboard")}
            style={{
              width: "100%",
              height: "57px",
              background: "#0099A6",
              border: "none",
              borderRadius: "38px",
              color: "white",
              fontSize: "17px",
              fontFamily: "Space Grotesk",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span>Sign in to Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginDoctor;
