import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import visensaLogo from "../../assets/visensa-logo.png";
import avatarHands from "../../assets/avatar-hands.png";

const Register = () => {
  const navigate = useNavigate(); 
  const [showPassword, setShowPassword] = useState(false);
  
  // 1. State buat nampung data form
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    condition: ''
  });

  // State buat UI feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 2. Handle perubahan input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. Fungsi utama buat nembak API Backend
  const handleRegister = async (e) => {
    e.preventDefault(); // Mencegah page reload
    setErrorMessage('');

    // Validasi isian kosong
    if (!formData.name || !formData.email || !formData.password) {
      setErrorMessage('Tolong isi nama, email, dan password lu bro.');
      return;
    }

    setIsLoading(true);

    try {
      // Sesuaikan URL dan port dengan backend Express lu
      const response = await fetch(`${import.meta.env.VITE_API_URL || "https://visensa-production.up.railway.app/api/v1"}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          condition: formData.condition,
          role: 'patient' // Di-hardcode karena ini UI khusus pasien
          // note: kalau backend lu udah support nyimpen condition, tambahin di sini
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors && data.errors.length > 0) {
          // Kalau ada pesan detail dari Zod validator, gabungkan semuanya
          const errorMessages = data.errors.map(err => err.message).join(' | ');
          throw new Error(errorMessages);
        }
        throw new Error(data.message || 'Gagal register, coba lagi deh.');
      }

      // Kalau sukses, simpen token dari backend ke localStorage
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.data.user));

      // Arahin ke halaman dashboard
      navigate('/patient-dashboard');
      
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
      {/* SISI KIRI: Dark Branding Panel (Tidak ada yang gua ubah di sini, udah cakep) */}
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

      {/* SISI KANAN: Login / Register Form */}
      <div
        style={{
          flex: 1,
          height: "100vh", 
          overflowY: "auto", 
          display: "flex",
          flexDirection: "column", 
          alignItems: "center", 
          justifyContent: "center",
          paddingTop: "12px",
          paddingBottom: "12px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "380px",
            display: "flex",
            flexDirection: "column",
            padding: "0 16px",
          }}
        >
          <div onClick={() => navigate('/')} style={{ color: "#7AAAB4", fontSize: "12px", fontFamily: "Space Mono, monospace", fontWeight: "400", cursor: "pointer", marginBottom: "16px" }}>
            ← Back to home
          </div>

          <div style={{ height: "40px", padding: "4px", background: "#C4E8EC", borderRadius: "12px", display: "flex", boxSizing: "border-box", marginBottom: "20px", flexShrink: 0 }}>
            <div onClick={() => navigate('/login')} style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", cursor: "pointer" }}>
              <div style={{ color: "#7AAAB4", fontSize: "13px", fontFamily: "Space Grotesk, sans-serif", fontWeight: "600" }}>Sign in</div>
            </div>
            <div style={{ flex: 1, background: "white", boxShadow: "0px 1px 4px rgba(28, 24, 22, 0.08)", borderRadius: "10px", display: "flex", justifyContent: "center", alignItems: "center", cursor: "default" }}>
              <div style={{ color: "#18687E", fontSize: "13px", fontFamily: "Space Grotesk, sans-serif", fontWeight: "600" }}>Create account</div>
            </div>
          </div>

          <div style={{ marginBottom: "20px", flexShrink: 0 }}>
            <div style={{ color: "#1C1816", fontSize: "22px", fontFamily: "Space Grotesk, sans-serif", fontWeight: "800" }}>Create your account</div>
            <div style={{ color: "#7AAAB4", fontSize: "13px", fontFamily: "Space Grotesk, sans-serif", fontWeight: "400", marginTop: "4px" }}>Start your therapy programme for free.</div>
          </div>

          {/* Munculin error message kalau ada */}
          {errorMessage && (
            <div style={{ padding: "10px", backgroundColor: "#FFEBEB", color: "#D32F2F", borderRadius: "8px", fontSize: "12px", marginBottom: "16px", fontFamily: "Space Grotesk, sans-serif" }}>
              {errorMessage}
            </div>
          )}

          {/* BUNGKUS INPUT PAKAI FORM BIAR BISA ENTER */}
          <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px", flexShrink: 0 }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ color: "#7AAAB4", fontSize: "11px", fontFamily: "Space Mono, monospace", fontWeight: "400", letterSpacing: "1px", marginBottom: "4px" }}>FULL NAME</div>
              <input 
                name="name"
                value={formData.name}
                onChange={handleChange}
                type="text" 
                placeholder="Your name" 
                style={{ width: "100%", height: "40px", padding: "0 14px", background: "#F0FAFB", border: "1px solid #C4E8EC", borderRadius: "8px", color: "#1C1816", fontSize: "13px", fontFamily: "Space Grotesk, sans-serif", outline: "none", boxSizing: "border-box" }} 
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ color: "#7AAAB4", fontSize: "11px", fontFamily: "Space Mono, monospace", fontWeight: "400", letterSpacing: "1px", marginBottom: "4px" }}>EMAIL ADDRESS</div>
              <input 
                name="email"
                value={formData.email}
                onChange={handleChange}
                type="email" 
                placeholder="your@email.com" 
                style={{ width: "100%", height: "40px", padding: "0 14px", background: "#F0FAFB", border: "1px solid #C4E8EC", borderRadius: "8px", color: "#1C1816", fontSize: "13px", fontFamily: "Space Grotesk, sans-serif", outline: "none", boxSizing: "border-box" }} 
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ color: "#7AAAB4", fontSize: "11px", fontFamily: "Space Mono, monospace", fontWeight: "400", letterSpacing: "1px", marginBottom: "4px" }}>PASSWORD</div>
              <div style={{ position: "relative", width: "100%" }}>
                <input 
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  type={showPassword ? "text" : "password"} 
                  placeholder="Min. 8 characters" 
                  style={{ width: "100%", height: "40px", paddingLeft: "14px", paddingRight: "40px", background: "#F0FAFB", border: "1px solid #C4E8EC", borderRadius: "8px", color: "#1C1816", fontSize: "13px", fontFamily: "Space Grotesk, sans-serif", outline: "none", boxSizing: "border-box" }} 
                />
                <div onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "14px", top: "11px", cursor: "pointer", display: "flex", alignItems: "center" }}>
                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={showPassword ? "#0099A6" : "#7AAAB4"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ color: "#7AAAB4", fontSize: "11px", fontFamily: "Space Mono, monospace", fontWeight: "400", letterSpacing: "1px", marginBottom: "4px" }}>YOUR CONDITION</div>
              <select 
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                style={{ width: "100%", height: "40px", padding: "0 14px", background: "#F0FAFB", border: "1px solid #C4E8EC", borderRadius: "8px", color: "#7AAAB4", fontSize: "13px", fontFamily: "Space Grotesk, sans-serif", outline: "none", boxSizing: "border-box", appearance: "none", WebkitAppearance: "none", MozAppearance: "none" }}
              >
                <option value="">Select your condition</option>
                <option value="stroke">Stroke Recovery</option>
                <option value="phantom">Phantom Limb Pain</option>
              </select>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              style={{ width: "100%", height: "42px", marginTop: "8px", background: isLoading ? "#7AAAB4" : "#0099A6", border: "none", borderRadius: "21px", boxShadow: "0px 4px 12px rgba(200, 112, 74, 0.2)", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", cursor: isLoading ? "not-allowed" : "pointer" }}
            >
              <span style={{ color: "white", fontSize: "14px", fontFamily: "Space Grotesk, sans-serif", fontWeight: "600" }}>
                {isLoading ? 'Creating account...' : 'Create account'}
              </span>
            </button>
          </form>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginBottom: "20px", flexShrink: 0 }}>
            {["Free first session — no credit card", "Your data stays on your device", "Track your progress over time"].map((benefit, idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "center", gap: "8px", color: "#7AAAB4", fontSize: "12px", fontFamily: "Space Grotesk, sans-serif" }}><span style={{ color: "#3BB8B0" }}>✓</span> {benefit}</div>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", flexShrink: 0 }}>
            <div style={{ textAlign: "center", color: "#7AAAB4", fontSize: "11px", fontFamily: "Space Grotesk, sans-serif", lineHeight: "14px", maxWidth: "350px", margin: "0 auto" }}>
              By creating an account you agree to our <span style={{ textDecoration: "underline", cursor: "pointer" }}>Terms of Service</span> and <span style={{ textDecoration: "underline", cursor: "pointer" }}>Privacy Policy</span>.
            </div>
            <div style={{ textAlign: "center", color: "#7AAAB4", fontSize: "11px", fontFamily: "Space Grotesk, sans-serif", lineHeight: "14px", maxWidth: "350px", margin: "0 auto" }}>
              Already have an account? <span style={{ color: "#0099A6", fontSize:"14px" ,fontWeight: "bold", cursor: "pointer" }} onClick={()=>navigate('/login')}>Sign In</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;