import { useState } from "react";
import { useNavigate } from "react-router-dom";
import visensaLogo from "../../assets/visensa-logo.png";
import avatarHands from "../../assets/avatar-hands.png";

// ==========================================
// 1. DATA MOCK (DUMMY DATA)
// ==========================================

const topStats = [
  { label: "RECOVERY", val: "Week 4", sub: "of programme", color: "#0C2830" },
  { label: "SESSIONS", val: "21", sub: "total done", color: "#0C2830" },
  { label: "PAIN", val: "4 / 10", sub: "current level", color: "#0C2830" },
  { label: "STREAK", val: "4 wks", sub: "consecutive", color: "#0C2830" },
];

const chartPoints = [
  { date: "Jun 17", x: 50, y: 50, pain: "8.5" },
  { date: "Jun 24", x: 260, y: 65, pain: "7.0" },
  { date: "Jul 1", x: 470, y: 80, pain: "6.5" }, // Disesuaikan dengan gambar
  { date: "Jul 8", x: 680, y: 95, pain: "5.0" },
  { date: "Today", x: 900, y: 110, pain: "4.0" },
];

const recentSessions = [
  { id: 1, date: "9 Jul", status: "Excellent", statusColor: "#4BA882", statusBg: "rgba(75, 168, 130, 0.10)", isToday: true, desc: "8/8 exercises · 11:42", oldPain: 5, newPain: 4, painDiff: "↓1 pts", diffColor: "#4BA882" },
  { id: 2, date: "8 Jul", status: "Good", statusColor: "#3ED8C8", statusBg: "rgba(62, 216, 200, 0.10)", isToday: false, desc: "8/8 exercises · 12:10", oldPain: 6, newPain: 5, painDiff: "↓1 pts", diffColor: "#4BA882" },
  { id: 3, date: "7 Jul", status: "Fair", statusColor: "#D4A843", statusBg: "rgba(212, 168, 67, 0.10)", isToday: false, desc: "7/8 exercises · 10:55", oldPain: 6, newPain: 5, painDiff: "↓1 pts", diffColor: "#4BA882" },
];

const allSessionsFilters = ["All sessions", "Excellent", "Good", "Fair", "Poor"];

const allSessionsData = [
  { id: 1, day: "9", month: "Jul", title: "Today, 9 Jul 2026", status: "Excellent", statusColor: "#4BA882", statusBg: "rgba(75, 168, 130, 0.10)", isToday: true, exercises: "8/8 exercises", time: "11:42 min", accuracy: "97% accuracy", oldPain: 5, newPain: 4, painDiff: "↓1 pts", diffColor: "#4BA882", boxBg: "rgba(0, 153, 166, 0.08)" },
  { id: 2, day: "8", month: "Jul", title: "Yesterday, 8 Jul 2026", status: "Good", statusColor: "#3ED8C8", statusBg: "rgba(59, 184, 176, 0.10)", isToday: false, exercises: "8/8 exercises", time: "12:10 min", accuracy: "95% accuracy", oldPain: 6, newPain: 5, painDiff: "↓1 pts", diffColor: "#4BA882", boxBg: "#F0FAFB" },
  { id: 3, day: "7", month: "Jul", title: "Mon, 7 Jul 2026", status: "Fair", statusColor: "#D4A843", statusBg: "rgba(212, 168, 67, 0.10)", isToday: false, exercises: "7/8 exercises", time: "10:55 min", accuracy: "91% accuracy", oldPain: 6, newPain: 5, painDiff: "↓1 pts", diffColor: "#4BA882", boxBg: "#F0FAFB" },
  { id: 4, day: "6", month: "Jul", title: "Sun, 6 Jul 2026", status: "Good", statusColor: "#3ED8C8", statusBg: "rgba(59, 184, 176, 0.10)", isToday: false, exercises: "8/8 exercises", time: "12:30 min", accuracy: "96% accuracy", oldPain: 7, newPain: 6, painDiff: "↓1 pts", diffColor: "#4BA882", boxBg: "#F0FAFB" },
  { id: 5, day: "5", month: "Jul", title: "Sat, 5 Jul 2026", status: "Fair", statusColor: "#D4A843", statusBg: "rgba(212, 168, 67, 0.10)", isToday: false, exercises: "6/8 exercises", time: "9:20 min", accuracy: "88% accuracy", oldPain: 7, newPain: 7, painDiff: "no change", diffColor: "#D4A843", boxBg: "#F0FAFB" },
];

const exerciseBreakdown = [
  { name: "Finger extension — slow", reps: "12 reps", percent: 92, status: "Excellent", color: "#4BA882", bg: "rgba(75, 168, 130, 0.10)" },
  { name: "Finger spread & close", reps: "10 reps", percent: 89, status: "Excellent", color: "#4BA882", bg: "rgba(75, 168, 130, 0.10)" },
  { name: "Wrist rotation — outward", reps: "8 reps", percent: 74, status: "Good", color: "#3ED8C8", bg: "rgba(59, 184, 176, 0.10)" },
  { name: "Wrist rotation — inward", reps: "8 reps", percent: 71, status: "Good", color: "#3ED8C8", bg: "rgba(59, 184, 176, 0.10)" },
  { name: "Individual finger tap", reps: "15 reps", percent: 88, status: "Excellent", color: "#4BA882", bg: "rgba(75, 168, 130, 0.10)" },
  { name: "Grip simulation", reps: "10 reps", percent: 78, status: "Good", color: "#3ED8C8", bg: "rgba(59, 184, 176, 0.10)" },
  { name: "Thumb opposition", reps: "12 reps", percent: 75, status: "Good", color: "#3ED8C8", bg: "rgba(59, 184, 176, 0.10)" },
  { name: "Full hand open / close", reps: "10 reps", percent: 91, status: "Excellent", color: "#4BA882", bg: "rgba(75, 168, 130, 0.10)" },
];

const movementChart = [
  { label: "Ext.", val: 92, color: "#4BA882", fullName: "Finger Extension" },
  { label: "Spread", val: 89, color: "#4BA882", fullName: "Finger Spread" },
  { label: "Rot↑", val: 74, color: "#3ED8C8", fullName: "Wrist Rotation Out" },
  { label: "Rot↓", val: 71, color: "#3ED8C8", fullName: "Wrist Rotation In" },
  { label: "Tap", val: 88, color: "#4BA882", fullName: "Individual Tap" },
  { label: "Grip", val: 78, color: "#3ED8C8", fullName: "Grip Simulation" },
  { label: "Thumb", val: 75, color: "#3ED8C8", fullName: "Thumb Opposition" },
  { label: "Open", val: 91, color: "#4BA882", fullName: "Full Hand Open" },
];

const patientNotifications = [
  { id: 1, icon: '🌟', title: 'New milestone reached!', desc: 'You achieved a 4-week streak. Keep up the great work!', time: '2h ago', unread: true, color: '#3ED8C8', bg: 'rgba(62, 216, 200, 0.15)' },
  { id: 2, icon: '📅', title: 'Session reminder', desc: "Dr. Sarah scheduled your next review for July 15.", time: '5h ago', unread: true, color: '#0099A6', bg: 'rgba(0, 153, 166, 0.15)' },
  { id: 3, icon: '✅', title: 'Weekly report ready', desc: 'Your progress report for Week 3 is now available.', time: '1d ago', unread: false, color: '#4BA882', bg: 'rgba(75, 168, 130, 0.15)' },
];

const conditionOptions = ["Phantom Limb Pain", "Stroke Recovery", "Carpal Tunnel Syndrome", "Post-Surgery Rehab"];
const handOptions = ["Left hand", "Right hand", "Both hands"];
const lengthOptions = ["Short (~8 min)", "Standard (~12 min)", "Extended (~18 min)"];

const INITIAL_SETTINGS = {
  fullName: "Robert",
  condition: "Phantom Limb Pain",
  therapyHand: "Left hand",
  sessionLength: "Standard (~12 min)",
  dailyReminders: true,
  email: "kenji@morales.com"
};

// ==========================================
// KOMPONEN HELPER
// ==========================================

const BellIcon = ({ showNotif, setShowNotif }) => (
  <div style={{ position: "relative" }}>
    <div 
      onClick={() => setShowNotif(!showNotif)} 
      style={{ width: "48px", height: "48px", background: "white", borderRadius: "16px", boxShadow: "0px 2px 10px rgba(0,0,0,0.05)", display: "flex", justifyContent: "center", alignItems: "center", position: "relative", cursor: "pointer", flexShrink: 0, border: showNotif ? "1.5px solid #0099A6" : "1.5px solid transparent", transition: "all 0.2s" }}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4A5568" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
      <div style={{ width: "10px", height: "10px", background: "#F97316", borderRadius: "50%", position: "absolute", top: "12px", right: "12px", border: "2px solid white" }} />
    </div>

    {showNotif && (
      <div style={{ position: 'absolute', top: '60px', right: '0', width: '400px', background: 'white', boxShadow: '0px 12px 50px rgba(12, 40, 48, 0.15)', borderRadius: '24px', border: '1.5px solid #C4E8EC', zIndex: 100, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1.5px solid #C4E8EC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ color: '#0C2830', fontSize: '20px', fontWeight: '700', fontFamily: 'Space Grotesk' }}>Notifications</div>
            <div style={{ background: '#F97316', color: 'white', padding: '2px 10px', borderRadius: '20px', fontSize: '13px', fontFamily: 'Space Mono', fontWeight: '700' }}>2</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ color: '#0099A6', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Space Grotesk' }}>Mark all read</div>
            <svg onClick={() => setShowNotif(false)} style={{ cursor: 'pointer' }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7AAAB4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </div>
        </div>

        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {patientNotifications.map((notif) => (
            <div key={notif.id} style={{ padding: '20px 24px', borderBottom: '1.5px solid #E2E8F0', background: notif.unread ? 'rgba(12, 40, 48, 0.02)' : 'white', display: 'flex', gap: '16px', transition: 'background 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,153,166,0.04)'} onMouseLeave={(e) => e.currentTarget.style.background = notif.unread ? 'rgba(12, 40, 48, 0.02)' : 'white'}>
              <div style={{ width: '42px', height: '42px', minWidth: '42px', background: notif.bg, borderRadius: '12px', border: `1.5px solid ${notif.color}40`, display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '18px' }}>
                {notif.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                  <div style={{ color: '#0C2830', fontSize: '15.5px', fontWeight: notif.unread ? '700' : '600', paddingRight: '12px', lineHeight: '1.4', fontFamily: 'Space Grotesk' }}>{notif.title}</div>
                  {notif.unread && <div style={{ width: '10px', height: '10px', minWidth: '10px', background: '#F97316', borderRadius: '50%', marginTop: '4px' }} />}
                </div>
                <div style={{ color: '#7AAAB4', fontSize: '14px', lineHeight: '1.5', marginBottom: '8px', fontFamily: 'Space Grotesk' }}>{notif.desc}</div>
                <div style={{ color: '#7AAAB4', fontSize: '12px', fontFamily: 'Space Mono' }}>{notif.time}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding: '16px', textAlign: 'center', color: '#0099A6', fontSize: '14.5px', fontWeight: '600', background: 'white', cursor: 'pointer', fontFamily: 'Space Grotesk' }}>
          View all notifications →
        </div>
      </div>
    )}
  </div>
);



// ==========================================
// 2. KOMPONEN UTAMA
// ==========================================
const PatientDashboard = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("Dashboard"); 
  const [activeFilter, setActiveFilter] = useState("All sessions");
  
  // State Session & Notif
  const [selectedSession, setSelectedSession] = useState(null);
  const [showNotif, setShowNotif] = useState(false);

  // States Interaktif untuk Chart
  const [hoveredPainPoint, setHoveredPainPoint] = useState(null);
  const [activeBarIndex, setActiveBarIndex] = useState(null);

  // ── Ambil User dari LocalStorage ──
  const [user, setUser] = useState(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch(e) {
        return null;
      }
    }
    return null;
  });

  // ── Dynamic Greeting ──
  const hour = new Date().getHours();
  const greeting = (hour >= 5 && hour < 12) ? "Good morning" : (hour >= 12 && hour < 18) ? "Good afternoon" : "Good evening";

  // States Konten Pengaturan (Settings)
  // States Konten Pengaturan (Settings)
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Update state once user is loaded
  useState(() => {
    if (user) {
      if (user.name) setFullName(user.name);
      if (user.email) setEmail(user.email);
    }
  });

  const hasChanges = 
    (user && fullName !== user.name) ||
    (user && email !== user.email) ||
    password !== "";

  const handleSaveChanges = () => {
    if (!hasChanges) return;
    alert("Changes saved successfully!");
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token"); // if token exists
    navigate("/");
  };

  const renderIcon = (menu, isActive) => {
    const color = isActive ? "#1A2332" : "#7AAAB4";
    if (menu === "Dashboard") {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"></rect><rect x="14" y="3" width="7" height="7" rx="1.5"></rect><rect x="14" y="14" width="7" height="7" rx="1.5"></rect><rect x="3" y="14" width="7" height="7" rx="1.5"></rect></svg>
      );
    }
    if (menu === "Sessions") {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
      );
    }
    if (menu === "Progress") {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
      );
    }
    if (menu === "Settings") {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    }
  };

  return (
    <div style={{ width: "100%", height: "100vh", display: "flex", background: "#F0F2F5", fontFamily: "Space Grotesk, sans-serif", overflow: "hidden", padding: "20px", boxSizing: "border-box", gap: "20px" }}>
      
      {/* ============================== */}
      {/* 1. SIDEBAR (KIRI)              */}
      {/* ============================== */}
      <div style={{ width: "300px", minWidth: "300px", background: "#151E2C", borderRadius: "24px", display: "flex", flexDirection: "column", padding: "35px 25px", boxSizing: "border-box", zIndex: 10, boxShadow: "0px 13px 80px rgba(226, 236, 249, 0.25)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", paddingLeft: "15px", marginBottom: "45px" }}>
          <img src={visensaLogo} alt="VISENSA" style={{ width: "24px", height: "auto" }} />
          <div style={{ color: "#F0FAFB", fontSize: "26px", fontWeight: "800", letterSpacing: "1px" }}>VISENSA</div>
        </div>
        
        {/* Menu Navigation */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", flex: 1 }}>
          {["Dashboard", "Sessions", "Settings"].map((menu) => {
            const isActive = activeMenu === menu;
            return (
              <div 
                key={menu}
                onClick={() => {
                  setActiveMenu(menu);
                  setSelectedSession(null); 
                  setOpenDropdown(null);
                  setIsEditingEmail(false);
                }}
                style={{ padding: "16px 20px", background: isActive ? "linear-gradient(135deg, #C8F135 0%, #96C000 100%)" : "transparent", borderRadius: "16px", display: "flex", alignItems: "center", gap: "15px", cursor: "pointer", boxShadow: isActive ? "0px 5px 17px rgba(31, 168, 143, 0.30)" : "none", transition: "all 0.2s" }}
              >
                {renderIcon(menu, isActive)}
                <div style={{ color: isActive ? "#1A2332" : "#7AAAB4", fontSize: "17px", fontWeight: isActive ? "700" : "500" }}>{menu}</div>
              </div>
            );
          })}
        </div>
        
        <div style={{ background: "rgba(59, 184, 176, 0.06)", border: "1.5px solid rgba(59, 184, 176, 0.16)", borderRadius: "16px", padding: "18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3ED8C8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 15l-2 5-9-5 9-5 2 5z"></path><circle cx="12" cy="8" r="6"></circle></svg>
            <div style={{ color: "#3ED8C8", fontSize: "15.5px", fontWeight: "700" }}>4-week streak</div>
          </div>
          <div style={{ color: "#7AAAB4", fontSize: "14px" }}>Consistent recovery progress.</div>
        </div>
      </div>

      {/* ============================== */}
      {/* 2. AREA TENGAH DINAMIS         */}
      {/* ============================== */}
      
      {/* --- DASHBOARD ACTIVE --- */}
      {activeMenu === "Dashboard" && (
        <>
          <div data-lenis-prevent="true" style={{ flex: 1, padding: "10px 20px 40px 20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "24px", minHeight: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
              <div>
                <div style={{ color: "#9AABB8", fontSize: "15px", fontWeight: "500", marginBottom: "4px" }}>{greeting},</div>
                <div style={{ color: "#1A2332", fontSize: "40px", fontWeight: "700" }}>{user?.name || "Patient"}</div>
              </div>
              <BellIcon showNotif={showNotif} setShowNotif={setShowNotif} />
            </div>

            <div style={{ display: "flex", background: "white", padding: "24px", borderRadius: "20px", border: "1.5px solid #C4E8EC", boxShadow: "0 2px 10px rgba(0,0,0,0.02)", flexShrink: 0 }}>
              {topStats.map((stat, i) => (
                <div key={i} style={{ flex: 1, borderRight: i < 3 ? "1.5px solid #E2E8F0" : "none", paddingLeft: i === 0 ? "0" : "24px", paddingRight: i === 3 ? "0" : "24px" }}>
                  <div style={{ color: "#7AAAB4", fontSize: "13px", fontFamily: "Space Mono", letterSpacing: "1px", marginBottom: "8px", textTransform: "uppercase" }}>{stat.label}</div>
                  <div style={{ color: stat.color, fontSize: "24px", fontWeight: "800", marginBottom: "4px" }}>{stat.val}</div>
                  <div style={{ color: "#7AAAB4", fontSize: "14px" }}>{stat.sub}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: "20px", height: "230px", flexShrink: 0 }}>
              <div style={{ flex: 1, background: "linear-gradient(135deg, #0099A6 0%, #007580 100%)", borderRadius: "24px", padding: "24px", color: "white", display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: "14.5px", opacity: 0.8, marginBottom: "12px" }}>Pain today</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "4px" }}>
                  <span style={{ fontSize: "42px", fontFamily: "Space Mono", fontWeight: "700" }}>4</span>
                  <span style={{ fontSize: "18px", fontFamily: "Space Mono", opacity: 0.8 }}>/10</span>
                </div>
                <div style={{ fontSize: "14px", opacity: 0.8, marginBottom: "auto" }}>↓ from 8.5 at start</div>
                <div style={{ display: "flex", gap: "6px", height: "45px", alignItems: "flex-end", marginTop: "20px" }}>
                  {[0.4, 0.5, 0.6, 0.7, 0.8, 1].map((o, i) => <div key={i} style={{ flex: 1, background: "rgba(255,255,255,0.25)", height: `${40 + i*12}%`, borderRadius: "4px", opacity: o }} />)}
                </div>
              </div>
              <div style={{ flex: 1, background: "linear-gradient(135deg, #3ED8C8 0%, #28C0AE 100%)", borderRadius: "24px", padding: "24px", color: "white", display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: "14.5px", opacity: 0.8, marginBottom: "12px" }}>Sessions this month</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "4px" }}>
                  <span style={{ fontSize: "42px", fontFamily: "Space Mono", fontWeight: "700" }}>7</span>
                  <span style={{ fontSize: "18px", fontFamily: "Space Mono", opacity: 0.8 }}>sessions</span>
                </div>
                <div style={{ fontSize: "14px", opacity: 0.8, marginBottom: "auto" }}>Goal: 8/month</div>
                <div style={{ display: "flex", gap: "6px", height: "45px", alignItems: "flex-end", marginTop: "20px" }}>
                  {[0.5, 0.6, 0.7, 0.8, 0.9, 1].map((o, i) => <div key={i} style={{ flex: 1, background: "rgba(255,255,255,0.25)", height: `${50 + i*10}%`, borderRadius: "4px", opacity: o }} />)}
                </div>
              </div>
              <div style={{ flex: 1, background: "linear-gradient(135deg, #4B8BE0 0%, #2E6BC4 100%)", borderRadius: "24px", padding: "24px", color: "white", display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: "14.5px", opacity: 0.8, marginBottom: "12px" }}>Avg joint accuracy</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "4px" }}>
                  <span style={{ fontSize: "42px", fontFamily: "Space Mono", fontWeight: "700" }}>93</span>
                  <span style={{ fontSize: "18px", fontFamily: "Space Mono", opacity: 0.8 }}>%</span>
                </div>
                <div style={{ fontSize: "14px", opacity: 0.8, marginBottom: "auto" }}>Improving each week</div>
                <div style={{ display: "flex", gap: "6px", height: "45px", alignItems: "flex-end", marginTop: "20px" }}>
                  {[0.6, 0.65, 0.75, 0.85, 0.95, 1].map((o, i) => <div key={i} style={{ flex: 1, background: "rgba(255,255,255,0.25)", height: `${50 + i*10}%`, borderRadius: "4px", opacity: o }} />)}
                </div>
              </div>
            </div>

            {/* INTERAKTIF: Grafik Pain Trend (Garis) dengan Tooltip Kotak Putih */}
            <div style={{ background: "white", borderRadius: "20px", border: "1.5px solid #C4E8EC", padding: "28px", boxShadow: "0 2px 10px rgba(0,0,0,0.02)", flexShrink: 0, position: "relative" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                <div>
                  <div style={{ color: "#0C2830", fontSize: "17px", fontWeight: "700", marginBottom: "4px" }}>Pain trend</div>
                  <div style={{ color: "#7AAAB4", fontSize: "15px" }}>Monthly average</div>
                </div>
                <div style={{ background: "rgba(75, 168, 130, 0.1)", border: "1.5px solid rgba(75, 168, 130, 0.2)", color: "#4BA882", padding: "6px 14px", borderRadius: "20px", fontSize: "15px", fontWeight: "600", display: "flex", alignItems: "center" }}>↘ −53%</div>
              </div>
              
              <div style={{ position: "relative", height: "160px", width: "100%", borderBottom: "1.5px solid #E2E8F0", marginBottom: "15px" }}>
                
                {/* TOOLTIP DINAMIS KOTAK PUTIH */}
                {hoveredPainPoint && (
                  <div style={{ position: "absolute", left: `${(hoveredPainPoint.x / 960) * 100}%`, top: `${hoveredPainPoint.y - 80}px`, transform: "translateX(-50%)", background: "white", padding: "10px 18px", borderRadius: "16px", border: "1.5px solid #C4E8EC", zIndex: 10, pointerEvents: "none", boxShadow: "0 10px 30px rgba(0,153,166,0.15)", display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
                    <div style={{ color: "#7AAAB4", fontSize: "14px", fontFamily: "Space Mono" }}>
                      {hoveredPainPoint.date}
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "2px" }}>
                       <span style={{ color: "#0099A6", fontSize: "26px", fontFamily: "Space Mono", fontWeight: "700" }}>{hoveredPainPoint.pain}</span>
                       <span style={{ color: "#7AAAB4", fontSize: "14px", fontFamily: "Space Mono" }}>/10</span>
                    </div>
                  </div>
                )}

                <svg viewBox="0 0 960 160" preserveAspectRatio="none" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", overflow: "visible" }}>
                  <defs>
                    <linearGradient id="painGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="rgba(0, 153, 166, 0.2)" />
                      <stop offset="100%" stopColor="rgba(0, 153, 166, 0)" />
                    </linearGradient>
                  </defs>
                  <polygon points="50,160 50,50 260,65 470,80 680,95 900,110 900,160" fill="url(#painGradient)" />
                  <line x1="50" y1="40" x2="900" y2="40" stroke="#F1F5F9" strokeWidth="1.5" strokeDasharray="4 4" />
                  <line x1="50" y1="90" x2="900" y2="90" stroke="#F1F5F9" strokeWidth="1.5" strokeDasharray="4 4" />
                  
                  {/* CROSSHAIR VERTICAL LINE */}
                  {hoveredPainPoint && (
                    <line x1={hoveredPainPoint.x} y1="0" x2={hoveredPainPoint.x} y2="160" stroke="#C4E8EC" strokeWidth="2" />
                  )}

                  <polyline points="50,50 260,65 470,80 680,95 900,110" fill="none" stroke="#0099A6" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
                  
                  {chartPoints.map((pt, i) => (
                    <circle 
                      key={i} cx={pt.x} cy={pt.y} r={hoveredPainPoint?.date === pt.date ? "9" : "6"} 
                      fill="#0099A6" stroke={hoveredPainPoint?.date === pt.date ? "#0099A6" : "white"} strokeWidth="3" 
                      style={{ cursor: "pointer", transition: "all 0.15s ease" }}
                      onMouseEnter={() => setHoveredPainPoint(pt)}
                      onMouseLeave={() => setHoveredPainPoint(null)}
                    />
                  ))}
                </svg>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#7AAAB4", fontSize: "13px", fontFamily: "Space Mono", padding: "0 25px" }}>
                {chartPoints.map((pt, i) => <span key={i}>{pt.date}</span>)}
              </div>
            </div>

            <div style={{ background: "white", borderRadius: "20px", border: "1.5px solid #C4E8EC", overflow: "hidden", flexShrink: 0 }}>
              <div style={{ padding: "24px", borderBottom: "1.5px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ color: "#0C2830", fontSize: "17px", fontWeight: "700" }}>Recent sessions</div>
                <div style={{ color: "#7AAAB4", fontSize: "14px", fontFamily: "Space Mono" }}>last 8</div>
              </div>
              <div>
                {recentSessions.map((session, i) => (
                  <div key={i} style={{ padding: "20px 24px", borderBottom: "1px solid #E2E8F0", display: "flex", alignItems: "center", background: session.isToday ? "rgba(200, 112, 74, 0.02)" : "white" }}>
                    <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: session.isToday ? "#0099A6" : "#C4E8EC", marginRight: "20px" }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                        <span style={{ color: "#0C2830", fontSize: "16px", fontWeight: "600" }}>{session.date}</span>
                        <span style={{ background: session.statusBg, border: `1px solid ${session.statusColor}30`, color: session.statusColor, padding: "2px 12px", borderRadius: "20px", fontSize: "13px", fontFamily: "Space Mono", fontWeight: "700" }}>{session.status}</span>
                        {session.isToday && <span style={{ color: "#0099A6", fontSize: "13px", fontFamily: "Space Mono" }}>today</span>}
                      </div>
                      <div style={{ color: "#7AAAB4", fontSize: "14px", fontFamily: "Space Mono" }}>{session.desc}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", fontFamily: "Space Mono", fontWeight: "700" }}>
                      <span style={{ color: "#D4A843", fontSize: "16px" }}>{session.oldPain}</span>
                      <span style={{ color: "#7AAAB4", fontSize: "13px", fontWeight: "400" }}>→</span>
                      <span style={{ color: "#D4A843", fontSize: "16px" }}>{session.newPain}</span>
                      <span style={{ color: session.diffColor, fontSize: "13px", fontWeight: "400", marginLeft: "4px" }}>{session.painDiff}</span>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7AAAB4" strokeWidth="2.5" style={{ marginLeft: "10px" }}><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </div>
                  </div>
                ))}
              </div>
              <div onClick={() => setActiveMenu("Sessions")} style={{ padding: "20px 24px", color: "#0099A6", fontSize: "15px", fontWeight: "600", cursor: "pointer" }}>
                View all sessions →
              </div>
            </div>
          </div>

          <div data-lenis-prevent="true" style={{ width: "400px", minWidth: "400px", background: "linear-gradient(160deg, #EBF5F7 0%, #F0F4F8 40%, #EEF5ED 100%)", borderRadius: "24px", border: "1.5px solid #C4CFEC", padding: "30px", display: "flex", flexDirection: "column", gap: "24px", overflowY: "auto", position: "relative", minHeight: 0 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
              <button 
                onClick={() => navigate('/intro')}
                style={{ width: "100%", padding: "18px", background: "linear-gradient(135deg, #C2EB30 0%, #9AC404 100%)", border: "none", borderRadius: "18px", color: "white", fontSize: "18px", fontFamily: "Space Grotesk", fontWeight: "700", cursor: "pointer", boxShadow: "0 8px 25px rgba(154, 196, 4, 0.3)", display: "flex", justifyContent: "center", alignItems: "center", gap: "10px", marginBottom: "16px" }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                Start today's session
              </button>
              <div style={{ color: "#7AAAB4", fontSize: "14px", fontFamily: "Space Mono" }}>8 exercises · ~12 min · Left hand</div>
            </div>

            <div style={{ flex: 1, position: "relative", minHeight: "450px", display: "flex", justifyContent: "center", alignItems: "center", marginTop: "20px", flexShrink: 0 }}>
               <div style={{ width: "250px", height: "250px", background: "radial-gradient(circle, rgba(59,184,176,0.15) 0%, rgba(255,255,255,0) 70%)", position: "absolute", zIndex: 1 }} />
               <img src={avatarHands} alt="Hands" style={{ width: "200px", position: "absolute", zIndex: 2, filter: "invert(52%) sepia(87%) saturate(1832%) hue-rotate(141deg) brightness(95%) contrast(101%)", opacity: 0.6 }} />
               <div style={{ position: "absolute", top: "5%", right: "0%", background: "white", padding: "18px", borderRadius: "20px", boxShadow: "0 10px 30px rgba(59,184,176,0.15)", border: "1.5px solid rgba(59,184,176,0.2)", zIndex: 3 }}>
                  <div style={{ color: "#7AAAB4", fontSize: "12px", fontFamily: "Space Mono", marginBottom: "10px", letterSpacing: "1px" }}>JOINT ACCURACY</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "8px" }}>
                     <span style={{ color: "#3ED8C8", fontSize: "32px", fontFamily: "Space Mono", fontWeight: "700" }}>97</span>
                     <span style={{ color: "#7AAAB4", fontSize: "16px", fontFamily: "Space Mono" }}>%</span>
                  </div>
                  <div style={{ display: "flex", gap: "4px" }}>
                     {[0.5, 0.6, 0.7, 0.8, 1].map((o, i) => <div key={i} style={{ width: "16px", height: "10px", background: "#3ED8C8", borderRadius: "3px", opacity: o }} />)}
                  </div>
               </div>
               <div style={{ position: "absolute", top: "35%", left: "-5%", background: "white", padding: "18px", borderRadius: "20px", boxShadow: "0 10px 30px rgba(200,112,74,0.12)", border: "1.5px solid rgba(200,112,74,0.2)", zIndex: 3 }}>
                  <div style={{ color: "#7AAAB4", fontSize: "12px", fontFamily: "Space Mono", marginBottom: "10px", letterSpacing: "1px" }}>PAIN LEVEL</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "6px" }}>
                     <span style={{ color: "#0099A6", fontSize: "32px", fontFamily: "Space Mono", fontWeight: "700" }}>4</span>
                     <span style={{ color: "#7AAAB4", fontSize: "16px", fontFamily: "Space Mono" }}>/10</span>
                  </div>
                  <div style={{ color: "#4BA882", fontSize: "13px", fontWeight: "600" }}>↓ from 8.5</div>
               </div>
               <div style={{ position: "absolute", bottom: "25%", right: "5%", background: "white", padding: "18px", borderRadius: "20px", boxShadow: "0 10px 30px rgba(75,168,130,0.1)", border: "1.5px solid rgba(75,168,130,0.2)", zIndex: 3 }}>
                  <div style={{ color: "#7AAAB4", fontSize: "12px", fontFamily: "Space Mono", marginBottom: "10px", letterSpacing: "1px" }}>RECOVERY</div>
                  <div style={{ color: "#4BA882", fontSize: "26px", fontFamily: "Space Mono", fontWeight: "700", marginBottom: "6px" }}>Week 4</div>
                  <div style={{ color: "#7AAAB4", fontSize: "13px" }}>21 sessions done</div>
               </div>
            </div>

            <div style={{ background: "white", padding: "24px", borderRadius: "20px", border: "1.5px solid #C4E8EC", boxShadow: "0 4px 15px rgba(0,0,0,0.04)", flexShrink: 0 }}>
              <div style={{ color: "#7AAAB4", fontSize: "13px", fontFamily: "Space Mono", letterSpacing: "1px", marginBottom: "10px", textTransform: "uppercase" }}>NEXT REVIEW</div>
              <div style={{ color: "#0C2830", fontSize: "18px", fontWeight: "700", marginBottom: "6px" }}>July 15, 2026</div>
              <div style={{ color: "#7AAAB4", fontSize: "14px" }}>Dr. Sarah K. — Occupational Therapy</div>
            </div>
          </div>
        </>
      )}

      {/* --- SESSIONS ACTIVE --- */}
      {activeMenu === "Sessions" && (
        <div data-lenis-prevent="true" style={{ flex: 1, padding: "10px 20px 40px 20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "24px", minHeight: 0 }}>
          
          {!selectedSession ? (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
                <div>
                  <div style={{ color: "#1A2332", fontSize: "40px", fontFamily: "Space Grotesk", fontWeight: "700", marginBottom: "4px" }}>All sessions</div>
                  <div style={{ color: "#9AABB8", fontSize: "15px", fontFamily: "Space Grotesk", fontWeight: "500" }}>Tap any row to view detailed analysis.</div>
                </div>
                <BellIcon showNotif={showNotif} setShowNotif={setShowNotif} />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
                <div style={{ display: "flex", gap: "12px" }}>
                  {allSessionsFilters.map((filter) => (
                    <div key={filter} onClick={() => setActiveFilter(filter)} style={{ padding: "10px 24px", background: activeFilter === filter ? "rgba(0, 153, 166, 0.08)" : "white", borderRadius: "100px", border: activeFilter === filter ? "1.5px solid #0099A6" : "1.5px solid #C4E8EC", color: activeFilter === filter ? "#0099A6" : "#3A6870", fontSize: "16px", fontFamily: "Space Grotesk", fontWeight: activeFilter === filter ? "600" : "400", cursor: "pointer" }}>
                      {filter}
                    </div>
                  ))}
                </div>
                <div style={{ color: "#7AAAB4", fontSize: "16px", fontFamily: "Space Mono" }}>{allSessionsData.length} sessions</div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {allSessionsData.map((session) => (
                  <div key={session.id} onClick={() => { setSelectedSession(session); }} style={{ background: "white", borderRadius: "24px", border: "1.5px solid #C4E8EC", padding: "28px 32px", display: "flex", alignItems: "center", gap: "28px", boxShadow: "0px 2px 10px rgba(28, 24, 22, 0.04)", cursor: "pointer", transition: "transform 0.2s", flexShrink: 0 }}>
                    <div style={{ width: "76px", height: "76px", background: session.boxBg, borderRadius: "20px", border: "1.5px solid #C4E8EC", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", flexShrink: 0 }}>
                      <div style={{ color: "#0099A6", fontSize: "26px", fontFamily: "Space Mono", fontWeight: "700", lineHeight: "1" }}>{session.day}</div>
                      <div style={{ color: "#7AAAB4", fontSize: "15px", fontFamily: "Space Mono", marginTop: "4px" }}>{session.month}</div>
                    </div>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                        <div style={{ color: "#0C2830", fontSize: "22px", fontFamily: "Space Grotesk", fontWeight: "600" }}>{session.title}</div>
                        <div style={{ background: session.statusBg, border: `1.5px solid ${session.statusColor}33`, color: session.statusColor, padding: "4px 14px", borderRadius: "100px", fontSize: "14px", fontFamily: "Space Mono", fontWeight: "700" }}>{session.status}</div>
                        {session.isToday && <div style={{ color: "#0099A6", fontSize: "15px", fontFamily: "Space Mono" }}>today</div>}
                      </div>
                      <div style={{ display: "flex", gap: "24px", color: "#7AAAB4", fontSize: "16px", fontFamily: "Space Mono" }}>
                        <span>{session.exercises}</span><span>{session.time}</span><span>{session.accuracy}</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", fontFamily: "Space Mono", fontWeight: "700" }}>
                        <span style={{ color: "#D4A843", fontSize: "22px" }}>{session.oldPain}</span>
                        <span style={{ color: "#7AAAB4", fontSize: "16px", fontWeight: "400" }}>→</span>
                        <span style={{ color: "#D4A843", fontSize: "22px" }}>{session.newPain}</span>
                      </div>
                      <div style={{ color: session.diffColor, fontSize: "16px", fontFamily: "Space Mono" }}>{session.painDiff}</div>
                    </div>
                    <div style={{ marginLeft: "10px" }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7AAAB4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
                <div onClick={() => setSelectedSession(null)} style={{ color: "#0099A6", fontSize: "16px", fontFamily: "Space Grotesk", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                  ← Back to all sessions
                </div>
                <BellIcon showNotif={showNotif} setShowNotif={setShowNotif} />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexShrink: 0 }}>
                <div>
                  <div style={{ color: "#0C2830", fontSize: "38px", fontFamily: "Space Grotesk", fontWeight: "800", marginBottom: "12px" }}>{selectedSession.title}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", fontFamily: "Space Mono" }}>
                    <span style={{ background: selectedSession.statusBg, color: selectedSession.statusColor, padding: "4px 14px", borderRadius: "100px", fontSize: "14.5px", fontWeight: "700" }}>{selectedSession.status}</span>
                    <span style={{ color: "#7AAAB4", fontSize: "16px" }}>{selectedSession.time} · {selectedSession.exercises}</span>
                  </div>
                </div>
                <button style={{ padding: "12px 24px", background: "white", border: "1.5px solid #C4E8EC", borderRadius: "14px", color: "#3A6870", fontSize: "16px", fontFamily: "Space Grotesk", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  Export PDF
                </button>
              </div>

              <div style={{ display: "flex", gap: "16px", flexShrink: 0 }}>
                <div style={{ flex: 1, background: "white", padding: "26px", borderRadius: "20px", border: "1.5px solid #C4E8EC", boxShadow: "0 2px 10px rgba(0,0,0,0.03)", textAlign: "center" }}>
                  <div style={{ color: "#7AAAB4", fontSize: "13px", fontFamily: "Space Mono", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px" }}>Pain before</div>
                  <div><span style={{ color: "#D4A843", fontSize: "38px", fontFamily: "Space Mono", fontWeight: "700" }}>{selectedSession.oldPain}</span><span style={{ color: "#7AAAB4", fontSize: "16px", fontFamily: "Space Mono" }}>/10</span></div>
                </div>
                <div style={{ flex: 1, background: "white", padding: "26px", borderRadius: "20px", border: "1.5px solid #C4E8EC", boxShadow: "0 2px 10px rgba(0,0,0,0.03)", textAlign: "center" }}>
                  <div style={{ color: "#7AAAB4", fontSize: "13px", fontFamily: "Space Mono", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px" }}>Pain after</div>
                  <div><span style={{ color: "#D4A843", fontSize: "38px", fontFamily: "Space Mono", fontWeight: "700" }}>{selectedSession.newPain}</span><span style={{ color: "#7AAAB4", fontSize: "16px", fontFamily: "Space Mono" }}>/10</span></div>
                </div>
                <div style={{ flex: 1, background: "white", padding: "26px", borderRadius: "20px", border: "1.5px solid #C4E8EC", boxShadow: "0 2px 10px rgba(0,0,0,0.03)", textAlign: "center" }}>
                  <div style={{ color: "#7AAAB4", fontSize: "13px", fontFamily: "Space Mono", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px" }}>Change</div>
                  <div><span style={{ color: "#4BA882", fontSize: "38px", fontFamily: "Space Mono", fontWeight: "700" }}>{selectedSession.painDiff.replace('pts', '').replace('no change', '0')}</span><span style={{ color: "#7AAAB4", fontSize: "16px", fontFamily: "Space Mono", marginLeft: "4px" }}>pts</span></div>
                </div>
                <div style={{ flex: 1, background: "white", padding: "26px", borderRadius: "20px", border: "1.5px solid #C4E8EC", boxShadow: "0 2px 10px rgba(0,0,0,0.03)", textAlign: "center" }}>
                  <div style={{ color: "#7AAAB4", fontSize: "13px", fontFamily: "Space Mono", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px" }}>Accuracy</div>
                  <div><span style={{ color: "#3ED8C8", fontSize: "38px", fontFamily: "Space Mono", fontWeight: "700" }}>{selectedSession.accuracy.replace('% accuracy', '')}</span><span style={{ color: "#7AAAB4", fontSize: "16px", fontFamily: "Space Mono" }}>%</span></div>
                </div>
              </div>

              <div style={{ background: "white", padding: "32px 35px", borderRadius: "24px", border: "1.5px solid #C4E8EC", boxShadow: "0 2px 12px rgba(0,0,0,0.03)", flexShrink: 0, position: "relative" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
                  <div>
                    <div style={{ color: "#0C2830", fontSize: "19px", fontFamily: "Space Grotesk", fontWeight: "700", marginBottom: "6px" }}>Movement range per exercise</div>
                    <div style={{ color: "#7AAAB4", fontSize: "16px", fontFamily: "Space Grotesk" }}>
                      {activeBarIndex !== null ? `${movementChart[activeBarIndex].fullName}: ${movementChart[activeBarIndex].val}%` : "Hover grafik batang untuk melihat detail persentase"}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                    <div style={{ display: "flex", gap: "16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><div style={{ width: "10px", height: "10px", background: "#4BA882", borderRadius: "50%" }} /><span style={{ color: "#7AAAB4", fontSize: "14px", fontFamily: "Space Mono" }}>Excellent</span></div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><div style={{ width: "10px", height: "10px", background: "#3ED8C8", borderRadius: "50%" }} /><span style={{ color: "#7AAAB4", fontSize: "14px", fontFamily: "Space Mono" }}>Good</span></div>
                    </div>
                    <div style={{ padding: "8px 16px", background: "white", border: "1.5px solid #C4E8EC", borderRadius: "10px", display: "flex", alignItems: "center", gap: "8px", fontSize: "14.5px", fontFamily: "Space Grotesk", color: "#3A6870", cursor: "pointer", fontWeight: "500" }}>
                      <span>All exercises</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </div>
                  </div>
                </div>
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", height: "180px", padding: "0 30px", borderBottom: "1.5px solid transparent", position: "relative", marginTop: "20px" }}>
                  {movementChart.map((bar, i) => {
                    const isSelected = activeBarIndex === i;
                    return (
                      <div 
                        key={i} 
                        onMouseEnter={() => setActiveBarIndex(i)}
                        onMouseLeave={() => setActiveBarIndex(null)}
                        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", width: "48px", cursor: "pointer", height: "100%", justifyContent: "flex-end" }}
                      >
                        <div style={{ position: "relative", width: "100%", height: `${bar.val}%`, display: "flex", justifyContent: "center" }}>
                           <span style={{ position: "absolute", top: "-25px", fontSize: "12px", fontFamily: "Space Mono", fontWeight: "700", color: bar.color, opacity: isSelected ? 1 : 0, transition: "opacity 0.2s", whiteSpace: "nowrap" }}>
                             {bar.val}%
                           </span>
                           <div style={{ width: "100%", height: "100%", background: bar.color, borderRadius: "8px 8px 0 0", opacity: isSelected ? 1 : 0.85, transform: isSelected ? "scaleY(1.02)" : "scaleY(1)", transformOrigin: "bottom", transition: "all 0.2s ease" }} />
                        </div>
                        <div style={{ color: isSelected ? "#0C2830" : "#7AAAB4", fontSize: "13px", fontFamily: "Space Mono", fontWeight: isSelected ? "700" : "400", transition: "all 0.2s" }}>
                          {bar.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ background: "white", borderRadius: "24px", border: "1.5px solid #C4E8EC", overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.03)", flexShrink: 0 }}>
                <div style={{ padding: "20px 30px", borderBottom: "1.5px solid #C4E8EC", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ color: "#0C2830", fontSize: "18px", fontFamily: "Space Grotesk", fontWeight: "700" }}>Exercise breakdown</div>
                  <div style={{ color: "#7AAAB4", fontSize: "15px", fontFamily: "Space Mono" }}>8 of 8</div>
                </div>
                
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {exerciseBreakdown.map((ex, i) => (
                    <div key={i} style={{ padding: "18px 30px", borderBottom: i !== exerciseBreakdown.length - 1 ? "1.5px solid #C4E8EC" : "none", display: "flex", alignItems: "center", gap: "20px" }}>
                      <div style={{ width: "32px", height: "32px", background: ex.bg, border: `1.5px solid ${ex.color}40`, borderRadius: "8px", display: "flex", justifyContent: "center", alignItems: "center", flexShrink: 0 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ex.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      </div>
                      <div style={{ flex: 1, color: "#0C2830", fontSize: "17px", fontFamily: "Space Grotesk", fontWeight: "500" }}>{ex.name}</div>
                      <div style={{ color: "#7AAAB4", fontSize: "15px", fontFamily: "Space Mono", width: "80px" }}>{ex.reps}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", width: "140px" }}>
                        <div style={{ flex: 1, height: "6px", background: "#C4E8EC", borderRadius: "10px", overflow: "hidden" }}>
                          <div style={{ width: `${ex.percent}%`, height: "100%", background: ex.color, borderRadius: "10px" }} />
                        </div>
                        <div style={{ color: "#7AAAB4", fontSize: "14px", fontFamily: "Space Mono", width: "35px" }}>{ex.percent}%</div>
                      </div>
                      <div style={{ background: ex.bg, border: `1.5px solid ${ex.color}30`, borderRadius: "20px", padding: "4px 16px", color: ex.color, fontSize: "14px", fontFamily: "Space Mono", fontWeight: "700", minWidth: "100px", textAlign: "center" }}>
                        {ex.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: "rgba(0, 153, 166, 0.08)", border: "1.5px solid rgba(0, 153, 166, 0.2)", borderRadius: "24px", padding: "30px 35px", display: "flex", alignItems: "center", gap: "24px", marginTop: "10px", flexShrink: 0 }}>
                <div style={{ width: "60px", height: "60px", background: "linear-gradient(135deg, #0099A6 0%, #007580 100%)", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center", flexShrink: 0 }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
                <div>
                  <div style={{ color: "#0C2830", fontSize: "20px", fontFamily: "Space Grotesk", fontWeight: "700", marginBottom: "8px" }}>Dr. Sarah K., Occupational Therapist</div>
                  <div style={{ color: "#3A6870", fontSize: "19px", fontFamily: "Space Grotesk", lineHeight: "1.5" }}>Excellent consistency this week, Robert. Your next review is July 15.</div>
                </div>
              </div>
            </>
          )}

        </div>
      )}

      {/* --- SETTINGS ACTIVE --- */}
      {activeMenu === "Settings" && (
        <div data-lenis-prevent="true" style={{ flex: 1, padding: "10px 20px 40px 20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "24px", minHeight: 0 }}>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
            <div>
              <div style={{ color: "#1A2332", fontSize: "40px", fontFamily: "Space Grotesk", fontWeight: "700", marginBottom: "4px" }}>Settings</div>
              <div style={{ color: "#9AABB8", fontSize: "15px", fontFamily: "Space Grotesk", fontWeight: "500" }}>Manage your profile and preferences.</div>
            </div>
            <BellIcon showNotif={showNotif} setShowNotif={setShowNotif} />
          </div>

          <div style={{ display: "flex", gap: "24px", alignItems: "flex-start", flexShrink: 0 }}>
            
            <div style={{ flex: 1.5, display: "flex", flexDirection: "column", gap: "24px" }}>
              
              <div style={{ background: "white", borderRadius: "20px", border: "1.5px solid #C4E8EC", overflow: "visible", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
                <div style={{ padding: "20px 24px", borderBottom: "1.5px solid #C4E8EC" }}>
                  <div style={{ color: "#0C2830", fontSize: "18px", fontFamily: "Space Grotesk", fontWeight: "700" }}>Your profile</div>
                </div>
                <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label style={{ color: "#7AAAB4", fontSize: "14px", fontFamily: "Space Mono", textTransform: "uppercase", letterSpacing: "1px" }}>Full name</label>
                    <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} style={{ padding: "14px 20px", border: "1.5px solid #C4E8EC", borderRadius: "12px", fontSize: "17px", fontFamily: "Space Grotesk", color: "#0C2830", outline: "none", width: "100%", boxSizing: "border-box" }} />
                  </div>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label style={{ color: "#7AAAB4", fontSize: "14px", fontFamily: "Space Mono", textTransform: "uppercase", letterSpacing: "1px" }}>Email address</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ padding: "14px 20px", border: "1.5px solid #C4E8EC", borderRadius: "12px", fontSize: "17px", fontFamily: "Space Grotesk", color: "#0C2830", outline: "none", width: "100%", boxSizing: "border-box" }} />
                  </div>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label style={{ color: "#7AAAB4", fontSize: "14px", fontFamily: "Space Mono", textTransform: "uppercase", letterSpacing: "1px" }}>Change password</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter new password" style={{ padding: "14px 20px", border: "1.5px solid #C4E8EC", borderRadius: "12px", fontSize: "17px", fontFamily: "Space Grotesk", color: "#0C2830", outline: "none", width: "100%", boxSizing: "border-box" }} />
                  </div>
                  
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                     <button 
                       onClick={handleSaveChanges}
                       disabled={!hasChanges}
                       style={{ padding: "12px 24px", background: hasChanges ? "#0099A6" : "#C4E8EC", color: "white", border: "none", borderRadius: "12px", fontSize: "16px", fontFamily: "Space Grotesk", fontWeight: "600", cursor: hasChanges ? "pointer" : "not-allowed", transition: "background 0.3s" }}
                     >
                       Save changes
                     </button>
                  </div>
                  
                </div>
              </div>



            </div>

            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "24px" }}>
              
              <div style={{ background: "white", borderRadius: "20px", border: "1.5px solid #C4E8EC", overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
                <div style={{ padding: "20px 24px", borderBottom: "1.5px solid #C4E8EC" }}>
                  <div style={{ color: "#0C2830", fontSize: "18px", fontFamily: "Space Grotesk", fontWeight: "700" }}>Account</div>
                </div>
                
                <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "24px" }}>
                  
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #F0FAFB", paddingBottom: "16px" }}>
                    <div>
                      <div style={{ color: "#0C2830", fontSize: "16px", fontFamily: "Space Grotesk", fontWeight: "600", marginBottom: "4px" }}>Full Name</div>
                      <div style={{ color: "#7AAAB4", fontSize: "15px", fontFamily: "Space Grotesk" }}>{user?.name || "Not set"}</div>
                    </div>
                  </div>
                  
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ color: "#0C2830", fontSize: "16px", fontFamily: "Space Grotesk", fontWeight: "600", marginBottom: "4px" }}>Account Role</div>
                      <div style={{ color: "#7AAAB4", fontSize: "15px", fontFamily: "Space Grotesk", textTransform: "capitalize" }}>{user?.role || "Patient"}</div>
                    </div>
                  </div>

                  <button 
                    onClick={handleLogout}
                    style={{ width: "100%", padding: "14px", background: "#FFE9E9", border: "1.5px solid #FFCECE", borderRadius: "100px", color: "#C0574C", fontSize: "16px", fontFamily: "Space Grotesk", fontWeight: "600", cursor: "pointer", transition: "background 0.2s" }} 
                    onMouseEnter={(e) => e.target.style.background = "#FFD6D6"} 
                    onMouseLeave={(e) => e.target.style.background = "#FFE9E9"}
                  >
                    Sign out of VISENSA
                  </button>
                </div>
              </div>

              <button 
                onClick={handleSaveChanges}
                disabled={!hasChanges}
                style={{ 
                  width: "100%", 
                  padding: "18px", 
                  background: hasChanges ? "#0099A6" : "#B2DCDF", 
                  border: "none", 
                  borderRadius: "16px", 
                  color: hasChanges ? "white" : "rgba(255, 255, 255, 0.75)", 
                  fontSize: "18px", 
                  fontFamily: "Space Grotesk", 
                  fontWeight: "600", 
                  cursor: hasChanges ? "pointer" : "not-allowed", 
                  boxShadow: hasChanges ? "0 6px 20px rgba(0, 153, 166, 0.25)" : "none", 
                  transition: "all 0.2s",
                  transform: "translateY(0px)"
                }}
                onMouseEnter={(e) => { if(hasChanges) e.target.style.transform = "translateY(-2px)"; }}
                onMouseLeave={(e) => { if(hasChanges) e.target.style.transform = "translateY(0)"; }}
              >
                Save changes
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default PatientDashboard;