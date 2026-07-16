import { useState } from "react";
import { useNavigate } from "react-router-dom";
import visensaLogo from "../../assets/visensa-logo.png";
import avatarHands from "../../assets/avatar-hands.png";

const LoginDoctor = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div style={{ width: "100vw", height: "100vh", display: "flex", background: "#F1F7F7", margin: 0, padding: 0 }}>
      {/* SISI KIRI: Branding Panel (Sama seperti desain user) */}
      <div style={{ width: "40%", minWidth: "480px", background: "#0C1119", padding: "54px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <img src={visensaLogo} alt="Logo" style={{ height: "27px" }} />
          <div style={{ color: "white", fontSize: "23px", fontWeight: "800" }}>VISENSA</div>
        </div>
        
        <div style={{ textAlign: "center", color: "#F2EDE8" }}>
          <div style={{ fontSize: "32px", fontWeight: "700", marginBottom: "18px" }}>Portal Klinik VISENSA</div>
          <div style={{ color: "#445570", fontSize: "17px" }}>Akses dasbor monitoring pasien untuk tenaga medis profesional.</div>
        </div>
        
        <div style={{ display: "flex", justifyContent: "space-between", color: "#0099A6" }}>
           {/* Stat bisa disesuaikan untuk data klinik */}
           <div><div style={{ fontSize: "25px", fontWeight: "700" }}>50+</div><div style={{ color: "#445570" }}>Active Doctors</div></div>
        </div>
      </div>

      {/* SISI KANAN: Form Login Dokter */}
      <div style={{ flex: 1, padding: "120px 0", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ width: "100%", maxWidth: "480px", padding: "0 27px" }}>
          <div onClick={() => navigate("/")} style={{ color: "#7AAAB4", marginBottom: "45px", cursor: "pointer" }}>← Back to home</div>
          
          <div style={{ marginBottom: "36px" }}>
            <div style={{ fontSize: "32px", fontWeight: "800", color: "#1C1816" }}>Dokter, Selamat Datang</div>
            <div style={{ color: "#7AAAB4", fontSize: "17px", marginTop: "6px" }}>Masuk ke akun klinik Anda.</div>
          </div>

          {/* INPUT KHUSUS DOKTER */}
          <div style={{ display: "flex", flexDirection: "column", gap: "22px", marginBottom: "36px" }}>
            {/* Input ID Dokter / NIP */}
            <div>
              <div style={{ color: "#7AAAB4", fontSize: "13px", marginBottom: "8px" }}>ID DOKTER / NIP</div>
              <input type="text" placeholder="Masukkan ID medis Anda" style={{ width: "100%", height: "55px", padding: "0 18px", background: "#F0FAFB", border: "1px solid #C4E8EC", borderRadius: "13px", boxSizing: "border-box" }} />
            </div>

            {/* Input Password */}
            <div>
              <div style={{ color: "#7AAAB4", fontSize: "13px", marginBottom: "8px" }}>PASSWORD</div>
              <input type={showPassword ? "text" : "password"} placeholder="••••••••" style={{ width: "100%", height: "55px", padding: "0 18px", background: "#F0FAFB", border: "1px solid #C4E8EC", borderRadius: "13px", boxSizing: "border-box" }} />
            </div>
          </div>

          <button 
            onClick={() => navigate('/admin-dashboard')} // Mengarah ke dashboard admin
            style={{ width: "100%", height: "57px", background: "#0099A6", border: "none", borderRadius: "38px", color: "white", fontWeight: "600", fontSize: "17px", cursor: "pointer" }}
          >
            Sign in to Dashboard →
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginDoctor;