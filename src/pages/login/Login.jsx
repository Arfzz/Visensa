import { useState } from "react";
import { useNavigate } from "react-router-dom";
import visensaLogo from "../../assets/visensa-logo.png";
import avatarHands from "../../assets/avatar-hands.png";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  // 1. State buat nampung inputan
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // State buat UI Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // 2. Handle perubahan ketikan
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. Fungsi tembak API Login
  const handleLogin = async (e) => {
    e.preventDefault(); // Biar halaman nggak kereload
    setErrorMessage("");

    if (!formData.email || !formData.password) {
      setErrorMessage("Email dan password wajib diisi, bro.");
      return;
    }

    setIsLoading(true);

    try {
      // Ingat: Kalau nanti error "Failed to Fetch", ganti localhost jadi 127.0.0.1
      const response = await fetch("http://localhost:3000/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          expectedRole: 'patient'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal login, cek lagi email atau password lu.");
      }

      // 4. Simpan token ke localStorage
      localStorage.setItem("accessToken", data.data.accessToken);
      localStorage.setItem("refreshToken", data.data.refreshToken);
      localStorage.setItem("user", JSON.stringify(data.data.user));

      // 5. Lempar ke halaman exercise (karena dasbor belum ada)
      navigate("/intro");

    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

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
      {/* SISI KIRI: Dark Branding Panel (Nggak ada yang gua ubah) */}
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
          overflow: "hidden",
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

        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: "11.43px", zIndex: 2 }}>
          <img src={visensaLogo} alt="Visensa Logo" style={{ height: "27px", width: "auto" }} />
          <div style={{ color: "white", fontSize: "22.86px", fontFamily: "Space Grotesk, sans-serif", fontWeight: "800", lineHeight: "27.43px", letterSpacing: "0.5px" }}>VISENSA</div>
        </div>

        <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", zIndex: 2, margin: "auto 0" }}>
          <div style={{ width: "240px", height: "140px", position: "relative", marginBottom: "45.72px" }}>
            <img src={avatarHands} alt="Left Hand" style={{ width: "110px", height: "auto", position: "absolute", left: "15px", top: "5px", transform: "rotate(-6deg)", opacity: 0.85 }} />
            <img src={avatarHands} alt="Right Hand" style={{ width: "110px", height: "auto", position: "absolute", right: "15px", top: "5px", transform: "scaleX(-1) rotate(-6deg)", filter: "invert(52%) sepia(87%) saturate(1832%) hue-rotate(141deg) brightness(95%) contrast(101%)", opacity: 0.85 }} />
          </div>
          <div style={{ color: "#F2EDE8", fontSize: "32px", fontFamily: "Space Grotesk, sans-serif", fontWeight: "700", lineHeight: "38.41px", marginBottom: "18.29px" }}>Your recovery,<br />on your schedule.</div>
          <div style={{ maxWidth: "320.04px", color: "#445570", fontSize: "17.15px", fontFamily: "Space Grotesk, sans-serif", fontWeight: "400", lineHeight: "28.29px" }}>Guided mirror therapy sessions from your browser. No hardware, no appointment, no waiting room.</div>
        </div>

        <div style={{ position: "relative", display: "flex", justifyContent: "space-between", width: "100%", zIndex: 2 }}>
          <div style={{ textAlign: "center" }}><div style={{ color: "#0099A6", fontSize: "25.15px", fontFamily: "Space Mono, monospace", fontWeight: "700", lineHeight: "25.15px" }}>94%</div><div style={{ color: "#445570", fontSize: "12.57px", fontFamily: "Space Grotesk, sans-serif", fontWeight: "400", marginTop: "4.57px" }}>Completion rate</div></div>
          <div style={{ textAlign: "center" }}><div style={{ color: "#0099A6", fontSize: "25.15px", fontFamily: "Space Mono, monospace", fontWeight: "700", lineHeight: "25.15px" }}>42%</div><div style={{ color: "#445570", fontSize: "12.57px", fontFamily: "Space Grotesk, sans-serif", fontWeight: "400", marginTop: "4.57px" }}>Pain reduction</div></div>
          <div style={{ textAlign: "center" }}><div style={{ color: "#0099A6", fontSize: "25.15px", fontFamily: "Space Mono, monospace", fontWeight: "700", lineHeight: "25.15px" }}>200+</div><div style={{ color: "#445570", fontSize: "12.57px", fontFamily: "Space Grotesk, sans-serif", fontWeight: "400", marginTop: "4.57px" }}>Studies backing</div></div>
        </div>
      </div>

      {/* SISI KANAN: Login Form */}
      <div
        style={{
          flex: 1,
          height: "100vh",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center", 
          paddingTop: "40px", 
          paddingBottom: "40px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "440px", 
            display: "flex",
            flexDirection: "column",
            padding: "0 20px",
          }}
        >
          <div onClick={() => navigate("/")} style={{ color: "#7AAAB4", fontSize: "13px", fontFamily: "Space Mono, monospace", fontWeight: "400", cursor: "pointer", marginBottom: "24px" }}>
            ← Back to home
          </div>

          <div style={{ height: "46px", padding: "4px", background: "#C4E8EC", borderRadius: "14px", display: "flex", boxSizing: "border-box", marginBottom: "24px", flexShrink: 0 }}>
            <div style={{ flex: 1, background: "white", boxShadow: "0px 1px 4px rgba(28, 24, 22, 0.08)", borderRadius: "12px", display: "flex", justifyContent: "center", alignItems: "center", cursor: "default" }}>
              <div style={{ color: "#18687E", fontSize: "14px", fontFamily: "Space Grotesk, sans-serif", fontWeight: "600" }}>Sign in</div>
            </div>
            <div onClick={() => navigate("/register")} style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", cursor: "pointer" }}>
              <div style={{ color: "#7AAAB4", fontSize: "14px", fontFamily: "Space Grotesk, sans-serif", fontWeight: "600" }}>Create account</div>
            </div>
          </div>

          <div style={{ marginBottom: "24px", flexShrink: 0 }}>
            <div style={{ color: "#1C1816", fontSize: "26px", fontFamily: "Space Grotesk, sans-serif", fontWeight: "800" }}>Welcome back</div>
            <div style={{ color: "#7AAAB4", fontSize: "14px", fontFamily: "Space Grotesk, sans-serif", fontWeight: "400", marginTop: "4px" }}>Continue your therapy programme.</div>
          </div>

          {/* Munculin error message kalau ada */}
          {errorMessage && (
            <div style={{ padding: "12px", backgroundColor: "#FFEBEB", color: "#D32F2F", borderRadius: "8px", fontSize: "13px", marginBottom: "20px", fontFamily: "Space Grotesk, sans-serif" }}>
              {errorMessage}
            </div>
          )}

          {/* BUNGKUS INPUT PAKAI FORM BIAR BISA ENTER */}
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px", flexShrink: 0 }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ color: "#7AAAB4", fontSize: "12px", fontFamily: "Space Mono, monospace", fontWeight: "400", letterSpacing: "1px", marginBottom: "6px" }}>EMAIL ADDRESS</div>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com" 
                style={{ width: "100%", height: "46px", padding: "0 16px", background: "#F0FAFB", border: "1px solid #C4E8EC", borderRadius: "10px", color: "#1C1816", fontSize: "14px", fontFamily: "Space Grotesk, sans-serif", outline: "none", boxSizing: "border-box" }} 
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ color: "#7AAAB4", fontSize: "12px", fontFamily: "Space Mono, monospace", fontWeight: "400", letterSpacing: "1px", marginBottom: "6px" }}>PASSWORD</div>
              <div style={{ position: "relative", width: "100%" }}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••" 
                  style={{ width: "100%", height: "46px", paddingLeft: "16px", paddingRight: "46px", background: "#F0FAFB", border: "1px solid #C4E8EC", borderRadius: "10px", color: "#1C1816", fontSize: "14px", fontFamily: "Space Grotesk, sans-serif", outline: "none", boxSizing: "border-box" }} 
                />
                <div onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "16px", top: "14px", cursor: "pointer", display: "flex", alignItems: "center" }}>
                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={showPassword ? "#0099A6" : "#7AAAB4"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <div style={{ color: "#0099A6", fontSize: "12px", fontFamily: "Space Mono, monospace", fontWeight: "400", cursor: "pointer" }}>Forgot password?</div>
            </div>
            
            <button 
              type="submit"
              disabled={isLoading}
              style={{ width: "100%", height: "48px", marginTop: "8px", background: isLoading ? "#7AAAB4" : "#0099A6", border: "none", borderRadius: "24px", boxShadow: "0px 4px 12px rgba(200, 112, 74, 0.2)", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", cursor: isLoading ? "not-allowed" : "pointer", marginBottom:"16px" }}
            >
              <span style={{ color: "white", fontSize: "15px", fontFamily: "Space Grotesk, sans-serif", fontWeight: "600" }}>
                {isLoading ? "Signing in..." : "Sign in to VISENSA"}
              </span>
            </button>
          </form>

        </div>
        <div style={{textAlign: "center", color: "#7AAAB4", fontSize: "11px", fontFamily: "Space Grotesk, sans-serif", lineHeight: "14px", maxWidth: "350px", margin: "0 auto" }}>
          New to VISENSA? <span style={{ color: "#0099A6", fontSize:"14px" ,fontWeight: "bold", cursor: "pointer" }} onClick={()=>navigate('/register')}>Create account</span>
        </div>
      </div>
    </div>
  );
};

export default Login;