import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import visensaLogo from "../../assets/visensa-logo.png";
import avatarHands from "../../assets/avatar-hands.png";
import PatientSidebar from "./PatientSidebar";
import InteractivePracticeHub from "../../features/gamification/interactive-practice/InteractivePracticeHub";
import InteractivePracticeDashboardCTA from "../../features/gamification/interactive-practice/InteractivePracticeDashboardCTA";

const API_BASE = 'http://localhost:3000/api/v1';

// ==========================================
// 1. DATA MOCK (DUMMY DATA)
// ==========================================
const topStats = [
  { label: "RECOVERY", val: "Week 4", sub: "of programme", color: "#0C2830" },
  { label: "SESSIONS", val: "21", sub: "total done", color: "#0C2830" },
  { label: "PAIN", val: "4 / 10", sub: "current level", color: "#0C2830" },
  { label: "STREAK", val: "4 weeks", sub: "consecutive", color: "#0C2830" },
];

const chartPoints = [
  { date: "Jun 17", x: 50, y: 50, pain: "8.5" },
  { date: "Jun 24", x: 260, y: 65, pain: "7.0" },
  { date: "Jul 1", x: 470, y: 80, pain: "6.5" },
  { date: "Jul 8", x: 680, y: 95, pain: "5.0" },
  { date: "Today", x: 900, y: 110, pain: "4.0" },
];

const currentWeek = [
  { day: "Mon", date: 6, status: "completed" },
  { day: "Tue", date: 7, status: "completed" },
  { day: "Wed", date: 8, status: "completed" },
  { day: "Thu", date: 9, status: "today" },
  { day: "Fri", date: 10, status: "upcoming" },
  { day: "Sat", date: 11, status: "rest" },
  { day: "Sun", date: 12, status: "rest" }
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
  { id: 1, icon: "🌟", title: "New milestone reached!", desc: "You achieved a 4-week streak. Keep up the great work!", time: "2h ago", unread: true, color: "#3ED8C8", bg: "rgba(62, 216, 200, 0.15)" },
  { id: 2, icon: "📅", title: "Session reminder", desc: "Dr. Sarah scheduled your next review for July 15.", time: "5h ago", unread: true, color: "#0099A6", bg: "rgba(0, 153, 166, 0.15)" },
];

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const calendarGrid = [
  { date: 29, isCurrentMonth: false, status: "rest", isTherapy: false },
  { date: 30, isCurrentMonth: false, status: "rest", isTherapy: false },
  ...Array.from({ length: 31 }, (_, i) => {
    const d = i + 1;
    let status = "rest", isTherapy = false;
    if ([1, 3, 6, 8].includes(d)) { status = "completed"; isTherapy = true; } 
    else if (d === 9) { status = "today"; isTherapy = true; } 
    else if ([11, 13, 15, 17, 20, 22, 24, 27, 29, 31].includes(d)) { status = "upcoming"; isTherapy = true; }
    return { date: d, isCurrentMonth: true, status, isTherapy };
  }),
  { date: 1, isCurrentMonth: false, status: "rest", isTherapy: false },
  { date: 2, isCurrentMonth: false, status: "rest", isTherapy: false },
];

const todayExercises = ["Finger extension — slow", "Wrist flexion / extension", "Pinch grip — coin", "Wrist deviation", "Finger tap sequence", "Static open hold", "Single finger lift", "Fist hold"];

// ==========================================
// KOMPONEN HELPER
// ==========================================
const BellIcon = ({ showNotif, setShowNotif }) => (
  <div style={{ position: "relative" }}>
    <div onClick={() => setShowNotif(!showNotif)} style={{ width: "42px", height: "42px", background: "white", borderRadius: "14px", boxShadow: "0px 2px 10px rgba(0,0,0,0.05)", display: "flex", justifyContent: "center", alignItems: "center", cursor: "pointer", flexShrink: 0, border: showNotif ? "1.5px solid #0099A6" : "1.5px solid transparent", transition: "all 0.2s" }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4A5568" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
      <div style={{ width: "8px", height: "8px", background: "#F97316", borderRadius: "50%", position: "absolute", top: "10px", right: "12px", border: "2px solid white" }} />
    </div>
    {showNotif && (
      <div style={{ position: "absolute", top: "50px", right: "0", width: "360px", background: "white", boxShadow: "0px 12px 40px rgba(12, 40, 48, 0.12)", borderRadius: "20px", border: "1.5px solid #C4E8EC", zIndex: 100, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1.5px solid #C4E8EC", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}><div style={{ color: "#0C2830", fontSize: "16px", fontWeight: "700" }}>Notifications</div><div style={{ background: "#F97316", color: "white", padding: "2px 8px", borderRadius: "20px", fontSize: "12px", fontFamily: "Space Mono", fontWeight: "700" }}>2</div></div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}><div style={{ color: "#0099A6", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>Mark all read</div><svg onClick={() => setShowNotif(false)} style={{ cursor: "pointer" }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7AAAB4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></div>
        </div>
        <div style={{ maxHeight: "350px", overflowY: "auto" }}>
          {patientNotifications.map((notif) => (
            <div key={notif.id} style={{ padding: "16px 20px", borderBottom: "1.5px solid #E2E8F0", background: notif.unread ? "rgba(12, 40, 48, 0.02)" : "white", display: "flex", gap: "14px" }}>
              <div style={{ width: "38px", height: "38px", minWidth: "38px", background: notif.bg, borderRadius: "10px", border: `1px solid ${notif.color}40`, display: "flex", justifyContent: "center", alignItems: "center", fontSize: "16px" }}>{notif.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                  <div style={{ color: "#0C2830", fontSize: "14px", fontWeight: notif.unread ? "700" : "600" }}>{notif.title}</div>
                  {notif.unread && <div style={{ width: "8px", height: "8px", background: "#F97316", borderRadius: "50%", marginTop: "4px" }} />}
                </div>
                <div style={{ color: "#7AAAB4", fontSize: "13px", marginBottom: "6px" }}>{notif.desc}</div>
                <div style={{ color: "#7AAAB4", fontSize: "11px", fontFamily: "Space Mono" }}>{notif.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

const FunctionalRightPanel = ({ navigate, selectedPlanData, selectedPlanDate }) => (
  <div className="right-panel hide-scroll" style={{ width: "360px", minWidth: "320px", height: "calc(100vh - 48px)", flex: "0 0 auto", display: "flex", flexDirection: "column", gap: "24px", overflowY: "auto", paddingBottom: "120px" }}>
    {selectedPlanData && selectedPlanData.isTherapy ? (
      <>
        <div style={{ background: "white", borderRadius: "20px", border: "1px solid #E2E8F0", padding: "24px", display: "flex", flexDirection: "column", gap: "20px", boxShadow: "0 4px 12px rgba(0,0,0,0.02)", marginTop: "10px" }}>
          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <div style={{ width: "56px", height: "56px", background: selectedPlanData.status === "today" ? "rgba(200, 112, 74, 0.1)" : selectedPlanData.status === "completed" ? "rgba(75, 168, 130, 0.1)" : "rgba(0, 153, 166, 0.1)", borderRadius: "16px", display: "flex", justifyContent: "center", alignItems: "center", color: selectedPlanData.status === "today" ? "#C8704A" : selectedPlanData.status === "completed" ? "#4BA882" : "#0099A6", flexShrink: 0 }}>
              {selectedPlanData.status === "today" ? <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> : selectedPlanData.status === "completed" ? <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> : <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>}
            </div>
            <div>
              <div style={{ color: selectedPlanData.status === "today" ? "#C8704A" : selectedPlanData.status === "completed" ? "#4BA882" : "#0099A6", fontSize: "12px", fontFamily: "Space Mono", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>
                {selectedPlanData.status === "today" ? "Action Required" : selectedPlanData.status === "completed" ? "Session Completed" : "Upcoming Schedule"}
              </div>
              <div style={{ color: "#0C2830", fontSize: "18px", fontWeight: "700" }}>July {selectedPlanData.date} Session</div>
            </div>
          </div>
          {selectedPlanData.status === "today" && <button onClick={() => navigate("/intro")} style={{ width: "100%", padding: "16px", background: "linear-gradient(135deg, #C2EB30 0%, #9AC404 100%)", color: "white", border: "none", borderRadius: "14px", fontSize: "16px", fontWeight: "700", cursor: "pointer", boxShadow: "0 4px 12px rgba(200, 112, 74, 0.25)", transition: "transform 0.2s" }}>Start Session Now</button>}
          {selectedPlanData.status === "completed" && <div style={{ color: "#7AAAB4", fontSize: "14px", lineHeight: "1.5" }}>Great job! You successfully completed all exercises for this session.</div>}
          {selectedPlanData.status === "upcoming" && <div style={{ color: "#7AAAB4", fontSize: "14px", lineHeight: "1.5" }}>This session is scheduled for later this week. Rest properly beforehand.</div>}
        </div>
        <div style={{ background: "white", borderRadius: "20px", border: "1px solid #E2E8F0", padding: "24px", display: "flex", flexDirection: "column", flex: 1, boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div style={{ color: "#0C2830", fontSize: "16px", fontWeight: "700" }}>Session Routine</div>
            <div style={{ color: "#7AAAB4", fontSize: "13px", fontFamily: "Space Mono" }}>8 items</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", paddingBottom: "20px" }}>
            {todayExercises.map((ex, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                {selectedPlanData.status === "completed" ? <div style={{ width: "20px", height: "20px", background: "#4BA882", borderRadius: "6px", flexShrink: 0, marginTop: "2px", display: "flex", justifyContent: "center", alignItems: "center", color: "white", fontSize: "12px" }}>✓</div> : <div style={{ width: "20px", height: "20px", border: "2px solid #C4E8EC", borderRadius: "6px", flexShrink: 0, marginTop: "2px" }} />}
                <div style={{ color: selectedPlanData.status === "completed" ? "#9AABB8" : "#3A6870", textDecoration: selectedPlanData.status === "completed" ? "line-through" : "none", fontSize: "15px", fontWeight: "500", lineHeight: "1.4" }}>{ex}</div>
              </div>
            ))}
          </div>
        </div>
      </>
    ) : (
      <div style={{ background: "transparent", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, marginTop: "40px", opacity: 0.6 }}>
        <div style={{ width: "64px", height: "64px", background: "white", borderRadius: "16px", border: "1px solid #E2E8F0", display: "flex", justifyContent: "center", alignItems: "center", color: "#9AABB8", marginBottom: "16px" }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.59-8.21l-3.32 3.32"></path></svg>
        </div>
        <div style={{ color: "#0C2830", fontSize: "18px", fontWeight: "700", marginBottom: "8px" }}>Rest Day</div>
        <div style={{ color: "#7AAAB4", fontSize: "14px", textAlign: "center", maxWidth: "240px" }}>No therapy session scheduled for July {selectedPlanDate}. Enjoy your rest!</div>
      </div>
    )}
  </div>
);

// ==========================================
// 2. KOMPONEN UTAMA
// ==========================================
const PatientDashboard = ({ initialTab = "Dashboard" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState(location.state?.activeMenu || initialTab);
  const [activeFilter, setActiveFilter] = useState("All sessions");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [showNotif, setShowNotif] = useState(false);
  const [hoveredPainPoint, setHoveredPainPoint] = useState(null);
  const [selectedPlanDate, setSelectedPlanDate] = useState(9);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isEditingEmail, setIsEditingEmail] = useState(false);

  // ── Dynamic session data ──
  const [sessionLogs, setSessionLogs] = useState([]);      
  const [schedule, setSchedule] = useState(null);          
  const [sessionLoading, setSessionLoading] = useState(true);

  // ── Helper: derive status label and color from pain_level ──
  const getStatusFromPain = (painLevel) => {
    if (painLevel === null || painLevel === undefined) return { status: 'Completed', statusColor: '#0099A6', statusBg: 'rgba(0, 153, 166, 0.10)' };
    if (painLevel <= 3) return { status: 'Excellent', statusColor: '#4BA882', statusBg: 'rgba(75, 168, 130, 0.10)' };
    if (painLevel <= 5) return { status: 'Good',      statusColor: '#3ED8C8', statusBg: 'rgba(62, 216, 200, 0.10)' };
    if (painLevel <= 7) return { status: 'Fair',      statusColor: '#D4A843', statusBg: 'rgba(212, 168, 67, 0.10)' };
    return               { status: 'Poor',      statusColor: '#C0574C', statusBg: 'rgba(192, 87, 76, 0.10)' };
  };

  // ── Helper: format a raw exercise_log record into the UI shape ──
  const formatLog = (log, index, allLogs) => {
    const d = new Date(log.created_at);
    const day   = d.getDate().toString();
    const month = d.toLocaleString('default', { month: 'short' });
    const today = new Date();
    const isToday = d.toDateString() === today.toDateString();
    const isYesterday = new Date(today - 86400000).toDateString() === d.toDateString();
    const dayName = d.toLocaleString('default', { weekday: 'short' });
    const year = d.getFullYear();
    const title = isToday
      ? `Today, ${day} ${month} ${year}`
      : isYesterday
      ? `Yesterday, ${day} ${month} ${year}`
      : `${dayName}, ${day} ${month} ${year}`;

    const durationMin = log.duration_seconds ? Math.round(log.duration_seconds / 60) : 0;
    const newPain = log.pain_level ?? null;
    const prevSession = allLogs[index + 1];
    const oldPain = prevSession?.pain_level ?? newPain;

    const { status, statusColor, statusBg } = getStatusFromPain(newPain);

    let painDiff = "no change";
    let diffColor = "#7AAAB4";
    
    if (oldPain !== null && newPain !== null) {
      const diff = newPain - oldPain;
      if (diff > 0) {
        painDiff = `↑${diff} pts`;
        diffColor = "#C0574C";
      } else if (diff < 0) {
        painDiff = `↓${Math.abs(diff)} pts`;
        diffColor = "#4BA882";
      }
    }

    return {
      id:          log.id,
      day,
      month,
      title,
      isToday,
      status,
      statusColor,
      statusBg,
      exercises:   log.session_number ? `Session #${log.session_number}` : 'Session',
      time:        `${durationMin} min`,
      accuracy:    '97% accuracy',
      oldPain:     oldPain ?? '—',
      newPain:     newPain ?? '—',
      painDiff,
      diffColor,
      boxBg:       isToday ? 'rgba(0, 153, 166, 0.08)' : '#F0FAFB',
      date:        `${day} ${month}`,
      desc:        `${durationMin} min session`,
    };
  };

  // ── Fetch exercise logs & schedule from backend ──
  const selectedPlanData = calendarGrid.find(day => day.date === selectedPlanDate && day.isCurrentMonth);

  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const headers = { Authorization: `Bearer ${token}` };

        const logsRes = await fetch(`${API_BASE}/sessions/exercise/me`, { headers });
        if (logsRes.ok) {
          const logsJson = await logsRes.json();
          const data = logsJson.data ?? [];
          setSessionLogs(data.map(formatLog));
        }

        const scheduleRes = await fetch(`${API_BASE}/sessions/stats/me`, { headers });
        if (scheduleRes.ok) {
          const scheduleJson = await scheduleRes.json();
          setSchedule(scheduleJson.data ?? null);
        }
      } catch (e) {
        console.error('Failed to fetch session data:', e);
      } finally {
        setSessionLoading(false);
      }
    };
    fetchSessionData();
  }, []);

  const mainContentRef = useRef(null);
  const [user, setUser] = useState(() => {
    try {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : {};
    } catch (e) {
      return {};
    }
  });

  const [fullName, setFullName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  
  // Logika pengecekan perubahan yang 100% aman
  const hasChanges = Boolean((user && fullName !== user?.name) || (user && email !== user?.email) || password !== "");

  const handleSaveChanges = () => {
    if (!hasChanges) return;
    alert("Changes saved successfully!");
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate("/");
  };
  
  // Derive recent (last 3) and all sessions from dynamic state
  const recentSessionsDynamic  = sessionLogs.slice(0, 3);
  const filteredSessionsDynamic = activeFilter === 'All sessions'
    ? sessionLogs
    : sessionLogs.filter(s => s.status === activeFilter);

  // ── Derived dynamic stats for Dashboard cards ──
  const currentPainRaw = sessionLogs.length > 0 ? sessionLogs[0].newPain : null;
  const currentPain = currentPainRaw !== null && currentPainRaw !== '—' ? currentPainRaw : 0;
  
  const startPainRaw = sessionLogs.length > 0 ? sessionLogs[sessionLogs.length - 1].newPain : null;
  const startPain = startPainRaw !== null && startPainRaw !== '—' ? startPainRaw : currentPain;
  
  const painImprovement = startPain - currentPain;
  
  const totalSessionsDone = sessionLogs.length;
  
  const currentMonthStr = new Date().toLocaleString('default', { month: 'short' });
  const sessionsThisMonth = sessionLogs.filter(s => s.month === currentMonthStr).length;

  const dynamicTopStats = [
    { label: "RECOVERY", val: "Week 4", sub: "of programme", color: "#0C2830" },
    { label: "SESSIONS", val: totalSessionsDone.toString(), sub: "total done", color: "#0C2830" },
    { label: "PAIN", val: sessionLogs.length > 0 ? `${currentPain} / 10` : '—', sub: "current level", color: "#0C2830" },
    { label: "STREAK", val: "4 wks", sub: "consecutive", color: "#0C2830" },
  ];

  const chartPointsBase = sessionLogs.slice(0, 5).reverse();
  const dynamicChartPoints = chartPointsBase.map((log, index) => {
    const step = chartPointsBase.length > 1 ? 850 / (chartPointsBase.length - 1) : 0;
    const x = chartPointsBase.length === 1 ? 475 : 50 + index * step;
    const painVal = log.newPain !== '—' ? log.newPain : 0;
    const y = 160 - ((painVal / 10) * 110);
    return { date: log.date, x, y, pain: painVal.toString() };
  });

  const polylinePoints = dynamicChartPoints.map(pt => `${pt.x},${pt.y}`).join(" ");
  const polygonPoints = dynamicChartPoints.length > 0 
    ? `50,160 ${polylinePoints} ${dynamicChartPoints[dynamicChartPoints.length - 1].x},160`
    : "50,160 50,160";
  
  const painTrendPercentage = startPain > 0 ? Math.round((painImprovement / startPain) * 100) : 0;
  const painTrendString = painImprovement > 0 ? `↘ −${painTrendPercentage}%` : painImprovement < 0 ? `↗ +${Math.abs(painTrendPercentage)}%` : `0%`;
  const painTrendColor = painImprovement > 0 ? "#4BA882" : painImprovement < 0 ? "#C0574C" : "#7AAAB4";
  const painTrendBg = painImprovement > 0 ? "rgba(75, 168, 130, 0.1)" : painImprovement < 0 ? "rgba(192, 87, 76, 0.1)" : "rgba(122, 170, 180, 0.1)";

  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.margin = "0";
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <>
      <style>
        {`
          .hide-scroll::-webkit-scrollbar { display: none; }
          .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
          .main-content { flex-direction: row; }
          @media (max-width: 1200px) {
            .main-content { flex-direction: column; }
            .right-panel { width: 100% !important; min-width: 100% !important; max-width: 100% !important; }
          }
          @keyframes floatMedium { 0% { transform: translateY(0px); } 50% { transform: translateY(-8px); } 100% { transform: translateY(0px); } }
          .animate-float-img { animation: floatMedium 6s ease-in-out infinite; }
          @keyframes floatCard1 { 0% { transform: translate(0px, 0px); } 50% { transform: translate(-4px, -10px); } 100% { transform: translate(0px, 0px); } }
          @keyframes floatCard2 { 0% { transform: translate(0px, 0px); } 50% { transform: translate(4px, 8px); } 100% { transform: translate(0px, 0px); } }
          @keyframes floatCard3 { 0% { transform: translate(0px, 0px); } 50% { transform: translate(-3px, 9px); } 100% { transform: translate(0px, 0px); } }
          .animate-float-1 { animation: floatCard1 5s ease-in-out infinite; }
          .animate-float-2 { animation: floatCard2 6s ease-in-out infinite; animation-delay: 0.3s; }
          .animate-float-3 { animation: floatCard3 5.5s ease-in-out infinite; animation-delay: 0.6s; }
        `}
      </style>

      <div style={{ width: "100vw", height: "100vh", display: "flex", background: "#F4F7F9", fontFamily: "Space Grotesk, sans-serif", padding: "24px", boxSizing: "border-box", gap: "24px", position: "relative" }}>
        
        {/* ============================== */}
        {/* 1. SIDEBAR (DIAM/FIXED)        */}
        {/* ============================== */}
        <PatientSidebar
        activeMenu={activeMenu}
        onSelectMenu={(menu) => {
          setActiveMenu(menu);
          setSelectedSession(null); 
          setOpenDropdown(null);
          setIsEditingEmail(false);
        }}
      />

        {/* ============================== */}
        {/* 2. AREA TENGAH DINAMIS         */}
        {/* ============================== */}
        
        {/* --- DASHBOARD ACTIVE --- */}
        {activeMenu === "Dashboard" && (
          <div className="main-content" style={{ display: "flex", flex: 1, gap: "24px", height: "calc(100vh - 48px)" }}>
            
            <div className="hide-scroll" style={{ flex: 1, display: "flex", flexDirection: "column", gap: "20px", overflowY: "auto", paddingRight: "10px", paddingBottom: "100px", minWidth: 0 }} onWheel={(e) => { if (mainContentRef.current) mainContentRef.current.scrollTop += e.deltaY; }} ref={mainContentRef}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
                <div>
                  <div style={{ color: "#1A2332", fontSize: "32px", fontFamily: "Space Grotesk", fontWeight: "700", marginBottom: "2px" }}>
                    Good morning, {fullName}
                  </div>
                  <div style={{ color: "#9AABB8", fontSize: "14px", fontFamily: "Space Grotesk", fontWeight: "500" }}>
                    Ready for your next therapy session?
                  </div>
                </div>
                <BellIcon showNotif={showNotif} setShowNotif={setShowNotif} />
              </div>

              {/* INTERAKTIF PRACTICE SECONDARY CTA BANNER */}
              <InteractivePracticeDashboardCTA onNavigate={() => setActiveMenu("Interactive Practice")} />

              <div style={{ display: "flex", background: "white", padding: "24px", borderRadius: "20px", border: "1.5px solid #C4E8EC", boxShadow: "0 2px 10px rgba(0,0,0,0.02)", flexShrink: 0 }}>
                {dynamicTopStats.map((stat, i) => (
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
                    <span style={{ fontSize: "42px", fontFamily: "Space Mono", fontWeight: "700" }}>{currentPain}</span>
                    <span style={{ fontSize: "18px", fontFamily: "Space Mono", opacity: 0.8 }}>/10</span>
                  </div>
                  <div style={{ fontSize: "14px", opacity: 0.8, marginBottom: "auto" }}>
                    {painImprovement > 0 ? `↓ from ${startPain} at start` : painImprovement < 0 ? `↑ from ${startPain} at start` : `Same as start (${startPain})`}
                  </div>
                  <div style={{ display: "flex", gap: "6px", height: "45px", alignItems: "flex-end", marginTop: "20px" }}>
                    {[0.4, 0.5, 0.6, 0.7, 0.8, 1].map((o, i) => <div key={i} style={{ flex: 1, background: "rgba(255,255,255,0.25)", height: `${40 + i*12}%`, borderRadius: "4px", opacity: o }} />)}
                  </div>
                </div>
                <div style={{ flex: 1, background: "linear-gradient(135deg, #3ED8C8 0%, #28C0AE 100%)", borderRadius: "24px", padding: "24px", color: "white", display: "flex", flexDirection: "column" }}>
                  <div style={{ fontSize: "14.5px", opacity: 0.8, marginBottom: "12px" }}>Sessions this month</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "4px" }}>
                    <span style={{ fontSize: "42px", fontFamily: "Space Mono", fontWeight: "700" }}>{sessionsThisMonth}</span>
                    <span style={{ fontSize: "18px", fontFamily: "Space Mono", opacity: 0.8 }}>sessions</span>
                  </div>
                  <div style={{ fontSize: "14px", opacity: 0.8, marginBottom: "auto" }}>Goal: 8/month</div>
                  <div style={{ display: "flex", gap: "6px", height: "45px", alignItems: "flex-end", marginTop: "20px" }}>
                    {[0.5, 0.6, 0.7, 0.8, 0.9, 1].map((o, i) => <div key={i} style={{ flex: 1, background: "rgba(255,255,255,0.25)", height: `${50 + i*10}%`, borderRadius: "4px", opacity: o }} />)}
                  </div>
                </div>
              </div>

              <div style={{ background: "white", padding: "20px 24px", borderRadius: "18px", border: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0, boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                 {currentWeek.map((d, i) => (
                   <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <div style={{ color: '#7AAAB4', fontSize: '13px', fontWeight: '600', fontFamily: "Space Mono" }}>{d.day}</div>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: d.status === 'today' ? '#0099A6' : d.status === 'completed' ? '#E6F4F1' : 'transparent', color: d.status === 'today' ? 'white' : d.status === 'completed' ? '#4BA882' : '#1A2332', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: '700', border: d.status === 'upcoming' ? '1.5px dashed #C4E8EC' : 'none', fontFamily: "Space Grotesk" }}>{d.date}</div>
                   </div>
                 ))}
              </div>

              <div style={{ background: "white", borderRadius: "20px", border: "1.5px solid #C4E8EC", padding: "28px", boxShadow: "0 2px 10px rgba(0,0,0,0.02)", flexShrink: 0, position: "relative" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                  <div>
                    <div style={{ color: "#0C2830", fontSize: "17px", fontWeight: "700", marginBottom: "4px" }}>Pain trend</div>
                    <div style={{ color: "#7AAAB4", fontSize: "15px" }}>Overall progress</div>
                  </div>
                  <div style={{ background: painTrendBg, border: `1.5px solid ${painTrendColor}33`, color: painTrendColor, padding: "6px 14px", borderRadius: "20px", fontSize: "15px", fontWeight: "600", display: "flex", alignItems: "center" }}>{painTrendString}</div>
                </div>
                
                <div style={{ position: "relative", height: "160px", width: "100%", borderBottom: "1.5px solid #E2E8F0", marginBottom: "15px" }}>
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
                    <polygon points={polygonPoints} fill="url(#painGradient)" />
                    <line x1="50" y1="40" x2="900" y2="40" stroke="#F1F5F9" strokeWidth="1.5" strokeDasharray="4 4" />
                    <line x1="50" y1="90" x2="900" y2="90" stroke="#F1F5F9" strokeWidth="1.5" strokeDasharray="4 4" />
                    
                    {hoveredPainPoint && (
                      <line x1={hoveredPainPoint.x} y1="0" x2={hoveredPainPoint.x} y2="160" stroke="#C4E8EC" strokeWidth="2" />
                    )}

                    {dynamicChartPoints.length > 1 ? (
                      <polyline points={polylinePoints} fill="none" stroke="#0099A6" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
                    ) : dynamicChartPoints.length === 1 ? (
                      <circle cx={dynamicChartPoints[0].x} cy={dynamicChartPoints[0].y} r="5" fill="#0099A6" />
                    ) : null}
                    
                    {dynamicChartPoints.map((pt, i) => (
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
                  {dynamicChartPoints.map((pt, i) => <span key={i} style={{ flex: 1, textAlign: i === 0 ? "left" : i === dynamicChartPoints.length - 1 ? "right" : "center" }}>{pt.date}</span>)}
                </div>
              </div>

              <div style={{ background: "white", borderRadius: "18px", border: "1px solid #E2E8F0", overflow: "hidden", flexShrink: 0 }}>
                <div style={{ padding: "24px", borderBottom: "1.5px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ color: "#0C2830", fontSize: "17px", fontWeight: "700" }}>Recent sessions</div>
                  <div style={{ color: "#7AAAB4", fontSize: "14px", fontFamily: "Space Mono" }}>last {recentSessionsDynamic.length > 0 ? recentSessionsDynamic.length : '—'}</div>
                </div>
                <div>
                  {sessionLoading ? (
                    <div style={{ padding: "24px", color: "#7AAAB4", fontSize: "14px", fontFamily: "Space Mono", textAlign: "center" }}>Loading sessions...</div>
                  ) : recentSessionsDynamic.length === 0 ? (
                    <div style={{ padding: "24px", color: "#7AAAB4", fontSize: "14px", fontFamily: "Space Mono", textAlign: "center" }}>No sessions recorded yet.</div>
                  ) : null}
                  {recentSessionsDynamic.map((session, i) => (
                    <div key={i} style={{ padding: "20px 24px", borderBottom: "1px solid #E2E8F0", display: "flex", alignItems: "center", background: session.isToday ? "rgba(200, 112, 74, 0.02)" : "white" }}>
                      <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: session.isToday ? "#0099A6" : "#E2E8F0", marginRight: "16px" }} />
                      <div style={{ flex: 1 }}><div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}><span style={{ color: "#0C2830", fontSize: "15px", fontWeight: "600" }}>{session.date}</span><span style={{ background: session.statusBg, border: `1px solid ${session.statusColor}30`, color: session.statusColor, padding: "2px 10px", borderRadius: "14px", fontSize: "12px", fontFamily: "Space Mono", fontWeight: "700" }}>{session.status}</span>{session.isToday && <span style={{ color: "#0099A6", fontSize: "12px", fontFamily: "Space Mono" }}>today</span>}</div><div style={{ color: "#7AAAB4", fontSize: "13px", fontFamily: "Space Mono" }}>{session.desc}</div></div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", fontFamily: "Space Mono", fontWeight: "700" }}><span style={{ color: "#D4A843", fontSize: "15px" }}>{session.oldPain}</span><span style={{ color: "#7AAAB4", fontSize: "12px", fontWeight: "400" }}>→</span><span style={{ color: "#D4A843", fontSize: "15px" }}>{session.newPain}</span></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="right-panel hide-scroll" style={{ width: "380px", minWidth: "360px", height: "calc(100vh - 48px)", flex: "0 0 auto", background: "linear-gradient(160deg, #EBF5F7 0%, #F0F4F8 40%, #EEF5ED 100%)", borderRadius: "20px", border: "1.5px solid #C4CFEC", padding: "24px", display: "flex", flexDirection: "column", position: "relative", overflowY: "auto", boxSizing: "border-box" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                <button onClick={() => navigate('/intro')} style={{ width: "100%", padding: "16px", background: "linear-gradient(135deg, #C2EB30 0%, #9AC404 100%)", border: "none", borderRadius: "16px", color: "white", fontSize: "16px", fontFamily: "Space Grotesk", fontWeight: "700", cursor: "pointer", boxShadow: "0 6px 20px rgba(154, 196, 4, 0.3)", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg> Start today's session
                </button>
                <div style={{ color: "#7AAAB4", fontSize: "13px", fontFamily: "Space Mono" }}>8 exercises · ~12 min · Left hand</div>
              </div>

              <div style={{ flex: 1, position: "relative", minHeight: "300px", display: "flex", justifyContent: "center", alignItems: "center", marginTop: "20px", marginBottom: "20px" }}>
                 <div style={{ width: "240px", height: "240px", background: "radial-gradient(circle, rgba(59,184,176,0.15) 0%, rgba(255,255,255,0) 70%)", position: "absolute", zIndex: 1 }} />
                 <img className="animate-float-img" src={avatarHands} alt="Hands" style={{ width: "180px", position: "absolute", zIndex: 2, filter: "invert(52%) sepia(87%) saturate(1832%) hue-rotate(141deg) brightness(95%) contrast(101%)", opacity: 0.6 }} />
                 
                 <div className="animate-float-1" style={{ position: "absolute", top: "0%", right: "5%", background: "white", padding: "16px", borderRadius: "18px", boxShadow: "0 8px 24px rgba(59,184,176,0.15)", border: "1.5px solid rgba(59,184,176,0.2)", zIndex: 3 }}>
                    <div style={{ color: "#7AAAB4", fontSize: "11px", fontFamily: "Space Mono", marginBottom: "8px", letterSpacing: "1px" }}>JOINT ACCURACY</div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "2px", marginBottom: "6px" }}>
                       <span style={{ color: "#3ED8C8", fontSize: "30px", fontFamily: "Space Mono", fontWeight: "700" }}>97</span><span style={{ color: "#7AAAB4", fontSize: "14px", fontFamily: "Space Mono" }}>%</span>
                    </div>
                    <div style={{ display: "flex", gap: "4px" }}>{[0.5, 0.6, 0.7, 0.8, 1].map((o, i) => <div key={i} style={{ width: "14px", height: "8px", background: "#3ED8C8", borderRadius: "2px", opacity: o }} />)}</div>
                 </div>
                 
                 <div className="animate-float-2" style={{ position: "absolute", top: "40%", left: "0%", background: "white", padding: "16px", borderRadius: "18px", boxShadow: "0 8px 24px rgba(200,112,74,0.12)", border: "1.5px solid rgba(200,112,74,0.2)", zIndex: 3 }}>
                    <div style={{ color: "#7AAAB4", fontSize: "11px", fontFamily: "Space Mono", marginBottom: "8px", letterSpacing: "1px" }}>PAIN LEVEL</div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "2px", marginBottom: "4px" }}><span style={{ color: "#0099A6", fontSize: "30px", fontFamily: "Space Mono", fontWeight: "700" }}>4</span><span style={{ color: "#7AAAB4", fontSize: "14px", fontFamily: "Space Mono" }}>/10</span></div>
                    <div style={{ color: "#4BA882", fontSize: "13px", fontWeight: "600" }}>↓ from 8.5</div>
                 </div>
                 
                 <div className="animate-float-3" style={{ position: "absolute", bottom: "10%", right: "5%", background: "white", padding: "16px", borderRadius: "18px", boxShadow: "0 8px 24px rgba(75,168,130,0.1)", border: "1.5px solid rgba(75,168,130,0.2)", zIndex: 3 }}>
                    <div style={{ color: "#7AAAB4", fontSize: "11px", fontFamily: "Space Mono", marginBottom: "8px", letterSpacing: "1px" }}>RECOVERY</div>
                    <div style={{ color: "#4BA882", fontSize: "24px", fontFamily: "Space Mono", fontWeight: "700", marginBottom: "4px" }}>Week 4</div>
                    <div style={{ color: "#7AAAB4", fontSize: "13px" }}>21 sessions done</div>
                 </div>
              </div>

              <div style={{ marginTop: "auto", background: "white", padding: "20px", borderRadius: "18px", border: "1.5px solid #C4E8EC", boxShadow: "0 4px 12px rgba(0,0,0,0.04)" }}>
                <div style={{ color: "#7AAAB4", fontSize: "12px", fontFamily: "Space Mono", letterSpacing: "1px", marginBottom: "8px", textTransform: "uppercase" }}>NEXT REVIEW</div>
                <div style={{ color: "#0C2830", fontSize: "16px", fontWeight: "700", marginBottom: "4px" }}>July 15, 2026</div>
                <div style={{ color: "#7AAAB4", fontSize: "13px" }}>Dr. Sarah K. — Occupational Therapy</div>
              </div>
            </div>
          </div>
        )}

        {/* --- SESSIONS ACTIVE --- */}
        {activeMenu === "Sessions" && (
          <div className="main-content" style={{ display: "flex", flex: 1, gap: "24px", height: "calc(100vh - 48px)" }}>
            <div className="hide-scroll" style={{ flex: 1, display: "flex", flexDirection: "column", gap: "20px", overflowY: "auto", paddingRight: "10px", paddingBottom: "100px", minWidth: 0 }} onWheel={(e) => { if (mainContentRef.current) mainContentRef.current.scrollTop += e.deltaY; }} ref={mainContentRef}>
              {!selectedSession ? (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
                    <div><div style={{ color: "#1A2332", fontSize: "32px", fontFamily: "Space Grotesk", fontWeight: "700", marginBottom: "2px" }}>All sessions</div><div style={{ color: "#9AABB8", fontSize: "14px", fontFamily: "Space Grotesk", fontWeight: "500" }}>Tap any row to view detailed analysis.</div></div>
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
                    <div style={{ color: "#7AAAB4", fontSize: "16px", fontFamily: "Space Mono" }}>{filteredSessionsDynamic.length} sessions</div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {sessionLoading ? (
                      <div style={{ padding: "40px", color: "#7AAAB4", fontSize: "15px", fontFamily: "Space Mono", textAlign: "center" }}>Loading sessions...</div>
                    ) : filteredSessionsDynamic.length === 0 ? (
                      <div style={{ padding: "40px", color: "#7AAAB4", fontSize: "15px", fontFamily: "Space Mono", textAlign: "center" }}>No sessions recorded yet. Complete a therapy session to see your history here.</div>
                    ) : null}
                    {filteredSessionsDynamic.map((session) => (
                      <div key={session.id} onClick={() => { setSelectedSession(session); }} style={{ background: "white", borderRadius: "24px", border: "1.5px solid #C4E8EC", padding: "28px 32px", display: "flex", alignItems: "center", gap: "28px", boxShadow: "0px 2px 10px rgba(28, 24, 22, 0.04)", cursor: "pointer", transition: "transform 0.2s", flexShrink: 0 }}>
                        <div style={{ width: "68px", height: "68px", background: session.boxBg, borderRadius: "16px", border: "1px solid #E2E8F0", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", flexShrink: 0 }}><div style={{ color: "#0099A6", fontSize: "22px", fontFamily: "Space Mono", fontWeight: "700", lineHeight: "1" }}>{session.day}</div><div style={{ color: "#7AAAB4", fontSize: "13px", fontFamily: "Space Mono", marginTop: "4px" }}>{session.month}</div></div>
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}><div style={{ color: "#0C2830", fontSize: "20px", fontFamily: "Space Grotesk", fontWeight: "600" }}>{session.title}</div><div style={{ background: session.statusBg, border: `1.5px solid ${session.statusColor}33`, color: session.statusColor, padding: "4px 12px", borderRadius: "100px", fontSize: "13px", fontFamily: "Space Mono", fontWeight: "700" }}>{session.status}</div>{session.isToday && <div style={{ color: "#0099A6", fontSize: "13px", fontFamily: "Space Mono" }}>today</div>}</div>
                          <div style={{ display: "flex", gap: "20px", color: "#7AAAB4", fontSize: "14px", fontFamily: "Space Mono" }}><span>{session.exercises}</span><span>{session.time}</span><span>{session.accuracy}</span></div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}><div style={{ display: "flex", alignItems: "center", gap: "8px", fontFamily: "Space Mono", fontWeight: "700" }}><span style={{ color: "#D4A843", fontSize: "20px" }}>{session.oldPain}</span><span style={{ color: "#7AAAB4", fontSize: "14px", fontWeight: "400" }}>→</span><span style={{ color: "#D4A843", fontSize: "20px" }}>{session.newPain}</span></div><div style={{ color: session.diffColor, fontSize: "14px", fontFamily: "Space Mono" }}>{session.painDiff}</div></div>
                        <div style={{ marginLeft: "14px" }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7AAAB4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg></div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
                    <div onClick={() => setSelectedSession(null)} style={{ color: "#0099A6", fontSize: "15px", fontFamily: "Space Grotesk", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>Back to all sessions</div>
                    <BellIcon showNotif={showNotif} setShowNotif={setShowNotif} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexShrink: 0, flexWrap: "wrap", gap: "16px" }}>
                    <div>
                      <div style={{ color: "#0C2830", fontSize: "32px", fontFamily: "Space Grotesk", fontWeight: "800", marginBottom: "8px" }}>{selectedSession.title}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", fontFamily: "Space Mono" }}><span style={{ background: selectedSession.statusBg, color: selectedSession.statusColor, padding: "4px 12px", borderRadius: "100px", fontSize: "13px", fontWeight: "700" }}>{selectedSession.status}</span><span style={{ color: "#7AAAB4", fontSize: "14px" }}>{selectedSession.time} · {selectedSession.exercises}</span></div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "14px", flexShrink: 0, flexWrap: "wrap" }}>
                    <div style={{ flex: "1 1 200px", background: "white", padding: "20px", borderRadius: "18px", border: "1px solid #E2E8F0", boxShadow: "0 2px 8px rgba(0,0,0,0.03)", textAlign: "center" }}><div style={{ color: "#7AAAB4", fontSize: "12px", fontFamily: "Space Mono", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>Pain before</div><div><span style={{ color: "#D4A843", fontSize: "32px", fontFamily: "Space Mono", fontWeight: "700" }}>{selectedSession.oldPain}</span><span style={{ color: "#7AAAB4", fontSize: "14px", fontFamily: "Space Mono" }}>/10</span></div></div>
                    <div style={{ flex: "1 1 200px", background: "white", padding: "20px", borderRadius: "18px", border: "1px solid #E2E8F0", boxShadow: "0 2px 8px rgba(0,0,0,0.03)", textAlign: "center" }}><div style={{ color: "#7AAAB4", fontSize: "12px", fontFamily: "Space Mono", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>Pain after</div><div><span style={{ color: "#D4A843", fontSize: "32px", fontFamily: "Space Mono", fontWeight: "700" }}>{selectedSession.newPain}</span><span style={{ color: "#7AAAB4", fontSize: "14px", fontFamily: "Space Mono" }}>/10</span></div></div>
                    <div style={{ flex: "1 1 200px", background: "white", padding: "20px", borderRadius: "18px", border: "1px solid #E2E8F0", boxShadow: "0 2px 8px rgba(0,0,0,0.03)", textAlign: "center" }}><div style={{ color: "#7AAAB4", fontSize: "12px", fontFamily: "Space Mono", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>Change</div><div><span style={{ color: "#4BA882", fontSize: "32px", fontFamily: "Space Mono", fontWeight: "700" }}>{selectedSession.painDiff.replace('pts', '').replace('no change', '0')}</span><span style={{ color: "#7AAAB4", fontSize: "14px", fontFamily: "Space Mono", marginLeft: "4px" }}>pts</span></div></div>
                    <div style={{ flex: "1 1 200px", background: "white", padding: "20px", borderRadius: "18px", border: "1px solid #E2E8F0", boxShadow: "0 2px 8px rgba(0,0,0,0.03)", textAlign: "center" }}><div style={{ color: "#7AAAB4", fontSize: "12px", fontFamily: "Space Mono", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>Accuracy</div><div><span style={{ color: "#3ED8C8", fontSize: "32px", fontFamily: "Space Mono", fontWeight: "700" }}>{selectedSession.accuracy.replace('% accuracy', '')}</span><span style={{ color: "#7AAAB4", fontSize: "14px", fontFamily: "Space Mono" }}>%</span></div></div>
                  </div>
                  <div style={{ background: "white", padding: "26px 30px", borderRadius: "20px", border: "1px solid #E2E8F0", boxShadow: "0 2px 10px rgba(0,0,0,0.03)", flexShrink: 0, position: "relative" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", flexWrap: "wrap", gap: "16px" }}>
                      <div><div style={{ color: "#0C2830", fontSize: "17px", fontFamily: "Space Grotesk", fontWeight: "700", marginBottom: "4px" }}>Movement range per exercise</div><div style={{ color: "#7AAAB4", fontSize: "14px", fontFamily: "Space Grotesk" }}>{activeBarIndex !== null ? `${movementChart[activeBarIndex].fullName}: ${movementChart[activeBarIndex].val}%` : "Hover grafik batang untuk melihat detail persentase"}</div></div>
                      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <div style={{ display: "flex", gap: "12px" }}><div style={{ display: "flex", alignItems: "center", gap: "6px" }}><div style={{ width: "8px", height: "8px", background: "#4BA882", borderRadius: "50%" }} /><span style={{ color: "#7AAAB4", fontSize: "13px", fontFamily: "Space Mono" }}>Excellent</span></div><div style={{ display: "flex", alignItems: "center", gap: "6px" }}><div style={{ width: "8px", height: "8px", background: "#3ED8C8", borderRadius: "50%" }} /><span style={{ color: "#7AAAB4", fontSize: "13px", fontFamily: "Space Mono" }}>Good</span></div></div>
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", height: "160px", padding: "0 20px", borderBottom: "1.5px solid transparent", position: "relative", marginTop: "16px" }}>
                      {movementChart.map((bar, i) => {
                        const isSelected = activeBarIndex === i;
                        return (
                          <div key={i} onMouseEnter={() => setActiveBarIndex(i)} onMouseLeave={() => setActiveBarIndex(null)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", width: "42px", cursor: "pointer", height: "100%", justifyContent: "flex-end" }}>
                            <div style={{ position: "relative", width: "100%", height: `${bar.val}%`, display: "flex", justifyContent: "center" }}>
                               <span style={{ position: "absolute", top: "-22px", fontSize: "11px", fontFamily: "Space Mono", fontWeight: "700", color: bar.color, opacity: isSelected ? 1 : 0, transition: "opacity 0.2s", whiteSpace: "nowrap" }}>{bar.val}%</span>
                               <div style={{ width: "100%", height: "100%", background: bar.color, borderRadius: "6px 6px 0 0", opacity: isSelected ? 1 : 0.85, transform: isSelected ? "scaleY(1.02)" : "scaleY(1)", transformOrigin: "bottom", transition: "all 0.2s ease" }} />
                            </div>
                            <div style={{ color: isSelected ? "#0C2830" : "#7AAAB4", fontSize: "12px", fontFamily: "Space Mono", fontWeight: isSelected ? "700" : "400", transition: "all 0.2s" }}>{bar.label}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* --- MY PLAN ACTIVE --- */}
        {activeMenu === "My Plan" && (
          <div className="main-content" style={{ display: "flex", flex: 1, gap: "24px", height: "calc(100vh - 48px)" }}>
            
            <div className="hide-scroll" style={{ flex: "1 1 550px", display: "flex", flexDirection: "column", gap: "24px", overflowY: "auto", paddingRight: "10px", paddingBottom: "100px", minWidth: 0 }} onWheel={(e) => { if (mainContentRef.current) mainContentRef.current.scrollTop += e.deltaY; }} ref={mainContentRef}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexShrink: 0 }}>
                <div>
                  <div style={{ color: "#1A2332", fontSize: "32px", fontFamily: "Space Grotesk", fontWeight: "700", marginBottom: "6px" }}>My Therapy Plan</div>
                  <div style={{ color: "#7AAAB4", fontSize: "15px", fontFamily: "Space Grotesk", fontWeight: "500" }}>Your current program schedule and progress tracking.</div>
                </div>
                <BellIcon showNotif={showNotif} setShowNotif={setShowNotif} />
              </div>

              <div style={{ display: "flex", gap: "16px", flexShrink: 0, flexWrap: "wrap" }}>
                <div style={{ flex: "1 1 150px", background: "white", padding: "20px", borderRadius: "16px", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: "16px", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                  <div style={{ width: "48px", height: "48px", background: "rgba(0, 153, 166, 0.1)", borderRadius: "12px", display: "flex", justifyContent: "center", alignItems: "center", color: "#0099A6" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2v6h-6"></path><path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path><path d="M3 22v-6h6"></path><path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path></svg>
                  </div>
                  <div>
                    <div style={{ color: "#7AAAB4", fontSize: "12px", fontFamily: "Space Mono", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Frequency</div>
                    <div style={{ color: "#0C2830", fontSize: "18px", fontFamily: "Space Grotesk", fontWeight: "700" }}>3x a week</div>
                  </div>
                </div>
                <div style={{ flex: "1 1 150px", background: "white", padding: "20px", borderRadius: "16px", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: "16px", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                  <div style={{ width: "48px", height: "48px", background: "rgba(0, 153, 166, 0.1)", borderRadius: "12px", display: "flex", justifyContent: "center", alignItems: "center", color: "#0099A6" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  </div>
                  <div>
                    <div style={{ color: "#7AAAB4", fontSize: "12px", fontFamily: "Space Mono", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Interval</div>
                    <div style={{ color: "#0C2830", fontSize: "18px", fontFamily: "Space Grotesk", fontWeight: "700" }}>1 day rest</div>
                  </div>
                </div>
                <div style={{ flex: "1 1 150px", background: "white", padding: "20px", borderRadius: "16px", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: "16px", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                  <div style={{ width: "48px", height: "48px", background: "rgba(0, 153, 166, 0.1)", borderRadius: "12px", display: "flex", justifyContent: "center", alignItems: "center", color: "#0099A6" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
                  </div>
                  <div>
                    <div style={{ color: "#7AAAB4", fontSize: "12px", fontFamily: "Space Mono", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Total Progress</div>
                    <div style={{ color: "#0C2830", fontSize: "18px", fontFamily: "Space Grotesk", fontWeight: "700" }}>21 done</div>
                  </div>
                </div>
              </div>

              <div style={{ background: "white", borderRadius: "20px", border: "1px solid #E2E8F0", padding: "24px", boxShadow: "0 4px 12px rgba(0,0,0,0.02)", flexShrink: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ color: "#0C2830", fontSize: "20px", fontFamily: "Space Grotesk", fontWeight: "700" }}>July 2026</div>
                    <div style={{ background: "rgba(0, 153, 166, 0.1)", color: "#0099A6", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontFamily: "Space Grotesk", fontWeight: "700" }}>THIS MONTH</div>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <div style={{ width: "32px", height: "32px", border: "1px solid #E2E8F0", borderRadius: "8px", display: "flex", justifyContent: "center", alignItems: "center", cursor: "pointer", color: "#7AAAB4" }}>&lt;</div>
                    <div style={{ width: "32px", height: "32px", border: "1px solid #E2E8F0", borderRadius: "8px", display: "flex", justifyContent: "center", alignItems: "center", cursor: "pointer", color: "#7AAAB4" }}>&gt;</div>
                  </div>
                </div>
                
                <div style={{ background: "#E2E8F0", border: "1px solid #E2E8F0", borderRadius: "16px", overflow: "hidden" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", background: "white", borderBottom: "1px solid #E2E8F0" }}>
                    {daysOfWeek.map((day, i) => (
                      <div key={i} style={{ padding: "16px 0", textAlign: "center", color: "#7AAAB4", fontSize: "13px", fontFamily: "Space Grotesk", fontWeight: "600", textTransform: "uppercase" }}>
                        {day}
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "1px", background: "#E2E8F0" }}>
                    {calendarGrid.map((day, index) => {
                      const isToday = day.status === "today";
                      const isCompleted = day.status === "completed";
                      const isUpcoming = day.status === "upcoming";
                      const isSelected = selectedPlanDate === day.date && day.isCurrentMonth;
                      let pillContent = null;
                      if (isCompleted) { 
                        pillContent = <div style={{ background: "rgba(75, 168, 130, 0.15)", color: "#4BA882", padding: "4px 6px", borderRadius: "6px", fontSize: "10px", fontFamily: "Space Grotesk", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px", width: "100%", boxSizing: "border-box" }}><span>✓</span> Completed</div>; 
                      } else if (isToday) { 
                        pillContent = <div style={{ background: "#C8704A", color: "white", padding: "4px 6px", borderRadius: "6px", fontSize: "10px", fontFamily: "Space Grotesk", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px", width: "100%", boxSizing: "border-box" }}><span>⭐</span> Today</div>; 
                      } else if (isUpcoming) { 
                        pillContent = <div style={{ background: "rgba(0, 153, 166, 0.1)", color: "#0099A6", padding: "4px 6px", borderRadius: "6px", fontSize: "10px", fontFamily: "Space Grotesk", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px", width: "100%", boxSizing: "border-box" }}><span>⏰</span> Therapy</div>; 
                      }

                      return (
                        <div key={index} onClick={() => { if (day.isCurrentMonth) setSelectedPlanDate(day.date) }} style={{ background: day.isCurrentMonth ? "white" : "#F8FAFC", minHeight: "100px", padding: "8px", display: "flex", flexDirection: "column", cursor: day.isCurrentMonth ? "pointer" : "default", boxShadow: isSelected ? "inset 0 0 0 2.5px #0099A6" : "none", transition: "all 0.2s" }}>
                          <div style={{ alignSelf: "flex-end", width: "28px", height: "28px", display: "flex", justifyContent: "center", alignItems: "center", background: isToday ? "#0099A6" : "transparent", color: isToday ? "white" : (day.isCurrentMonth ? "#0C2830" : "#CBD5E1"), borderRadius: "50%", fontSize: "15px", fontFamily: "Space Grotesk", fontWeight: isToday ? "700" : "500" }}>{day.date}</div>
                          <div style={{ marginTop: "auto" }}>{pillContent}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
            
            <FunctionalRightPanel navigate={navigate} selectedPlanData={selectedPlanData} selectedPlanDate={selectedPlanDate} />
          </div>
        )}


        {/* --- INTERACTIVE PRACTICE ACTIVE --- */}
        {activeMenu === "Interactive Practice" && (
          <div data-lenis-prevent="true" style={{ flex: 1, padding: "10px 20px 40px 20px", overflowY: "auto", display: "flex", flexDirection: "column", minHeight: 0 }}>
            <InteractivePracticeHub />
          </div>
        )}

        {/* --- SETTINGS ACTIVE (SUDAH DIPERBAIKI 100% ANTI CRASH) --- */}
        {activeMenu === "Settings" && (
          <div className="main-content" style={{ display: "flex", flex: 1, gap: "24px", height: "calc(100vh - 48px)" }}>
            
            <div className="hide-scroll" style={{ flex: 1, display: "flex", flexDirection: "column", gap: "20px", overflowY: "auto", paddingRight: "10px", paddingBottom: "100px", minWidth: 0 }} onWheel={(e) => { if (mainContentRef.current) mainContentRef.current.scrollTop += e.deltaY; }} ref={mainContentRef}>
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
                <div>
                  <div style={{ color: "#1A2332", fontSize: "32px", fontFamily: "Space Grotesk", fontWeight: "700", marginBottom: "2px" }}>
                    Settings
                  </div>
                  <div style={{ color: "#9AABB8", fontSize: "14px", fontFamily: "Space Grotesk", fontWeight: "500" }}>
                    Manage your profile and preferences.
                  </div>
                </div>
                <BellIcon showNotif={showNotif} setShowNotif={setShowNotif} />
              </div>

              <div style={{ display: "flex", gap: "20px", alignItems: "flex-start", flexShrink: 0, flexWrap: "wrap" }}>
                
                {/* SETTINGS CARD 1: YOUR PROFILE */}
                <div style={{ flex: "1 1 500px", display: "flex", flexDirection: "column", gap: "20px" }}>
                  <div style={{ background: "white", borderRadius: "18px", border: "1px solid #E2E8F0", overflow: "visible", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                    
                    <div style={{ padding: "18px 24px", borderBottom: "1px solid #E2E8F0" }}>
                      <div style={{ color: "#0C2830", fontSize: "16px", fontFamily: "Space Grotesk", fontWeight: "700" }}>
                        Your profile
                      </div>
                    </div>
                    
                    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
                      
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <label style={{ color: "#7AAAB4", fontSize: "13px", fontFamily: "Space Mono", textTransform: "uppercase", letterSpacing: "1px" }}>
                          Full name
                        </label>
                        <input 
                          type="text" 
                          value={fullName} 
                          onChange={(e) => setFullName(e.target.value)} 
                          style={{ padding: "12px 18px", border: "1.5px solid #C4E8EC", borderRadius: "10px", fontSize: "16px", fontFamily: "Space Grotesk", color: "#0C2830", outline: "none", width: "100%", boxSizing: "border-box" }} 
                        />
                      </div>
                      
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <label style={{ color: "#7AAAB4", fontSize: "13px", fontFamily: "Space Mono", textTransform: "uppercase", letterSpacing: "1px" }}>
                          Email address
                        </label>
                        <input 
                          type="email" 
                          value={email} 
                          onChange={(e) => setEmail(e.target.value)} 
                          style={{ padding: "12px 18px", border: "1.5px solid #C4E8EC", borderRadius: "10px", fontSize: "16px", fontFamily: "Space Grotesk", color: "#0C2830", outline: "none", width: "100%", boxSizing: "border-box" }} 
                        />
                      </div>
                      
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <label style={{ color: "#7AAAB4", fontSize: "13px", fontFamily: "Space Mono", textTransform: "uppercase", letterSpacing: "1px" }}>
                          Change password
                        </label>
                        <input 
                          type="password" 
                          value={password} 
                          onChange={(e) => setPassword(e.target.value)} 
                          placeholder="Enter new password" 
                          style={{ padding: "12px 18px", border: "1.5px solid #C4E8EC", borderRadius: "10px", fontSize: "16px", fontFamily: "Space Grotesk", color: "#0C2830", outline: "none", width: "100%", boxSizing: "border-box" }} 
                        />
                      </div>
                      
                      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
                        <button 
                          onClick={handleSaveChanges} 
                          disabled={!hasChanges} 
                          style={{ padding: "10px 20px", background: hasChanges ? "#0099A6" : "#C4E8EC", color: "white", border: "none", borderRadius: "10px", fontSize: "15px", fontFamily: "Space Grotesk", fontWeight: "600", cursor: hasChanges ? "pointer" : "not-allowed", transition: "background 0.3s" }}
                        >
                          Save changes
                        </button>
                      </div>

                    </div>
                  </div>
                </div>

                {/* SETTINGS CARD 2: ACCOUNT ROLE */}
                <div style={{ flex: "1 1 300px", display: "flex", flexDirection: "column", gap: "20px" }}>
                  <div style={{ background: "white", borderRadius: "18px", border: "1px solid #E2E8F0", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                    
                    <div style={{ padding: "18px 24px", borderBottom: "1px solid #E2E8F0" }}>
                      <div style={{ color: "#0C2830", fontSize: "16px", fontFamily: "Space Grotesk", fontWeight: "700" }}>
                        Account
                      </div>
                    </div>
                    
                    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
                      
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #F0FAFB", paddingBottom: "14px" }}>
                        <div>
                          <div style={{ color: "#0C2830", fontSize: "15px", fontFamily: "Space Grotesk", fontWeight: "600", marginBottom: "2px" }}>
                            Full Name
                          </div>
                          <div style={{ color: "#7AAAB4", fontSize: "14px", fontFamily: "Space Grotesk" }}>
                            {user?.name || "Not set"}
                          </div>
                        </div>
                      </div>
                      
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ color: "#0C2830", fontSize: "15px", fontFamily: "Space Grotesk", fontWeight: "600", marginBottom: "2px" }}>
                            Account Role
                          </div>
                          <div style={{ color: "#7AAAB4", fontSize: "14px", fontFamily: "Space Grotesk", textTransform: "capitalize" }}>
                            {user?.role || "Patient"}
                          </div>
                        </div>
                      </div>
                      
                      <button 
                        onClick={handleLogout} 
                        style={{ width: "100%", padding: "12px", background: "#FFE9E9", border: "1.5px solid #FFCECE", borderRadius: "100px", color: "#C0574C", fontSize: "15px", fontFamily: "Space Grotesk", fontWeight: "600", cursor: "pointer", transition: "background 0.2s" }} 
                        onMouseEnter={(e) => e.target.style.background = "#FFD6D6"} 
                        onMouseLeave={(e) => e.target.style.background = "#FFE9E9"}
                      >
                        Sign out of VISENSA
                      </button>

                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
};

export default PatientDashboard;