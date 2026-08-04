import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import visensaLogo from "../../assets/visensa-logo.png"; 

// ==========================================
// 1. DATA MOCK (DUMMY DATA)
// ==========================================

const initialPatients = [
  { id: "RJ", name: "Robert Johnson", week: "Wk 4", condition: "Phantom Limb Pain", compliance: "87%", sessions: 6, pain: "4/10", isNew: false, color: "#0099A6" },
  { id: "ML", name: "Margaret Lim", week: "Wk 2", condition: "Stroke Recovery", compliance: "55%", sessions: 2, pain: "7/10", isNew: false, color: "#D4A843" },
  { id: "AK", name: "Ahmad Kusuma", week: "Wk 7", condition: "Phantom Limb Pain", compliance: "98%", sessions: 14, pain: "3/10", isNew: false, color: "#4BA882" },
  { id: "DS", name: "Diana Santoso", week: "Wk 1", condition: "Stroke Recovery", compliance: "100%", sessions: 1, pain: "8/10", isNew: false, color: "#0099A6" },
  { id: "KM", name: "Kenji Morales", week: "Wk 4", condition: "Stroke / Hemiparesis", compliance: "Not started", sessions: 0, pain: "6/10", isNew: true, color: "#0099A6" },
];

const feedbackStats = [
  { label: "Current pain", val: "4/10", sub: "patient reported", color: "#D4A843" },
  { label: "Avg. pain relief", val: "−0.7 pts", sub: "per session", color: "#4BA882" },
  { label: "Sessions logged", val: "6", sub: "Week 4", color: "#0099A6" },
];

const chartPoints = [
  { date: "Jun 17", score: 8.5, x: 0, y: 20 },
  { date: "Jun 24", score: 7.2, x: 250, y: 25 },
  { date: "Jul 1", score: 6.5, x: 500, y: 35 },
  { date: "Jul 8", score: 5.0, x: 750, y: 45 },
  { date: "Today", score: 4.0, x: 1000, y: 55 },
];

const feedbackLogs = [
  { id: 1, date: "9", month: "Jul", status: "Excellent", scoreColor: "#4BA882", statusBg: "rgba(75, 168, 130, 0.10)", scoreFrom: 5, scoreTo: 4, diff: "↓1 pts", time: "11:42", text: "Felt improvement in finger extension. Less tingling in phantom fingers after session." },
  { id: 2, date: "8", month: "Jul", status: "Good", scoreColor: "#3ED8C8", statusBg: "rgba(62, 216, 200, 0.10)", scoreFrom: 6, scoreTo: 5, diff: "↓1 pts", time: "12:10", text: "Wrist rotation still uncomfortable. Finger exercises feel easier." },
  { id: 3, date: "8", month: "Jul", status: "Good", scoreColor: "#3ED8C8", statusBg: "rgba(62, 216, 200, 0.10)", scoreFrom: 6, scoreTo: 5, diff: "↓1 pts", time: "12:10", text: "Wrist rotation still uncomfortable. Finger exercises feel easier." },
];

const notificationsData = [
  { id: 1, icon: '⚠️', title: 'Margaret Lim — low compliance', desc: 'No session in 4 days. Compliance dropped to 55%. Consider reaching out.', time: '2h ago', unread: true, color: '#D4A843', bg: 'rgba(212, 168, 67, 0.07)' },
  { id: 2, icon: '✅', title: 'Diana Santoso — first session complete', desc: 'Diana completed her first therapy session today (8:05 min, 8/8 exercises).', time: '3h ago', unread: true, color: '#4BA882', bg: 'rgba(75, 168, 130, 0.07)' },
  { id: 3, icon: '📈', title: 'Ahmad Kusuma — remarkable progress', desc: '5 consecutive Excellent sessions. Pain reduced from 7 → 3 over 7 weeks.', time: 'Today', unread: true, color: '#0099A6', bg: 'rgba(0, 153, 166, 0.08)' },
  { id: 4, icon: 'ⓘ', title: 'Robert Johnson — weekly report ready', desc: 'Week 4 summary is available. Average pain relief: −1.4 pts/session.', time: 'Yesterday', unread: false, color: '#3ED8C8', bg: 'rgba(62, 216, 200, 0.08)' }
];

const allDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const availableExercises = [
  "Finger extension — slow", "Wrist flexion / extension", "Pinch grip — coin",
  "Wrist deviation", "Finger tap sequence", "Static open hold", "Single finger lift", "Fist hold"
];

// ==========================================
// 2. KOMPONEN UTAMA
// ==========================================

const Dashboard = () => {
  const navigate = useNavigate();
  
  const [hoveredIndex, setHoveredIndex] = useState(2); 
  const [showNotif, setShowNotif] = useState(false);
  const [activePatient, setActivePatient] = useState(initialPatients[0]); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const [activeTab, setActiveTab] = useState("Feedback"); 

  const [planFreq, setPlanFreq] = useState("3x a week");
  const [planInterval, setPlanInterval] = useState("1 day rest");
  const [selectedDays, setSelectedDays] = useState(["Mon", "Wed", "Fri"]);
  const [selectedExercises, setSelectedExercises] = useState([
    "Finger extension — slow", "Wrist flexion / extension", "Pinch grip — coin", "Wrist deviation", "Finger tap sequence"
  ]);

  const mainContentRef = useRef(null);
  const sidebarListRef = useRef(null);

  useEffect(() => {
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    const prevBodyMargin = document.body.style.margin;
    const prevHtmlHeight = document.documentElement.style.height;
    const prevBodyHeight = document.body.style.height;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.margin = "0";
    document.documentElement.style.height = "100%";
    document.body.style.height = "100%";

    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
      document.body.style.margin = prevBodyMargin;
      document.documentElement.style.height = prevHtmlHeight;
      document.body.style.height = prevBodyHeight;
    };
  }, []);

  const toggleDay = (day) => {
    setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  const toggleExercise = (ex) => {
    setSelectedExercises(prev => prev.includes(ex) ? prev.filter(e => e !== ex) : [...prev, ex]);
  };

  const handleSavePlan = () => {
    alert("Therapy plan saved successfully!");
  };

  return (
    <>
      <style>
        {`
          .hide-scroll::-webkit-scrollbar { display: none; }
          .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }

          @media (max-width: 1200px) {
            .doctor-feedback-grid {
              grid-template-columns: repeat(2, 1fr) !important;
            }
            .doctor-header-title {
              font-size: 28px !important;
            }
          }
          @media (max-width: 900px) {
            .doctor-outer {
              padding: 10px !important;
              gap: 10px !important;
            }
            .doctor-feedback-grid {
              grid-template-columns: 1fr !important;
            }
            .doctor-notif-panel {
              width: min(90vw, 450px) !important;
            }
          }
        `}
      </style>
      {/* Jarak gap dan padding diperlebar jadi 24px agar lebih bernafas */}
      <div className="doctor-outer" style={{ width: "100vw", height: "100vh", display: "flex", background: "#F0F2F5", fontFamily: "Space Grotesk, sans-serif", padding: "24px", boxSizing: "border-box", gap: "24px", position: "relative" }}>

      {/* ============================== */}
      {/* SIDEBAR (KIRI - FIXED)         */}
      {/* ============================== */}
      <div
        style={{
          width: isSidebarOpen ? "280px" : "96px",
          minWidth: isSidebarOpen ? "280px" : "96px",
          height: "calc(100vh - 48px)",
          background: "#151E2C",
          borderRadius: "20px",
          boxShadow: "0px 10px 40px rgba(226, 236, 249, 0.25)",
          display: "flex",
          flexDirection: "column",
          zIndex: 10,
          overflow: "hidden", 
          flexShrink: 0,
          position: "relative",
          transition: "all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)",
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", overflow: "hidden", borderRadius: "20px" }}>
          
          <div
            style={{
              padding: isSidebarOpen ? "30px 24px 20px" : "30px 0 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: isSidebarOpen ? "space-between" : "center",
              flexShrink: 0,
              transition: "all 0.3s",
            }}
          >
            <div 
              onClick={() => !isSidebarOpen && setIsSidebarOpen(true)}
              style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "10px",
                cursor: isSidebarOpen ? "default" : "pointer"
              }}
              title={!isSidebarOpen ? "Expand sidebar" : undefined}
            >
              <img src={visensaLogo} alt="VISENSA Logo" style={{ width: "28px", height: "auto", flexShrink: 0 }} />
              <div
                style={{
                  color: "#F0FAFB",
                  fontSize: "22px",
                  fontWeight: "800",
                  letterSpacing: "1px",
                  whiteSpace: "nowrap",
                  opacity: isSidebarOpen ? 1 : 0,
                  width: isSidebarOpen ? "100px" : "0px",
                  overflow: "hidden",
                  transition: "all 0.3s",
                }}
              >
                VISENSA
              </div>
            </div>

            <div 
              onClick={() => setIsSidebarOpen(false)}
              style={{
                cursor: "pointer",
                color: "#7AAAB4",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                opacity: isSidebarOpen ? 1 : 0,
                width: isSidebarOpen ? "24px" : "0px",
                overflow: "hidden",
                transition: "all 0.3s",
              }}
              title="Collapse sidebar"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="9" y1="3" x2="9" y2="21"></line>
              </svg>
            </div>
          </div>

          <div style={{ height: "1px", background: "rgba(255, 255, 255, 0.10)", margin: isSidebarOpen ? "0 24px" : "0 16px", flexShrink: 0 }} />

          <div
            className="hide-scroll"
            ref={sidebarListRef}
            onWheel={(e) => {
              if (sidebarListRef.current) {
                sidebarListRef.current.scrollTop += e.deltaY;
              }
            }}
            style={{ flex: 1, minHeight: 0, padding: isSidebarOpen ? "20px 16px" : "20px 0", overflowY: "auto", overscrollBehavior: "contain", boxSizing: "border-box" }}
          >
            <div style={{ display: "flex", justifyContent: isSidebarOpen ? "space-between" : "center", alignItems: "center", marginBottom: "20px", gap: "8px" }}>
              <div
                onClick={() => !isSidebarOpen && setIsSidebarOpen(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  cursor: isSidebarOpen ? "default" : "pointer",
                  width: isSidebarOpen ? "auto" : "40px",
                }}
              >
                {isSidebarOpen ? (
                  <>
                    <div style={{ color: "#7AAAB4", fontSize: "11px", fontFamily: "Space Mono", letterSpacing: "1.2px" }}>PATIENTS (5)</div>
                    <div style={{ background: "rgba(212, 168, 67, 0.12)", border: "1px solid rgba(212, 168, 67, 0.25)", borderRadius: "20px", padding: "2px 6px", color: "#D4A843", fontSize: "10px", fontFamily: "Space Mono", fontWeight: "700" }}>1!</div>
                  </>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7AAAB4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                )}
              </div>

              <div onClick={() => setIsModalOpen(true)} style={{ width: "28px", height: "28px", flexShrink: 0, background: "rgba(96.85, 242.61, 255, 0.08)", borderRadius: "8px", display: "flex", justifyContent: "center", alignItems: "center", cursor: "pointer", transition: "all 0.2s" }} title="Add Patient">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line>
                </svg>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {initialPatients.map((patient) => {
                const isSelected = activePatient.id === patient.id;
                return (
                  <div
                    key={patient.id}
                    onClick={() => {
                      setActivePatient(patient);
                      if (!isSidebarOpen) setIsSidebarOpen(true); 
                    }}
                    title={!isSidebarOpen ? patient.name : undefined}
                    style={{
                      padding: isSidebarOpen ? "12px 16px" : "0",
                      width: isSidebarOpen ? "100%" : "44px",
                      height: isSidebarOpen ? "auto" : "44px",
                      margin: isSidebarOpen ? "0" : "0 auto",
                      background: isSelected ? "#F0FAFB" : "transparent",
                      borderRadius: "12px",
                      border: isSelected ? "1px solid #C4E8EC" : "1px solid transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: isSidebarOpen ? "flex-start" : "center",
                      gap: isSidebarOpen ? "12px" : "0",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      boxSizing: "border-box",
                    }}
                  >
                    <div style={{ width: "36px", height: "36px", flexShrink: 0, background: isSelected ? "linear-gradient(135deg, #0099A6 0%, #007580 100%)" : "#1A2536", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                      <span style={{ color: isSelected ? "white" : "#7AAAB4", fontSize: "13px", fontWeight: "700" }}>{patient.id}</span>
                    </div>
                    <div
                      style={{
                        opacity: isSidebarOpen ? 1 : 0,
                        width: isSidebarOpen ? "100%" : "0px",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        transition: "all 0.2s",
                      }}
                    >
                      <div style={{ color: isSelected ? "#151E2C" : "#F0FAFB", fontSize: "14.5px", fontWeight: isSelected ? "700" : "500", marginBottom: "2px" }}>{patient.name}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <div style={{ width: "8px", height: "8px", flexShrink: 0, background: patient.color, borderRadius: "50%", boxShadow: patient.id === "ML" ? "0 0 0 3px rgba(212,168,67,0.2)" : "none" }} />
                        <div style={{ color: "#7AAAB4", fontSize: "11px", fontFamily: "Space Mono" }}>{patient.week}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Sidebar (Diperbaiki rata tengahnya) */}
          <div style={{ padding: isSidebarOpen ? "20px 16px 24px" : "20px 0 24px", borderTop: "1px solid rgba(255,255,255,0.05)", flexShrink: 0, boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: isSidebarOpen ? "flex-start" : "center",
                gap: "12px",
                marginBottom: "12px",
                background: isSidebarOpen ? "#F0FAFB" : "transparent",
                padding: isSidebarOpen ? "10px 12px" : "0",
                width: isSidebarOpen ? "100%" : "44px",
                height: isSidebarOpen ? "auto" : "44px",
                borderRadius: "16px",
                boxSizing: "border-box",
                transition: "all 0.2s",
              }}
            >
              <div style={{ width: "36px", height: "36px", flexShrink: 0, background: "linear-gradient(135deg, #0099A6 0%, #007580 100%)", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center", margin: isSidebarOpen ? "0" : "0 auto" }}>
                <span style={{ color: "white", fontSize: "13px", fontWeight: "700" }}>SK</span>
              </div>
              <div
                style={{
                  opacity: isSidebarOpen ? 1 : 0,
                  width: isSidebarOpen ? "auto" : "0px",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s",
                }}
              >
                <div style={{ color: "#0C2830", fontSize: "14px", fontWeight: "700" }}>Dr. Sarah K.</div>
                <div style={{ color: "#7AAAB4", fontSize: "11.5px" }}>Occupational Therapist</div>
              </div>
            </div>
            <button
              onClick={() => navigate("/")}
              title={!isSidebarOpen ? "Sign out" : undefined}
              style={{
                width: isSidebarOpen ? "100%" : "44px",
                height: isSidebarOpen ? "auto" : "44px",
                margin: "0 auto",
                padding: isSidebarOpen ? "10px" : "0",
                background: "#FFE9E9",
                border: "1px solid rgba(192, 86, 76, 0.5)",
                borderRadius: "12px",
                color: "#C0574C",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "8px",
                boxSizing: "border-box",
                transition: "all 0.2s",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              {isSidebarOpen && "Sign out"}
            </button>
          </div>
        </div>
      </div>

      {/* ============================== */}
      {/* MAIN CONTENT (KANAN - NATURAL SCROLL) */}
      {/* ============================== */}
      <div
        className="hide-scroll"
        ref={mainContentRef}
        onWheel={(e) => {
          if (mainContentRef.current) {
            mainContentRef.current.scrollTop += e.deltaY;
          }
        }}
        style={{ flex: 1, minHeight: 0, height: "calc(100vh - 48px)", overflowY: "auto", overscrollBehavior: "contain", WebkitOverflowScrolling: "touch", paddingRight: "16px", paddingBottom: "60px", display: "flex", flexDirection: "column", boxSizing: "border-box" }}
      >
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "35px", marginTop: "4px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ color: "#9AABB8", fontSize: "15px", fontWeight: "500", marginBottom: "8px" }}>Hello, Dr. Sarah K.</div>
            <div className="doctor-header-title" style={{ color: "#1A2332", fontSize: "36px", fontWeight: "700" }}>Patient Monitoring</div>
          </div>
          
          <div style={{ position: "relative" }}>
            <div onClick={() => setShowNotif(!showNotif)} style={{ width: "48px", height: "48px", flexShrink: 0, background: "white", borderRadius: "16px", boxShadow: "0px 2px 10px rgba(0,0,0,0.05)", display: "flex", justifyContent: "center", alignItems: "center", cursor: "pointer", border: showNotif ? "1.5px solid #0099A6" : "1.5px solid transparent", transition: "all 0.2s" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4A5568" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
              <div style={{ width: "10px", height: "10px", background: "#F97316", borderRadius: "50%", position: "absolute", top: "10px", right: "12px", border: "2px solid white" }} />
            </div>

            {showNotif && (
              <div className="doctor-notif-panel" style={{ position: 'absolute', top: '60px', right: '0', width: '450px', maxWidth: '90vw', background: 'white', boxShadow: '0px 12px 50px rgba(12, 40, 48, 0.15)', borderRadius: '24px', border: '1.5px solid #C4E8EC', zIndex: 100, overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1.5px solid #C4E8EC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ color: '#0C2830', fontSize: '20px', fontWeight: '700' }}>Notifications</div>
                    <div style={{ background: '#D4A843', color: 'white', padding: '2px 10px', borderRadius: '20px', fontSize: '14px', fontFamily: 'Space Mono', fontWeight: '700' }}>3</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ color: '#0099A6', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>Mark all read</div>
                    <svg onClick={() => setShowNotif(false)} style={{ cursor: 'pointer' }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7AAAB4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </div>
                </div>

                <div style={{ maxHeight: '450px', overflowY: 'auto' }}>
                  {notificationsData.map((notif) => (
                    <div key={notif.id} style={{ padding: '20px 24px', borderBottom: '1.5px solid #C4E8EC', background: notif.unread ? 'rgba(12, 40, 48, 0.02)' : 'white', display: 'flex', gap: '16px' }}>
                      <div style={{ width: '40px', height: '40px', minWidth: '40px', background: notif.bg, borderRadius: '12px', border: `1.5px solid ${notif.color}40`, display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '18px' }}>
                        {notif.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                          <div style={{ color: '#0C2830', fontSize: '16px', fontWeight: notif.unread ? '700' : '500', paddingRight: '12px', lineHeight: '1.4' }}>{notif.title}</div>
                          {notif.unread && <div style={{ width: '10px', height: '10px', minWidth: '10px', background: '#0099A6', borderRadius: '50%', marginTop: '4px' }} />}
                        </div>
                        <div style={{ color: '#7AAAB4', fontSize: '14.5px', lineHeight: '1.5', marginBottom: '8px' }}>{notif.desc}</div>
                        <div style={{ color: '#7AAAB4', fontSize: '13px', fontFamily: 'Space Mono' }}>{notif.time}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ padding: '16px', textAlign: 'center', color: '#7AAAB4', fontSize: '14.5px', fontWeight: '500', background: 'white', cursor: 'pointer' }}>
                  Showing all 4 notifications
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ============================== */}
        {/* PATIENT HEADER + TABS          */}
        {/* ============================== */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "30px", flexWrap: "wrap", gap: "20px" }}>
          <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
            <div style={{ width: "56px", height: "56px", background: "linear-gradient(135deg, #0099A6 0%, #007580 100%)", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center", boxShadow: "0px 4px 15px rgba(0, 153, 166, 0.2)" }}>
              <span style={{ color: "white", fontSize: "20px", fontWeight: "700" }}>{activePatient.id}</span>
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                <div style={{ color: "#0C2830", fontSize: "24px", fontWeight: "700" }}>{activePatient.name}</div>
                {activePatient.isNew ? (
                   <div style={{ background: "rgba(0, 153, 166, 0.08)", border: "1px solid rgba(0, 153, 166, 0.2)", borderRadius: "20px", padding: "4px 12px", color: "#0099A6", fontSize: "13px", fontFamily: "Space Mono", fontWeight: "700" }}>New patient</div>
                ) : (
                   <div style={{ background: "rgba(75, 168, 130, 0.1)", border: "1px solid rgba(75, 168, 130, 0.2)", borderRadius: "20px", padding: "4px 12px", color: "#4BA882", fontSize: "13px", fontFamily: "Space Mono", fontWeight: "700" }}>Active</div>
                )}
              </div>
              <div style={{ display: "flex", gap: "20px", color: "#7AAAB4", fontSize: "14.5px", fontFamily: "Space Mono" }}>
                <span>{activePatient.condition}</span>
                {activePatient.isNew ? <span>Not started</span> : <span>{activePatient.week}</span>}
                <span>{activePatient.isNew ? "0 sessions" : `${activePatient.compliance} compliance`}</span>
                <span>Pain: {activePatient.pain}</span>
              </div>
            </div>
          </div>

          {/* TAB NAVIGASI */}
          <div style={{ display: "flex", background: "white", padding: "6px", borderRadius: "16px", border: "1px solid #C4E8EC", boxShadow: "0px 2px 10px rgba(0,0,0,0.02)", opacity: activePatient.isNew ? 0.5 : 1, pointerEvents: activePatient.isNew ? "none" : "auto" }}>
            <button onClick={() => setActiveTab("Feedback")} style={{ padding: "10px 20px", background: activeTab === "Feedback" ? "#F0FAFB" : "transparent", border: activeTab === "Feedback" ? "1px solid #C4E8EC" : "1px solid transparent", borderRadius: "12px", color: activeTab === "Feedback" ? "#0099A6" : "#7AAAB4", fontSize: "15px", fontWeight: activeTab === "Feedback" ? "700" : "500", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", transition: "all 0.2s" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              Feedback
            </button>
            <button onClick={() => setActiveTab("Plan")} style={{ padding: "10px 20px", background: activeTab === "Plan" ? "#F0FAFB" : "transparent", border: activeTab === "Plan" ? "1px solid #C4E8EC" : "1px solid transparent", borderRadius: "12px", color: activeTab === "Plan" ? "#0099A6" : "#7AAAB4", fontSize: "15px", fontWeight: activeTab === "Plan" ? "700" : "500", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", transition: "all 0.2s" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              Therapy Plan
            </button>
          </div>
        </div>

        {/* LOGIKA KONTEN: EMPTY STATE vs FEEDBACK vs PLAN */}
        {activePatient.isNew ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", paddingBottom: "100px" }}>
             <div style={{ width: "74px", height: "74px", background: "rgba(0, 153, 166, 0.08)", borderRadius: "21px", border: "1.34px solid rgba(0, 153, 166, 0.20)", display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "18px" }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0099A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                   <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                </svg>
             </div>
             <div style={{ color: "#0C2830", fontSize: "21px", fontFamily: "Space Grotesk", fontWeight: "700", marginBottom: "8px" }}>No sessions yet</div>
             <div style={{ color: "#7AAAB4", fontSize: "17px", fontFamily: "Space Grotesk", textAlign: "center", maxWidth: "380px", lineHeight: "1.5", marginBottom: "20px" }}>
                {activePatient.name.toLowerCase()} has been registered but hasn't completed their first therapy session. Share their login link to get started.
             </div>
             <div style={{ background: "rgba(75, 168, 130, 0.07)", border: "1.34px solid rgba(75, 168, 130, 0.18)", borderRadius: "13px", padding: "12px 24px", display: "flex", alignItems: "center", gap: "10px", color: "#4BA882", fontSize: "15px", fontFamily: "Space Mono" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                Registration complete · login email sent
             </div>
          </div>
        ) : (
          activeTab === "Feedback" ? (
            /* ============================== */
            /* TAB: FEEDBACK & PROGRESS       */
            /* ============================== */
            <div>
              <div className="doctor-feedback-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px", marginBottom: "30px" }}>
                {feedbackStats.map((stat, i) => (
                  <div key={i} style={{ background: "white", padding: "24px", borderRadius: "20px", border: "1px solid #E2E8F0", boxShadow: "0 4px 15px rgba(0,0,0,0.02)" }}>
                    <div style={{ color: "#7AAAB4", fontSize: "13px", fontFamily: "Space Mono", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px" }}>{stat.label}</div>
                    <div style={{ color: stat.color, fontSize: "32px", fontFamily: "Space Mono", fontWeight: "700", marginBottom: "4px" }}>{stat.val}</div>
                    <div style={{ color: "#7AAAB4", fontSize: "14px" }}>{stat.sub}</div>
                  </div>
                ))}
              </div>

              <div style={{ background: "white", padding: "24px 30px", borderRadius: "20px", border: "1px solid #C4E8EC", marginBottom: "30px", boxShadow: "0 4px 15px rgba(0,0,0,0.02)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                  <div>
                    <div style={{ color: "#0C2830", fontSize: "18px", fontWeight: "700", marginBottom: "4px" }}>Pain score trend</div>
                    <div style={{ color: "#7AAAB4", fontSize: "14px" }}>Patient-reported · lower is better</div>
                  </div>
                  <div style={{ background: "rgba(75, 168, 130, 0.1)", border: "1px solid rgba(75, 168, 130, 0.2)", borderRadius: "20px", padding: "6px 14px", color: "#4BA882", fontSize: "14px", fontWeight: "600" }}>↘ 8.5 → 4</div>
                </div>
                <div style={{ position: "relative", height: "170px", width: "100%", borderBottom: "1px solid #E2E8F0" }}>
                  <svg viewBox="0 0 1000 120" preserveAspectRatio="none" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "120px" }}>
                    <defs>
                      <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="rgba(0, 153, 166, 0.15)" />
                        <stop offset="100%" stopColor="rgba(0, 153, 166, 0)" />
                      </linearGradient>
                    </defs>
                    <polygon points="0,120 0,20 250,25 500,35 750,45 1000,55 1000,120" fill="url(#chartGradient)" />
                    <polyline points="0,20 250,25 500,35 750,45 1000,55" fill="none" stroke="#0099A6" strokeWidth="3" />
                    {chartPoints.map((pt, i) => (
                      <circle key={i} cx={pt.x} cy={pt.y} r={hoveredIndex === i ? 8 : 6} fill="#0099A6" stroke="white" strokeWidth="3" style={{ transition: "all 0.2s ease" }} />
                    ))}
                  </svg>
                  <div style={{ position: "absolute", left: `${(hoveredIndex / 4) * 100}%`, top: 0, height: "120px", width: "1px", background: "#C4E8EC", zIndex: 1, transition: "left 0.3s ease" }} />
                  <div style={{ position: "absolute", left: `${(hoveredIndex / 4) * 100}%`, top: `${chartPoints[hoveredIndex].y - 20}px`, transform: "translate(-50%, -100%)", background: "white", border: "1px solid #C4E8EC", boxShadow: "0 6px 20px rgba(0, 153, 166, 0.15)", padding: "10px 16px", borderRadius: "12px", zIndex: 2, transition: "all 0.3s ease", pointerEvents: "none" }}>
                    <div style={{ color: "#7AAAB4", fontSize: "12px", fontFamily: "Space Mono", marginBottom: "2px", textAlign: "center" }}>{chartPoints[hoveredIndex].date}</div>
                    <div style={{ color: "#0099A6", fontSize: "20px", fontFamily: "Space Mono", fontWeight: "700", textAlign: "center" }}>
                      {chartPoints[hoveredIndex].score}<span style={{ color: "#7AAAB4", fontSize: "14px", fontWeight: "400" }}>/10</span>
                    </div>
                  </div>
                  <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", zIndex: 10 }}>
                    {chartPoints.map((pt, i) => (
                      <div key={i} onMouseEnter={() => setHoveredIndex(i)} style={{ flex: 1, cursor: "pointer" }} />
                    ))}
                  </div>
                  <div style={{ width: "100%", display: "flex", justifyContent: "space-between", color: "#7AAAB4", fontSize: "12px", fontFamily: "Space Mono", position: "absolute", bottom: "10px" }}>
                    {chartPoints.map((pt, i) => (
                      <span key={i} style={{ fontWeight: hoveredIndex === i ? "700" : "400", color: hoveredIndex === i ? "#0099A6" : "#7AAAB4", transition: "color 0.2s ease" }}>
                        {pt.date}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ background: "white", borderRadius: "20px", border: "1px solid #C4E8EC", boxShadow: "0 4px 15px rgba(0,0,0,0.02)", overflow: "hidden" }}>
                <div style={{ padding: "24px 30px", borderBottom: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ color: "#0C2830", fontSize: "18px", fontWeight: "700" }}>Session feedback log</div>
                  <div style={{ color: "#7AAAB4", fontSize: "14px", fontFamily: "Space Mono" }}>6 sessions</div>
                </div>
                <div>
                  {feedbackLogs.map((log) => (
                    <div key={log.id} style={{ padding: "24px 30px", borderBottom: "1px solid #E2E8F0", display: "flex", gap: "20px" }}>
                      <div style={{ background: "#F0FAFB", border: "1px solid #C4E8EC", borderRadius: "12px", padding: "10px 14px", display: "flex", flexDirection: "column", alignItems: "center", minWidth: "60px", maxHeight: "60px", justifyContent: "center" }}>
                        <span style={{ color: "#0C2830", fontSize: "20px", fontFamily: "Space Mono", fontWeight: "700", lineHeight: "1" }}>{log.date}</span>
                        <span style={{ color: "#7AAAB4", fontSize: "12px", fontFamily: "Space Mono", marginTop: "4px" }}>{log.month}</span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <span style={{ background: log.statusBg, color: log.scoreColor, padding: "4px 12px", borderRadius: "20px", fontSize: "13px", fontFamily: "Space Mono", fontWeight: "700" }}>{log.status}</span>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontFamily: "Space Mono", fontSize: "15px", fontWeight: "700" }}>
                              <span style={{ color: "#D4A843" }}>{log.scoreFrom}</span><span style={{ color: "#7AAAB4", fontSize: "13px", fontWeight: "400" }}>→</span><span style={{ color: "#D4A843" }}>{log.scoreTo}</span><span style={{ color: "#4BA882", fontSize: "13px", fontWeight: "400", marginLeft: "4px" }}>{log.diff}</span>
                            </div>
                          </div>
                          <div style={{ color: "#7AAAB4", fontSize: "13px", fontFamily: "Space Mono" }}>{log.time}</div>
                        </div>
                        <div style={{ background: "#F0FAFB", border: "1px solid rgba(0, 153, 166, 0.1)", borderRadius: "12px", padding: "14px 20px", display: "flex", gap: "10px", alignItems: "flex-start" }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0099A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: "2px" }}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                          <span style={{ color: "#3A6870", fontSize: "15.5px", lineHeight: "1.5" }}>{log.text}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* ============================== */
            /* TAB: THERAPY PLAN (CRUD)       */
            /* ============================== */
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              
              {/* Card 1: Schedule Configuration */}
              <div style={{ background: "white", padding: "30px", borderRadius: "20px", border: "1px solid #C4E8EC", boxShadow: "0 4px 15px rgba(0,0,0,0.02)" }}>
                <div style={{ color: "#0C2830", fontSize: "18px", fontWeight: "700", marginBottom: "24px" }}>Schedule Configuration</div>
                
                <div style={{ display: "flex", gap: "24px", marginBottom: "30px", flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: "200px" }}>
                    <div style={{ fontSize: "14px", fontFamily: "Space Grotesk", fontWeight: "600", color: "#3A6870", marginBottom: "8px" }}>Frequency</div>
                    <div style={{ position: "relative" }}>
                      <select value={planFreq} onChange={(e) => setPlanFreq(e.target.value)} style={{ width: "100%", height: "46px", padding: "0 16px", background: "#F8FAFC", border: "1.5px solid #E2E8F0", borderRadius: "12px", color: "#0C2830", fontSize: "15px", fontFamily: "Space Grotesk", outline: "none", appearance: "none", cursor: "pointer" }}>
                        <option>1x a week</option>
                        <option>2x a week</option>
                        <option>3x a week</option>
                        <option>Every day</option>
                      </select>
                      <div style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7AAAB4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                      </div>
                    </div>
                  </div>
                  <div style={{ flex: 1, minWidth: "200px" }}>
                    <div style={{ fontSize: "14px", fontFamily: "Space Grotesk", fontWeight: "600", color: "#3A6870", marginBottom: "8px" }}>Interval / Rest</div>
                    <div style={{ position: "relative" }}>
                      <select value={planInterval} onChange={(e) => setPlanInterval(e.target.value)} style={{ width: "100%", height: "46px", padding: "0 16px", background: "#F8FAFC", border: "1.5px solid #E2E8F0", borderRadius: "12px", color: "#0C2830", fontSize: "15px", fontFamily: "Space Grotesk", outline: "none", appearance: "none", cursor: "pointer" }}>
                        <option>No rest</option>
                        <option>1 day rest</option>
                        <option>2 days rest</option>
                      </select>
                      <div style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7AAAB4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: "14px", fontFamily: "Space Grotesk", fontWeight: "600", color: "#3A6870", marginBottom: "12px" }}>Select Therapy Days</div>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  {allDays.map(day => {
                    const isSelected = selectedDays.includes(day);
                    return (
                      <div 
                        key={day} 
                        onClick={() => toggleDay(day)}
                        style={{ padding: "8px 20px", background: isSelected ? "#0099A6" : "white", border: isSelected ? "1.5px solid #0099A6" : "1.5px solid #E2E8F0", borderRadius: "100px", color: isSelected ? "white" : "#7AAAB4", fontSize: "14px", fontFamily: "Space Mono", fontWeight: isSelected ? "700" : "500", cursor: "pointer", transition: "all 0.2s" }}
                      >
                        {day}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Card 2: Exercise Routine */}
              <div style={{ background: "white", padding: "30px", borderRadius: "20px", border: "1px solid #C4E8EC", boxShadow: "0 4px 15px rgba(0,0,0,0.02)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                  <div style={{ color: "#0C2830", fontSize: "18px", fontWeight: "700" }}>Assign Exercises</div>
                  <div style={{ color: "#7AAAB4", fontSize: "14px", fontFamily: "Space Mono" }}>{selectedExercises.length} selected</div>
                </div>
                
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "16px" }}>
                  {availableExercises.map(ex => {
                    const isSelected = selectedExercises.includes(ex);
                    return (
                      <div 
                        key={ex} 
                        onClick={() => toggleExercise(ex)}
                        style={{ padding: "16px", background: isSelected ? "rgba(75, 168, 130, 0.05)" : "white", border: isSelected ? "1.5px solid #4BA882" : "1px solid #E2E8F0", borderRadius: "12px", display: "flex", alignItems: "flex-start", gap: "12px", cursor: "pointer", transition: "all 0.2s" }}
                      >
                        <div style={{ width: "22px", height: "22px", border: isSelected ? "none" : "2px solid #C4E8EC", background: isSelected ? "#4BA882" : "transparent", borderRadius: "6px", flexShrink: 0, display: "flex", justifyContent: "center", alignItems: "center" }}>
                          {isSelected && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                        </div>
                        <div style={{ color: isSelected ? "#0C2830" : "#7AAAB4", fontSize: "14.5px", fontWeight: isSelected ? "600" : "500", lineHeight: "1.4" }}>
                          {ex}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Save Button */}
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "10px" }}>
                <button onClick={handleSavePlan} style={{ padding: "14px 32px", background: "linear-gradient(135deg, #0099A6 0%, #007580 100%)", boxShadow: "0px 4px 15px rgba(0, 153, 166, 0.25)", border: "none", borderRadius: "14px", color: "white", fontSize: "16px", fontFamily: "Space Grotesk", fontWeight: "700", cursor: "pointer", transition: "transform 0.2s" }} onMouseEnter={(e) => e.target.style.transform = "scale(1.02)"} onMouseLeave={(e) => e.target.style.transform = "scale(1)"}>
                  Save Therapy Plan
                </button>
              </div>

            </div>
          )
        )}
      </div>

      {/* ============================== */}
      {/* MODAL: REGISTER NEW PATIENT    */}
      {/* ============================== */}
      {isModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(12, 40, 48, 0.4)", zIndex: 9999, display: "flex", justifyContent: "center", alignItems: "center", backdropFilter: "blur(4px)" }}>
          
          <div style={{ width: "100%", maxWidth: "540px", maxHeight: "90vh", overflowY: "auto", background: "white", borderRadius: "24px", boxShadow: "0px 20px 60px rgba(12, 40, 48, 0.15)", border: "1px solid #C4E8EC", display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
            
            <div style={{ padding: "24px 30px", borderBottom: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ width: "42px", height: "42px", background: "linear-gradient(135deg, #0099A6 0%, #007580 100%)", borderRadius: "12px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
                </div>
                <div>
                  <div style={{ color: "#0C2830", fontSize: "18px", fontFamily: "Space Grotesk", fontWeight: "700" }}>Register new patient</div>
                  <div style={{ color: "#7AAAB4", fontSize: "13px", fontFamily: "Space Grotesk" }}>Patient will receive login credentials via email</div>
                </div>
              </div>
              
              <div onClick={() => setIsModalOpen(false)} style={{ cursor: "pointer", padding: "4px" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7AAAB4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </div>
            </div>

            <div style={{ padding: "24px 30px", display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ fontSize: "14px", fontFamily: "Space Grotesk", fontWeight: "600", color: "#3A6870" }}>
                  Full name <span style={{ color: "#C0574C" }}>*</span>
                </div>
                <input type="text" placeholder="e.g. Budi Santoso" style={{ width: "100%", height: "46px", padding: "0 16px", background: "white", border: "1.5px solid #E2E8F0", borderRadius: "12px", color: "#0C2830", fontSize: "15px", fontFamily: "Space Grotesk", boxSizing: "border-box", outline: "none" }} />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ fontSize: "14px", fontFamily: "Space Grotesk", fontWeight: "600", color: "#3A6870" }}>
                  Email address <span style={{ color: "#C0574C" }}>*</span>
                </div>
                <input type="email" placeholder="e.g. budi@email.com" style={{ width: "100%", height: "46px", padding: "0 16px", background: "white", border: "1.5px solid #E2E8F0", borderRadius: "12px", color: "#0C2830", fontSize: "15px", fontFamily: "Space Grotesk", boxSizing: "border-box", outline: "none" }} />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ fontSize: "14px", fontFamily: "Space Grotesk", fontWeight: "600", color: "#3A6870" }}>
                  Password <span style={{ color: "#C0574C" }}>*</span>
                </div>
                <input type="password" placeholder="Create a temporary password" style={{ width: "100%", height: "46px", padding: "0 16px", background: "white", border: "1.5px solid #E2E8F0", borderRadius: "12px", color: "#0C2830", fontSize: "15px", fontFamily: "Space Grotesk", boxSizing: "border-box", outline: "none" }} />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ fontSize: "14px", fontFamily: "Space Grotesk", fontWeight: "600", color: "#3A6870" }}>
                  Diagnosis / condition <span style={{ color: "#C0574C" }}>*</span>
                </div>
                <div style={{ position: "relative" }}>
                   <select defaultValue="" style={{ width: "100%", height: "46px", padding: "0 16px", background: "white", border: "1.5px solid #E2E8F0", borderRadius: "12px", color: "#0C2830", fontSize: "15px", fontFamily: "Space Grotesk", boxSizing: "border-box", outline: "none", appearance: "none" }}>
                      <option value="" disabled>Select condition</option>
                      <option>Stroke / Hemiparesis</option>
                      <option>Phantom Limb Pain</option>
                   </select>
                   <div style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7AAAB4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                   </div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ fontSize: "14px", fontFamily: "Space Grotesk", fontWeight: "600", color: "#3A6870" }}>
                  Therapist note <span style={{ color: "#7AAAB4", fontWeight: "400" }}>(optional)</span>
                </div>
                <textarea placeholder="Initial assessment, session frequency..." style={{ width: "100%", height: "100px", padding: "12px 16px", background: "white", border: "1.5px solid #E2E8F0", borderRadius: "12px", color: "#0C2830", fontSize: "15px", fontFamily: "Space Grotesk", boxSizing: "border-box", outline: "none", resize: "none" }} />
              </div>
            </div>

            <div style={{ padding: "20px 30px", borderTop: "1px solid #E2E8F0", display: "flex", justifyContent: "flex-end", gap: "12px", background: "#F8FAFC" }}>
               <button onClick={() => setIsModalOpen(false)} style={{ padding: "10px 20px", background: "white", border: "1.5px solid #E2E8F0", borderRadius: "10px", color: "#3A6870", fontSize: "14.5px", fontFamily: "Space Grotesk", fontWeight: "600", cursor: "pointer" }}>
                  Cancel
               </button>
               <button onClick={() => setIsModalOpen(false)} style={{ padding: "10px 24px", background: "linear-gradient(135deg, #0099A6 0%, #007580 100%)", boxShadow: "0px 4px 12px rgba(0, 153, 166, 0.2)", border: "none", borderRadius: "10px", color: "white", fontSize: "14.5px", fontFamily: "Space Grotesk", fontWeight: "700", cursor: "pointer" }}>
                  Register patient
               </button>
            </div>

          </div>
        </div>
      )}

    </div>
    </>
  );
};

export default Dashboard;