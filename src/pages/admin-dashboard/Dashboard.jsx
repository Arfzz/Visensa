import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import visensaLogo from "../../assets/visensa-logo.png";
import {
  generateSchedulePreview,
  getTomorrowDateString,
} from "../../utils/scheduleCalculator";
import { useProgramScheduleStore } from "../../store/useProgramScheduleStore";
import TherapyAssignedModal from "./TherapyAssignedModal";
import AdminSidebar from "./AdminSidebar";
import AdminOverview from "./AdminOverview";
import {
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Info,
  Moon,
  Plus,
  RefreshCw,
  UserPlus,
  Sparkles,
  PlusCircle,
  Save,
  Zap,
  ShieldCheck,
  X,
  RotateCcw,
} from "lucide-react";

// ==========================================
// 1. DATA MOCK (DUMMY DATA)
// ==========================================
const initialPatients = [
  {
    id: "RJ",
    name: "Robert Johnson",
    week: "Wk 4",
    condition: "Phantom Limb Pain",
    compliance: "87%",
    sessions: 6,
    pain: "4/10",
    isNew: false,
    color: "#0099A6",
  },
  {
    id: "ML",
    name: "Margaret Lim",
    week: "Wk 2",
    condition: "Stroke Recovery",
    compliance: "55%",
    sessions: 2,
    pain: "7/10",
    isNew: false,
    color: "#D4A843",
  },
  {
    id: "AK",
    name: "Ahmad Kusuma",
    week: "Wk 7",
    condition: "Phantom Limb Pain",
    compliance: "98%",
    sessions: 14,
    pain: "3/10",
    isNew: false,
    color: "#4BA882",
  },
  {
    id: "DS",
    name: "Diana Santoso",
    week: "Wk 1",
    condition: "Stroke Recovery",
    compliance: "100%",
    sessions: 1,
    pain: "8/10",
    isNew: false,
    color: "#0099A6",
  },
  {
    id: "KM",
    name: "Kenji Morales",
    week: "Wk 4",
    condition: "Stroke / Hemiparesis",
    compliance: "Not started",
    sessions: 0,
    pain: "6/10",
    isNew: true,
    color: "#0099A6",
  },
];

const feedbackStats = [
  {
    label: "Current pain",
    val: "4/10",
    sub: "patient reported",
    color: "#D4A843",
  },
  {
    label: "Avg. pain relief",
    val: "−0.7 pts",
    sub: "per session",
    color: "#4BA882",
  },
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
  {
    id: 1,
    date: "9",
    month: "Jul",
    status: "Excellent",
    scoreColor: "#4BA882",
    statusBg: "rgba(75, 168, 130, 0.10)",
    scoreFrom: 5,
    scoreTo: 4,
    diff: "↓1 pts",
    time: "11:42",
    text: "Felt improvement in finger extension. Less tingling in phantom fingers after session.",
  },
  {
    id: 2,
    date: "8",
    month: "Jul",
    status: "Good",
    scoreColor: "#3ED8C8",
    statusBg: "rgba(62, 216, 200, 0.10)",
    scoreFrom: 6,
    scoreTo: 5,
    diff: "↓1 pts",
    time: "12:10",
    text: "Wrist rotation still uncomfortable. Finger exercises feel easier.",
  },
  {
    id: 3,
    date: "8",
    month: "Jul",
    status: "Good",
    scoreColor: "#3ED8C8",
    statusBg: "rgba(62, 216, 200, 0.10)",
    scoreFrom: 6,
    scoreTo: 5,
    diff: "↓1 pts",
    time: "12:10",
    text: "Wrist rotation still uncomfortable. Finger exercises feel easier.",
  },
];

const notificationsData = [
  {
    id: 1,
    icon: AlertTriangle,
    title: "Margaret Lim — low compliance",
    desc: "No session in 4 days. Compliance dropped to 55%. Consider reaching out.",
    time: "2h ago",
    unread: true,
    color: "#D4A843",
    bg: "rgba(212, 168, 67, 0.07)",
  },
  {
    id: 2,
    icon: CheckCircle2,
    title: "Diana Santoso — first session complete",
    desc: "Diana completed her first therapy session today (8:05 min, 8/8 exercises).",
    time: "3h ago",
    unread: true,
    color: "#4BA882",
    bg: "rgba(75, 168, 130, 0.07)",
  },
  {
    id: 3,
    icon: TrendingUp,
    title: "Ahmad Kusuma — remarkable progress",
    desc: "5 consecutive Excellent sessions. Pain reduced from 7 → 3 over 7 weeks.",
    time: "Today",
    unread: true,
    color: "#0099A6",
    bg: "rgba(0, 153, 166, 0.08)",
  },
  {
    id: 4,
    icon: Info,
    title: "Robert Johnson — weekly report ready",
    desc: "Week 4 summary is available. Average pain relief: −1.4 pts/session.",
    time: "Yesterday",
    unread: false,
    color: "#3ED8C8",
    bg: "rgba(62, 216, 200, 0.08)",
  },
];

// --- SCHEDULE & CALENDAR PREVIEW LOGIC ---
const calendarDaysHeader = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const formatYearMonthDay = (dateObj) => {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, "0");
  const d = String(dateObj.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

// ==========================================
// 2. KOMPONEN UTAMA
// ==========================================

const Dashboard = () => {
  const navigate = useNavigate();

  // ── Program & Schedule Store Integration ──
  const {
    activeProgram,
    weeklySchedule,
    extendProgram,
    reassignProgram,
    assignInitialProgram,
    checkScheduleValidity,
    setMockStatus,
  } = useProgramScheduleStore();

  const [hoveredIndex, setHoveredIndex] = useState(2);
  const [showNotif, setShowNotif] = useState(false);
  const [patientsList, setPatientsList] = useState(initialPatients);
  const [activePatient, setActivePatient] = useState(initialPatients[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("Feedback");
  const [activeView, setActiveView] = useState("overview");

  // ── Register New Patient Form States ──
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regCondition, setRegCondition] = useState("");
  const [regNotes, setRegNotes] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [regError, setRegError] = useState("");

  const handleRegisterPatientSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!regName || !regEmail || !regCondition) {
      setRegError("Harap isi nama, email, dan diagnosis pasien.");
      return;
    }

    setIsRegistering(true);
    setRegError("");

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch("http://localhost:3000/api/v1/patients/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          password: regPassword || undefined,
          condition: regCondition,
          notes: regNotes,
        }),
      });

      const result = await res.json();

      const newPatientData = {
        id: result.data?.id ? result.data.id.substring(0, 2).toUpperCase() : `P${patientsList.length + 1}`,
        name: regName,
        email: regEmail,
        week: "Wk 1",
        condition: regCondition,
        compliance: "Not started",
        sessions: 0,
        pain: "6/10",
        isNew: true,
        color: "#0099A6",
      };

      setPatientsList((prev) => [newPatientData, ...prev]);
      setActivePatient(newPatientData);
      setIsModalOpen(false);
      setRegName("");
      setRegEmail("");
      setRegPassword("");
      setRegCondition("");
      setRegNotes("");
    } catch (err) {
      console.warn("Register patient backend sync notice:", err.message);
      const newPatientData = {
        id: `P${patientsList.length + 1}`,
        name: regName,
        email: regEmail,
        week: "Wk 1",
        condition: regCondition,
        compliance: "Not started",
        sessions: 0,
        pain: "6/10",
        isNew: true,
        color: "#0099A6",
      };
      setPatientsList((prev) => [newPatientData, ...prev]);
      setActivePatient(newPatientData);
      setIsModalOpen(false);
      setRegName("");
      setRegEmail("");
      setRegPassword("");
      setRegCondition("");
      setRegNotes("");
    } finally {
      setIsRegistering(false);
    }
  };

  // ── Custom Therapy Assigned Modal State ──
  const [isAssignedModalOpen, setIsAssignedModalOpen] = useState(false);
  const [assignedModalData, setAssignedModalData] = useState(null);

  const mainContentRef = useRef(null);
  const sidebarListRef = useRef(null);
  const modalScrollRef = useRef(null);

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

  // --- SCHEDULE CONFIGURATION STATE ---
  const [planFreq, setPlanFreq] = useState(3);
  const [planInterval, setPlanInterval] = useState(1);
  const [planDuration, setPlanDuration] = useState(4);
  const [planStartDate, setPlanStartDate] = useState(getTomorrowDateString());
  const [previewDate, setPreviewDate] = useState(new Date());

  const handleFrequencyChange = (newFreq) => {
    const freqVal = Number(newFreq);
    setPlanFreq(freqVal);
    if (freqVal >= 4 && planInterval > 1) {
      setPlanInterval(1);
    }
  };

  const programSchedule = useMemo(() => {
    return generateSchedulePreview({
      startDate: planStartDate,
      frequencyPerWeek: planFreq,
      programDurationWeeks: planDuration,
    });
  }, [planStartDate, planFreq, planDuration]);

  const scheduleMap = useMemo(() => {
    const map = new Map();
    programSchedule.forEach((item) => {
      map.set(item.date, item.status);
    });
    return map;
  }, [programSchedule]);

  const handlePrevMonth = () => {
    setPreviewDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
    );
  };

  const handleNextMonth = () => {
    setPreviewDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
    );
  };

  const calendarCells = useMemo(() => {
    const year = previewDate.getFullYear();
    const month = previewDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDayIndex = (firstDayOfMonth.getDay() + 6) % 7;
    const prevMonthDays = new Date(year, month, 0).getDate();

    const cells = [];

    for (let i = startDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i;
      const dateObj = new Date(year, month - 1, dayNum);
      const dateStr = formatYearMonthDay(dateObj);
      cells.push({
        date: dayNum,
        isCurrentMonth: false,
        dateStr,
        status: scheduleMap.get(dateStr) || null,
      });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month, d);
      const dateStr = formatYearMonthDay(dateObj);
      cells.push({
        date: d,
        isCurrentMonth: true,
        dateStr,
        status: scheduleMap.get(dateStr) || null,
      });
    }

    const remainingCells = (7 - (cells.length % 7)) % 7;
    for (let d = 1; d <= remainingCells; d++) {
      const dateObj = new Date(year, month + 1, d);
      const dateStr = formatYearMonthDay(dateObj);
      cells.push({
        date: d,
        isCurrentMonth: false,
        dateStr,
        status: scheduleMap.get(dateStr) || null,
      });
    }

    return cells;
  }, [previewDate, scheduleMap]);

  // ── Helper to open Custom Therapy Assigned Modal ──
  const openSuccessModal = (program, durationWeeks, freq, rest) => {
    const totalSessions = durationWeeks * freq;
    setAssignedModalData({
      patientName: activePatient?.name || "Robert Johnson",
      frequencyPerWeek: freq,
      restIntervalDays: rest,
      programDurationWeeks: durationWeeks,
      startDate: `Tomorrow (${program.startDate})`,
      endDate: program.endDate,
      totalSessions,
    });
    setIsAssignedModalOpen(true);
  };

  const handleExtendProgramAction = () => {
    const res = extendProgram(planDuration);
    if (res.success) {
      openSuccessModal(res.program, planDuration, planFreq, planInterval);
    }
  };

  const handleReassignProgramAction = () => {
    const res = reassignProgram({
      programDurationWeeks: planDuration,
      frequencyPerWeek: planFreq,
      restIntervalDays: planInterval,
    });
    if (res.success) {
      openSuccessModal(res.program, planDuration, planFreq, planInterval);
    }
  };

  const handleAssignInitialProgramAction = () => {
    const res = assignInitialProgram({
      patientId: activePatient ? activePatient.id : "pat_new",
      programDurationWeeks: planDuration,
      frequencyPerWeek: planFreq,
      restIntervalDays: planInterval,
    });
    if (res.success) {
      if (activePatient) activePatient.isNew = false;
      openSuccessModal(res.program, planDuration, planFreq, planInterval);
    }
  };

  const handleQuickExtendSameProtocol = () => {
    const freq = weeklySchedule ? weeklySchedule.frequencyPerWeek : 3;
    const rest = weeklySchedule ? weeklySchedule.restIntervalDays : 1;
    const duration = 4;
    const res = extendProgram(duration);
    if (res.success) {
      openSuccessModal(res.program, duration, freq, rest);
    }
  };

  const handleResetForm = () => {
    setPlanFreq(3);
    setPlanInterval(1);
    setPlanDuration(4);
    setPlanStartDate(getTomorrowDateString());
  };

  const handleSavePlan = () => {
    if (activePatient?.isNew) {
      handleAssignInitialProgramAction();
    } else {
      handleReassignProgramAction();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    navigate("/");
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
      <div
        className="doctor-outer"
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          background: "#F0F2F5",
          fontFamily: "Space Grotesk, sans-serif",
          padding: "24px",
          boxSizing: "border-box",
          gap: "24px",
          position: "relative",
        }}
      >
        {/* ============================== */}
        {/* SIDEBAR (KIRI - FIXED)         */}
        {/* ============================== */}
        <AdminSidebar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          activeView={activeView}
          setActiveView={setActiveView}
          selectedPatient={activePatient}
          onSelectPatient={(patient) => {
            if (typeof patient === "string") {
              const found = patientsList.find((p) => p.id === patient);
              if (found) setActivePatient(found);
            } else {
              setActivePatient(patient);
            }
          }}
          patientsList={patientsList}
          onOpenAddPatientModal={() => setIsModalOpen(true)}
          onLogout={handleLogout}
        />

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
          style={{
            flex: 1,
            minHeight: 0,
            height: "calc(100vh - 48px)",
            overflowY: "auto",
            overscrollBehavior: "contain",
            WebkitOverflowScrolling: "touch",
            paddingRight: "16px",
            paddingBottom: "60px",
            display: "flex",
            flexDirection: "column",
            boxSizing: "border-box",
          }}
        >
          {activeView === "overview" ? (
            <AdminOverview
              patients={patientsList}
              onSelectPatient={(patient) => {
                if (typeof patient === "string") {
                  const found = patientsList.find((p) => p.id === patient);
                  if (found) setActivePatient(found);
                } else {
                  setActivePatient(patient);
                }
                setActiveView("patient");
              }}
              onAddPatient={() => setIsModalOpen(true)}
            />
          ) : (
            <>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
              marginBottom: "35px",
              marginTop: "4px",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <div>
              <div
                style={{
                  color: "#9AABB8",
                  fontSize: "15px",
                  fontWeight: "500",
                  marginBottom: "8px",
                }}
              >
                Hello, Dr. Sarah K.
              </div>
              <div
                className="doctor-header-title"
                style={{
                  color: "#1A2332",
                  fontSize: "36px",
                  fontWeight: "700",
                }}
              >
                Patient Monitoring
              </div>
            </div>

            <div style={{ position: "relative" }}>
              <div
                onClick={() => setShowNotif(!showNotif)}
                style={{
                  width: "48px",
                  height: "48px",
                  flexShrink: 0,
                  background: "white",
                  borderRadius: "16px",
                  boxShadow: "0px 2px 10px rgba(0,0,0,0.05)",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  cursor: "pointer",
                  border: showNotif
                    ? "1.5px solid #0099A6"
                    : "1.5px solid transparent",
                  transition: "all 0.2s",
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#4A5568"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                <div
                  style={{
                    width: "10px",
                    height: "10px",
                    background: "#F97316",
                    borderRadius: "50%",
                    position: "absolute",
                    top: "10px",
                    right: "12px",
                    border: "2px solid white",
                  }}
                />
              </div>

              {showNotif && (
                <div
                  className="doctor-notif-panel"
                  style={{
                    position: "absolute",
                    top: "60px",
                    right: "0",
                    width: "450px",
                    maxWidth: "90vw",
                    background: "white",
                    boxShadow: "0px 12px 50px rgba(12, 40, 48, 0.15)",
                    borderRadius: "24px",
                    border: "1.5px solid #C4E8EC",
                    zIndex: 100,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      padding: "20px 24px",
                      borderBottom: "1.5px solid #C4E8EC",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <div
                        style={{
                          color: "#0C2830",
                          fontSize: "20px",
                          fontWeight: "700",
                        }}
                      >
                        Notifications
                      </div>
                      <div
                        style={{
                          background: "#D4A843",
                          color: "white",
                          padding: "2px 10px",
                          borderRadius: "20px",
                          fontSize: "14px",
                          fontFamily: "Space Mono",
                          fontWeight: "700",
                        }}
                      >
                        3
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                      }}
                    >
                      <div
                        style={{
                          color: "#0099A6",
                          fontSize: "15px",
                          fontWeight: "600",
                          cursor: "pointer",
                        }}
                      >
                        Mark all read
                      </div>
                      <svg
                        onClick={() => setShowNotif(false)}
                        style={{ cursor: "pointer" }}
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#7AAAB4"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </div>
                  </div>

                  <div style={{ maxHeight: "450px", overflowY: "auto" }}>
                    {notificationsData.map((notif) => (
                      <div
                        key={notif.id}
                        style={{
                          padding: "20px 24px",
                          borderBottom: "1.5px solid #C4E8EC",
                          background: notif.unread
                            ? "rgba(12, 40, 48, 0.02)"
                            : "white",
                          display: "flex",
                          gap: "16px",
                        }}
                      >
                        <div
                          style={{
                            width: "40px",
                            height: "40px",
                            minWidth: "40px",
                            background: notif.bg,
                            borderRadius: "12px",
                            border: `1.5px solid ${notif.color}40`,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          {notif.icon && (
                            <notif.icon
                              size={18}
                              color={notif.color}
                              strokeWidth={2.2}
                            />
                          )}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              marginBottom: "6px",
                            }}
                          >
                            <div
                              style={{
                                color: "#0C2830",
                                fontSize: "16px",
                                fontWeight: notif.unread ? "700" : "500",
                                paddingRight: "12px",
                                lineHeight: "1.4",
                              }}
                            >
                              {notif.title}
                            </div>
                            {notif.unread && (
                              <div
                                style={{
                                  width: "10px",
                                  height: "10px",
                                  minWidth: "10px",
                                  background: "#0099A6",
                                  borderRadius: "50%",
                                  marginTop: "4px",
                                }}
                              />
                            )}
                          </div>
                          <div
                            style={{
                              color: "#7AAAB4",
                              fontSize: "14.5px",
                              lineHeight: "1.5",
                              marginBottom: "8px",
                            }}
                          >
                            {notif.desc}
                          </div>
                          <div
                            style={{
                              color: "#7AAAB4",
                              fontSize: "13px",
                              fontFamily: "Space Mono",
                            }}
                          >
                            {notif.time}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div
                    style={{
                      padding: "16px",
                      textAlign: "center",
                      color: "#7AAAB4",
                      fontSize: "14.5px",
                      fontWeight: "500",
                      background: "white",
                      cursor: "pointer",
                    }}
                  >
                    Showing all 4 notifications
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ============================== */}
          {/* PATIENT HEADER + TABS          */}
          {/* ============================== */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginBottom: "30px",
              flexWrap: "wrap",
              gap: "20px",
            }}
          >
            <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  background:
                    "linear-gradient(135deg, #0099A6 0%, #007580 100%)",
                  borderRadius: "50%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  boxShadow: "0px 4px 15px rgba(0, 153, 166, 0.2)",
                }}
              >
                <span
                  style={{
                    color: "white",
                    fontSize: "20px",
                    fontWeight: "700",
                  }}
                >
                  {activePatient.id}
                </span>
              </div>
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "8px",
                  }}
                >
                  <div
                    style={{
                      color: "#0C2830",
                      fontSize: "24px",
                      fontWeight: "700",
                    }}
                  >
                    {activePatient.name}
                  </div>
                  {activePatient.isNew ? (
                    <div
                      style={{
                        background: "rgba(0, 153, 166, 0.08)",
                        border: "1px solid rgba(0, 153, 166, 0.2)",
                        borderRadius: "20px",
                        padding: "4px 12px",
                        color: "#0099A6",
                        fontSize: "13px",
                        fontFamily: "Space Mono",
                        fontWeight: "700",
                      }}
                    >
                      New patient
                    </div>
                  ) : (
                    <div
                      style={{
                        background: "rgba(75, 168, 130, 0.1)",
                        border: "1px solid rgba(75, 168, 130, 0.2)",
                        borderRadius: "20px",
                        padding: "4px 12px",
                        color: "#4BA882",
                        fontSize: "13px",
                        fontFamily: "Space Mono",
                        fontWeight: "700",
                      }}
                    >
                      Active
                    </div>
                  )}
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "20px",
                    color: "#7AAAB4",
                    fontSize: "14.5px",
                    fontFamily: "Space Mono",
                  }}
                >
                  <span>{activePatient.condition}</span>
                  {activePatient.isNew ? (
                    <span>Not started</span>
                  ) : (
                    <span>{activePatient.week}</span>
                  )}
                  <span>
                    {activePatient.isNew
                      ? "0 sessions"
                      : `${activePatient.compliance} compliance`}
                  </span>
                  <span>Pain: {activePatient.pain}</span>
                </div>
              </div>
            </div>

            {/* TAB NAVIGASI */}
            <div
              style={{
                display: "flex",
                background: "white",
                padding: "6px",
                borderRadius: "16px",
                border: "1px solid #C4E8EC",
                boxShadow: "0px 2px 10px rgba(0,0,0,0.02)",
                opacity: activePatient.isNew ? 0.5 : 1,
                pointerEvents: activePatient.isNew ? "none" : "auto",
              }}
            >
              <button
                onClick={() => setActiveTab("Feedback")}
                style={{
                  padding: "10px 20px",
                  background:
                    activeTab === "Feedback" ? "#F0FAFB" : "transparent",
                  border:
                    activeTab === "Feedback"
                      ? "1px solid #C4E8EC"
                      : "1px solid transparent",
                  borderRadius: "12px",
                  color: activeTab === "Feedback" ? "#0099A6" : "#7AAAB4",
                  fontSize: "15px",
                  fontWeight: activeTab === "Feedback" ? "700" : "500",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "all 0.2s",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                Feedback
              </button>
              <button
                onClick={() => setActiveTab("Plan")}
                style={{
                  padding: "10px 20px",
                  background: activeTab === "Plan" ? "#F0FAFB" : "transparent",
                  border:
                    activeTab === "Plan"
                      ? "1px solid #C4E8EC"
                      : "1px solid transparent",
                  borderRadius: "12px",
                  color: activeTab === "Plan" ? "#0099A6" : "#7AAAB4",
                  fontSize: "15px",
                  fontWeight: activeTab === "Plan" ? "700" : "500",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "all 0.2s",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                Therapy Plan
              </button>
            </div>
          </div>

          {/* LOGIKA KONTEN: EMPTY STATE vs FEEDBACK vs PLAN */}
          {activePatient.isNew ? (
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                paddingBottom: "100px",
              }}
            >
              <div
                style={{
                  width: "74px",
                  height: "74px",
                  background: "rgba(0, 153, 166, 0.08)",
                  borderRadius: "21px",
                  border: "1.34px solid rgba(0, 153, 166, 0.20)",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: "18px",
                }}
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#0099A6"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                </svg>
              </div>
              <div
                style={{
                  color: "#0C2830",
                  fontSize: "21px",
                  fontFamily: "Space Grotesk",
                  fontWeight: "700",
                  marginBottom: "8px",
                }}
              >
                No sessions yet
              </div>
              <div
                style={{
                  color: "#7AAAB4",
                  fontSize: "17px",
                  fontFamily: "Space Grotesk",
                  textAlign: "center",
                  maxWidth: "380px",
                  lineHeight: "1.5",
                  marginBottom: "20px",
                }}
              >
                {activePatient.name.toLowerCase()} has been registered but
                hasn't completed their first therapy session. Share their login
                link to get started.
              </div>
              <div
                style={{
                  background: "rgba(75, 168, 130, 0.07)",
                  border: "1.34px solid rgba(75, 168, 130, 0.18)",
                  borderRadius: "13px",
                  padding: "12px 24px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  color: "#4BA882",
                  fontSize: "15px",
                  fontFamily: "Space Mono",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                Registration complete · login email sent
              </div>
            </div>
          ) : activeTab === "Feedback" ? (
            /* ============================== */
            /* TAB: FEEDBACK & PROGRESS       */
            /* ============================== */
            <div>
              <div
                className="doctor-feedback-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "24px",
                  marginBottom: "30px",
                }}
              >
                {feedbackStats.map((stat, i) => (
                  <div
                    key={i}
                    style={{
                      background: "white",
                      padding: "24px",
                      borderRadius: "20px",
                      border: "1px solid #E2E8F0",
                      boxShadow: "0 4px 15px rgba(0,0,0,0.02)",
                    }}
                  >
                    <div
                      style={{
                        color: "#7AAAB4",
                        fontSize: "13px",
                        fontFamily: "Space Mono",
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                        marginBottom: "12px",
                      }}
                    >
                      {stat.label}
                    </div>
                    <div
                      style={{
                        color: stat.color,
                        fontSize: "32px",
                        fontFamily: "Space Mono",
                        fontWeight: "700",
                        marginBottom: "4px",
                      }}
                    >
                      {stat.val}
                    </div>
                    <div style={{ color: "#7AAAB4", fontSize: "14px" }}>
                      {stat.sub}
                    </div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  background: "white",
                  padding: "24px 30px",
                  borderRadius: "20px",
                  border: "1px solid #C4E8EC",
                  marginBottom: "30px",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.02)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "20px",
                  }}
                >
                  <div>
                    <div
                      style={{
                        color: "#0C2830",
                        fontSize: "18px",
                        fontWeight: "700",
                        marginBottom: "4px",
                      }}
                    >
                      Pain score trend
                    </div>
                    <div style={{ color: "#7AAAB4", fontSize: "14px" }}>
                      Patient-reported · lower is better
                    </div>
                  </div>
                  <div
                    style={{
                      background: "rgba(75, 168, 130, 0.1)",
                      border: "1px solid rgba(75, 168, 130, 0.2)",
                      borderRadius: "20px",
                      padding: "6px 14px",
                      color: "#4BA882",
                      fontSize: "14px",
                      fontWeight: "600",
                    }}
                  >
                    ↘ 8.5 → 4
                  </div>
                </div>
                <div
                  style={{
                    position: "relative",
                    height: "170px",
                    width: "100%",
                    borderBottom: "1px solid #E2E8F0",
                  }}
                >
                  <svg
                    viewBox="0 0 1000 120"
                    preserveAspectRatio="none"
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "120px",
                    }}
                  >
                    <defs>
                      <linearGradient
                        id="chartGradient"
                        x1="0"
                        x2="0"
                        y1="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="rgba(0, 153, 166, 0.15)" />
                        <stop offset="100%" stopColor="rgba(0, 153, 166, 0)" />
                      </linearGradient>
                    </defs>
                    <polygon
                      points="0,120 0,20 250,25 500,35 750,45 1000,55 1000,120"
                      fill="url(#chartGradient)"
                    />
                    <polyline
                      points="0,20 250,25 500,35 750,45 1000,55"
                      fill="none"
                      stroke="#0099A6"
                      strokeWidth="3"
                    />
                    {chartPoints.map((pt, i) => (
                      <circle
                        key={i}
                        cx={pt.x}
                        cy={pt.y}
                        r={hoveredIndex === i ? 8 : 6}
                        fill="#0099A6"
                        stroke="white"
                        strokeWidth="3"
                        style={{ transition: "all 0.2s ease" }}
                      />
                    ))}
                  </svg>
                  <div
                    style={{
                      position: "absolute",
                      left: `${(hoveredIndex / 4) * 100}%`,
                      top: 0,
                      height: "120px",
                      width: "1px",
                      background: "#C4E8EC",
                      zIndex: 1,
                      transition: "left 0.3s ease",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      left: `${(hoveredIndex / 4) * 100}%`,
                      top: `${chartPoints[hoveredIndex].y - 20}px`,
                      transform: "translate(-50%, -100%)",
                      background: "white",
                      border: "1px solid #C4E8EC",
                      boxShadow: "0 6px 20px rgba(0, 153, 166, 0.15)",
                      padding: "10px 16px",
                      borderRadius: "12px",
                      zIndex: 2,
                      transition: "all 0.3s ease",
                      pointerEvents: "none",
                    }}
                  >
                    <div
                      style={{
                        color: "#7AAAB4",
                        fontSize: "12px",
                        fontFamily: "Space Mono",
                        marginBottom: "2px",
                        textAlign: "center",
                      }}
                    >
                      {chartPoints[hoveredIndex].date}
                    </div>
                    <div
                      style={{
                        color: "#0099A6",
                        fontSize: "20px",
                        fontFamily: "Space Mono",
                        fontWeight: "700",
                        textAlign: "center",
                      }}
                    >
                      {chartPoints[hoveredIndex].score}
                      <span
                        style={{
                          color: "#7AAAB4",
                          fontSize: "14px",
                          fontWeight: "400",
                        }}
                      >
                        /10
                      </span>
                    </div>
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      zIndex: 10,
                    }}
                  >
                    {chartPoints.map((pt, i) => (
                      <div
                        key={i}
                        onMouseEnter={() => setHoveredIndex(i)}
                        style={{ flex: 1, cursor: "pointer" }}
                      />
                    ))}
                  </div>
                  <div
                    style={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "space-between",
                      color: "#7AAAB4",
                      fontSize: "12px",
                      fontFamily: "Space Mono",
                      position: "absolute",
                      bottom: "10px",
                    }}
                  >
                    {chartPoints.map((pt, i) => (
                      <span
                        key={i}
                        style={{
                          fontWeight: hoveredIndex === i ? "700" : "400",
                          color: hoveredIndex === i ? "#0099A6" : "#7AAAB4",
                          transition: "color 0.2s ease",
                        }}
                      >
                        {pt.date}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div
                style={{
                  background: "white",
                  borderRadius: "20px",
                  border: "1px solid #C4E8EC",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.02)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "24px 30px",
                    borderBottom: "1px solid #E2E8F0",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      color: "#0C2830",
                      fontSize: "18px",
                      fontWeight: "700",
                    }}
                  >
                    Session feedback log
                  </div>
                  <div
                    style={{
                      color: "#7AAAB4",
                      fontSize: "14px",
                      fontFamily: "Space Mono",
                    }}
                  >
                    6 sessions
                  </div>
                </div>
                <div>
                  {feedbackLogs.map((log) => (
                    <div
                      key={log.id}
                      style={{
                        padding: "24px 30px",
                        borderBottom: "1px solid #E2E8F0",
                        display: "flex",
                        gap: "20px",
                      }}
                    >
                      <div
                        style={{
                          background: "#F0FAFB",
                          border: "1px solid #C4E8EC",
                          borderRadius: "12px",
                          padding: "10px 14px",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          minWidth: "60px",
                          maxHeight: "60px",
                          justifyContent: "center",
                        }}
                      >
                        <span
                          style={{
                            color: "#0C2830",
                            fontSize: "20px",
                            fontFamily: "Space Mono",
                            fontWeight: "700",
                            lineHeight: "1",
                          }}
                        >
                          {log.date}
                        </span>
                        <span
                          style={{
                            color: "#7AAAB4",
                            fontSize: "12px",
                            fontFamily: "Space Mono",
                            marginTop: "4px",
                          }}
                        >
                          {log.month}
                        </span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "12px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "12px",
                            }}
                          >
                            <span
                              style={{
                                background: log.statusBg,
                                color: log.scoreColor,
                                padding: "4px 12px",
                                borderRadius: "20px",
                                fontSize: "13px",
                                fontFamily: "Space Mono",
                                fontWeight: "700",
                              }}
                            >
                              {log.status}
                            </span>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                fontFamily: "Space Mono",
                                fontSize: "15px",
                                fontWeight: "700",
                              }}
                            >
                              <span style={{ color: "#D4A843" }}>
                                {log.scoreFrom}
                              </span>
                              <span
                                style={{
                                  color: "#7AAAB4",
                                  fontSize: "13px",
                                  fontWeight: "400",
                                }}
                              >
                                →
                              </span>
                              <span style={{ color: "#D4A843" }}>
                                {log.scoreTo}
                              </span>
                              <span
                                style={{
                                  color: "#4BA882",
                                  fontSize: "13px",
                                  fontWeight: "400",
                                  marginLeft: "4px",
                                }}
                              >
                                {log.diff}
                              </span>
                            </div>
                          </div>
                          <div
                            style={{
                              color: "#7AAAB4",
                              fontSize: "13px",
                              fontFamily: "Space Mono",
                            }}
                          >
                            {log.time}
                          </div>
                        </div>
                        <div
                          style={{
                            background: "#F0FAFB",
                            border: "1px solid rgba(0, 153, 166, 0.1)",
                            borderRadius: "12px",
                            padding: "14px 20px",
                            display: "flex",
                            gap: "10px",
                            alignItems: "flex-start",
                          }}
                        >
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#0099A6"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{ marginTop: "2px" }}
                          >
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                          </svg>
                          <span
                            style={{
                              color: "#3A6870",
                              fontSize: "15.5px",
                              lineHeight: "1.5",
                            }}
                          >
                            {log.text}
                          </span>
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
            <div
              style={{ display: "flex", flexDirection: "column", gap: "24px" }}
            >
              {/* NEW PATIENT / UNASSIGNED INFO BANNER */}
              {activePatient?.isNew && (
                <div
                  style={{
                    background:
                      "linear-gradient(135deg, #0C2830 0%, #004D53 100%)",
                    borderRadius: "18px",
                    padding: "20px 24px",
                    color: "white",
                    border: "1.5px solid #0099A6",
                    boxShadow: "0 6px 20px rgba(0, 153, 166, 0.15)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "16px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                    }}
                  >
                    <div
                      style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "12px",
                        background: "rgba(0, 153, 166, 0.2)",
                        border: "1px solid #0099A6",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        flexShrink: 0,
                      }}
                    >
                      <UserPlus size={22} color="#3ED8C8" />
                    </div>
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          marginBottom: "4px",
                        }}
                      >
                        <span style={{ fontSize: "17px", fontWeight: "700" }}>
                          {activePatient.name} — New Patient
                        </span>
                        <span
                          style={{
                            background: "rgba(62, 216, 200, 0.2)",
                            color: "#3ED8C8",
                            padding: "2px 8px",
                            borderRadius: "12px",
                            fontSize: "11px",
                            fontFamily: "Space Mono",
                            fontWeight: "700",
                          }}
                        >
                          Needs Initial Program
                        </span>
                      </div>
                      <div style={{ fontSize: "13.5px", color: "#A2C3CA" }}>
                        Patient was registered today and has no active therapy
                        schedule. Configure parameters below and click{" "}
                        <strong>+ Assign Initial Program</strong> to start on
                        D+1.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SMART SHORTCUT CARD FOR COMPLETED PROGRAM RENEWAL */}
              {activeProgram?.status === "Completed / Review Required" && !activePatient?.isNew && (
                <div
                  style={{
                    background: "rgba(62, 216, 200, 0.08)",
                    border: "1.5px solid #3ED8C8",
                    borderRadius: "18px",
                    padding: "20px 24px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "16px",
                    boxShadow: "0 4px 14px rgba(0, 153, 166, 0.08)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "12px",
                        background: "rgba(0, 153, 166, 0.12)",
                        border: "1px solid #3ED8C8",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        flexShrink: 0,
                      }}
                    >
                      <CheckCircle2 size={24} color="#0099A6" strokeWidth={2.2} />
                    </div>
                    <div>
                      <div
                        style={{
                          color: "#0099A6",
                          fontSize: "12px",
                          fontFamily: "Space Mono, monospace",
                          fontWeight: "700",
                          letterSpacing: "1px",
                          textTransform: "uppercase",
                          marginBottom: "3px",
                        }}
                      >
                        PHASE COMPLETED — OPTIMAL PROGRESS
                      </div>
                      <div
                        style={{
                          color: "#0C2830",
                          fontSize: "15px",
                          fontFamily: "Space Grotesk, sans-serif",
                          fontWeight: "700",
                        }}
                      >
                        12/12 Sessions Finished • Latest Pain Level: 4/10 (↓4.5 pts improvement)
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleQuickExtendSameProtocol}
                    style={{
                      padding: "12px 20px",
                      background: "linear-gradient(135deg, #0099A6 0%, #007580 100%)",
                      boxShadow: "0 4px 14px rgba(0, 153, 166, 0.25)",
                      borderRadius: "12px",
                      border: "none",
                      color: "white",
                      fontSize: "14px",
                      fontFamily: "Space Grotesk, sans-serif",
                      fontWeight: "700",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                  >
                    <Zap size={17} color="white" fill="white" />
                    <span>Quick Extend Same Protocol (4 Weeks)</span>
                  </button>
                </div>
              )}

              {/* Card 1: Schedule Configuration (4 Compact Inputs + Integrated Calendar Preview) */}
              <div
                style={{
                  background: "white",
                  padding: "30px",
                  borderRadius: "20px",
                  border: "1px solid #C4E8EC",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.02)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "24px",
                  }}
                >
                  <div>
                    <div
                      style={{
                        color: "#0C2830",
                        fontSize: "18px",
                        fontWeight: "700",
                      }}
                    >
                      Schedule Configuration
                    </div>
                    <div
                      style={{
                        color: "#7AAAB4",
                        fontSize: "13.5px",
                        fontFamily: "Space Grotesk",
                        marginTop: "2px",
                      }}
                    >
                      Automated protocol scheduling with anti-collision
                      validation
                    </div>
                  </div>
                  <div
                    style={{
                      background: "rgba(0, 153, 166, 0.08)",
                      border: "1px solid rgba(0, 153, 166, 0.2)",
                      borderRadius: "20px",
                      padding: "4px 14px",
                      color: "#0099A6",
                      fontSize: "13px",
                      fontFamily: "Space Mono",
                      fontWeight: "700",
                    }}
                  >
                    Fixed 8-Exercise Protocol
                  </div>
                </div>

                {/* 4 COMPACT INPUTS GRID */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "20px",
                    marginBottom: "30px",
                  }}
                >
                  {/* 1. Frequency per Week */}
                  <div>
                    <div
                      style={{
                        fontSize: "14px",
                        fontFamily: "Space Grotesk",
                        fontWeight: "600",
                        color: "#3A6870",
                        marginBottom: "8px",
                      }}
                    >
                      Frequency per week
                    </div>
                    <div style={{ position: "relative" }}>
                      <select
                        value={planFreq}
                        onChange={(e) => handleFrequencyChange(e.target.value)}
                        style={{
                          width: "100%",
                          height: "46px",
                          padding: "0 16px",
                          background: "#F8FAFC",
                          border: "1.5px solid #E2E8F0",
                          borderRadius: "12px",
                          color: "#0C2830",
                          fontSize: "14.5px",
                          fontFamily: "Space Grotesk",
                          outline: "none",
                          appearance: "none",
                          cursor: "pointer",
                        }}
                      >
                        <option value={1}>1x a week</option>
                        <option value={2}>2x a week</option>
                        <option value={3}>3x a week</option>
                        <option value={4}>4x a week</option>
                        <option value={5}>5x a week</option>
                        <option value={6}>6x a week</option>
                        <option value={7}>7x a week (Every day)</option>
                      </select>
                      <div
                        style={{
                          position: "absolute",
                          right: "16px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          pointerEvents: "none",
                        }}
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#7AAAB4"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* 2. Rest Interval (Smart Constrained) */}
                  <div>
                    <div
                      style={{
                        fontSize: "14px",
                        fontFamily: "Space Grotesk",
                        fontWeight: "600",
                        color: "#3A6870",
                        marginBottom: "8px",
                      }}
                    >
                      Rest interval
                    </div>
                    <div style={{ position: "relative" }}>
                      <select
                        value={planInterval}
                        onChange={(e) =>
                          setPlanInterval(Number(e.target.value))
                        }
                        style={{
                          width: "100%",
                          height: "46px",
                          padding: "0 16px",
                          background: "#F8FAFC",
                          border: "1.5px solid #E2E8F0",
                          borderRadius: "12px",
                          color: "#0C2830",
                          fontSize: "14.5px",
                          fontFamily: "Space Grotesk",
                          outline: "none",
                          appearance: "none",
                          cursor: "pointer",
                        }}
                      >
                        <option value={0}>No rest (0 days)</option>
                        <option value={1}>1 day rest</option>
                        <option value={2} disabled={planFreq >= 4}>
                          2 days rest{" "}
                          {planFreq >= 4 ? "(Disabled: ≥4x/wk)" : ""}
                        </option>
                        <option value={3} disabled={planFreq >= 4}>
                          3 days rest{" "}
                          {planFreq >= 4 ? "(Disabled: ≥4x/wk)" : ""}
                        </option>
                      </select>
                      <div
                        style={{
                          position: "absolute",
                          right: "16px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          pointerEvents: "none",
                        }}
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#7AAAB4"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </div>
                    </div>
                    {planFreq >= 4 && (
                      <div
                        style={{
                          color: "#C0574C",
                          fontSize: "12px",
                          fontFamily: "Space Grotesk",
                          marginTop: "4px",
                        }}
                      >
                        Rest ≥2 days restricted for high frequency
                      </div>
                    )}
                  </div>

                  {/* 3. Program Duration */}
                  <div>
                    <div
                      style={{
                        fontSize: "14px",
                        fontFamily: "Space Grotesk",
                        fontWeight: "600",
                        color: "#3A6870",
                        marginBottom: "8px",
                      }}
                    >
                      Program duration
                    </div>
                    <div style={{ position: "relative" }}>
                      <select
                        value={planDuration}
                        onChange={(e) =>
                          setPlanDuration(Number(e.target.value))
                        }
                        style={{
                          width: "100%",
                          height: "46px",
                          padding: "0 16px",
                          background: "#F8FAFC",
                          border: "1.5px solid #E2E8F0",
                          borderRadius: "12px",
                          color: "#0C2830",
                          fontSize: "14.5px",
                          fontFamily: "Space Grotesk",
                          outline: "none",
                          appearance: "none",
                          cursor: "pointer",
                        }}
                      >
                        <option value={1}>1 Week</option>
                        <option value={2}>2 Weeks</option>
                        <option value={4}>4 Weeks (1 Month)</option>
                        <option value={8}>8 Weeks (2 Months)</option>
                        <option value={12}>12 Weeks (3 Months)</option>
                      </select>
                      <div
                        style={{
                          position: "absolute",
                          right: "16px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          pointerEvents: "none",
                        }}
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#7AAAB4"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </div>
                    </div>
                    <div
                      style={{
                        color: "#0099A6",
                        fontSize: "12px",
                        fontFamily: "Space Mono",
                        fontWeight: "600",
                        marginTop: "4px",
                      }}
                    >
                      Estimated Total: {planFreq * planDuration} sessions
                    </div>
                  </div>

                  {/* 4. Start Date */}
                  <div>
                    <div
                      style={{
                        fontSize: "14px",
                        fontFamily: "Space Grotesk",
                        fontWeight: "600",
                        color: "#3A6870",
                        marginBottom: "8px",
                      }}
                    >
                      Start date
                    </div>
                    <input
                      type="date"
                      value={planStartDate}
                      onChange={(e) => setPlanStartDate(e.target.value)}
                      style={{
                        width: "100%",
                        height: "46px",
                        padding: "0 16px",
                        background: "#F8FAFC",
                        border: "1.5px solid #E2E8F0",
                        borderRadius: "12px",
                        color: "#0C2830",
                        fontSize: "14.5px",
                        fontFamily: "Space Grotesk",
                        outline: "none",
                        boxSizing: "border-box",
                        cursor: "pointer",
                      }}
                    />
                  </div>
                </div>

                {/* INTEGRATED PATIENT CALENDAR PREVIEW */}
                <div
                  style={{
                    background: "#F8FAFC",
                    borderRadius: "16px",
                    border: "1px solid #E2E8F0",
                    padding: "20px",
                    marginTop: "10px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "16px",
                      flexWrap: "wrap",
                      gap: "10px",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          color: "#0C2830",
                          fontSize: "16px",
                          fontFamily: "Space Grotesk",
                          fontWeight: "700",
                        }}
                      >
                        Integrated Patient Calendar Preview
                      </div>
                      <div
                        style={{
                          color: "#7AAAB4",
                          fontSize: "13px",
                          fontFamily: "Space Grotesk",
                        }}
                      >
                        Reactive schedule projection for {activePatient.name}
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <span
                        style={{
                          color: "#0C2830",
                          fontSize: "15px",
                          fontFamily: "Space Grotesk",
                          fontWeight: "700",
                        }}
                      >
                        {previewDate.toLocaleString("default", {
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          onClick={handlePrevMonth}
                          style={{
                            width: "32px",
                            height: "32px",
                            background: "white",
                            border: "1px solid #E2E8F0",
                            borderRadius: "8px",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            cursor: "pointer",
                            color: "#3A6870",
                            fontWeight: "700",
                          }}
                        >
                          ‹
                        </button>
                        <button
                          onClick={handleNextMonth}
                          style={{
                            width: "32px",
                            height: "32px",
                            background: "white",
                            border: "1px solid #E2E8F0",
                            borderRadius: "8px",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            cursor: "pointer",
                            color: "#3A6870",
                            fontWeight: "700",
                          }}
                        >
                          ›
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* CALENDAR GRID */}
                  <div
                    style={{
                      background: "#E2E8F0",
                      border: "1px solid #E2E8F0",
                      borderRadius: "14px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(7, 1fr)",
                        background: "white",
                        borderBottom: "1px solid #E2E8F0",
                      }}
                    >
                      {calendarDaysHeader.map((day, i) => (
                        <div
                          key={i}
                          style={{
                            padding: "12px 0",
                            textAlign: "center",
                            color: "#7AAAB4",
                            fontSize: "12px",
                            fontFamily: "Space Grotesk",
                            fontWeight: "700",
                            textTransform: "uppercase",
                          }}
                        >
                          {day}
                        </div>
                      ))}
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(7, 1fr)",
                        gap: "1px",
                        background: "#E2E8F0",
                      }}
                    >
                      {calendarCells.map((cell, idx) => {
                        const isExercise = cell.status === "exercise";
                        const isRest = cell.status === "rest";

                        return (
                          <div
                            key={idx}
                            style={{
                              background: cell.isCurrentMonth
                                ? "white"
                                : "#F8FAFC",
                              minHeight: "82px",
                              padding: "8px",
                              display: "flex",
                              flexDirection: "column",
                              boxSizing: "border-box",
                              opacity: cell.isCurrentMonth ? 1 : 0.45,
                            }}
                          >
                            <div
                              style={{
                                alignSelf: "flex-end",
                                color: cell.isCurrentMonth
                                  ? "#0C2830"
                                  : "#94A3B8",
                                fontSize: "13px",
                                fontFamily: "Space Grotesk",
                                fontWeight: "600",
                              }}
                            >
                              {cell.date}
                            </div>

                            <div style={{ marginTop: "auto" }}>
                              {isExercise && (
                                <div
                                  style={{
                                    background: "rgba(0, 153, 166, 0.12)",
                                    border: "1px solid rgba(0, 153, 166, 0.25)",
                                    color: "#0099A6",
                                    padding: "3px 6px",
                                    borderRadius: "6px",
                                    fontSize: "10.5px",
                                    fontFamily: "Space Grotesk",
                                    fontWeight: "700",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "4px",
                                    width: "100%",
                                    boxSizing: "border-box",
                                  }}
                                >
                                  <CheckCircle2
                                    size={11}
                                    color="#0099A6"
                                    strokeWidth={2.5}
                                  />{" "}
                                  Exercise Day
                                </div>
                              )}
                              {isRest && (
                                <div
                                  style={{
                                    background: "rgba(122, 170, 180, 0.10)",
                                    border:
                                      "1px solid rgba(122, 170, 180, 0.20)",
                                    color: "#7AAAB4",
                                    padding: "3px 6px",
                                    borderRadius: "6px",
                                    fontSize: "10.5px",
                                    fontFamily: "Space Grotesk",
                                    fontWeight: "600",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "4px",
                                    width: "100%",
                                    boxSizing: "border-box",
                                  }}
                                >
                                  <Moon
                                    size={11}
                                    color="#7AAAB4"
                                    strokeWidth={2}
                                  />{" "}
                                  Rest Day
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* FIXED PROTOCOL LEGEND */}
                  <div
                    style={{
                      marginTop: "16px",
                      padding: "12px 16px",
                      background: "white",
                      borderRadius: "12px",
                      border: "1px solid #E2E8F0",
                      color: "#3A6870",
                      fontSize: "13px",
                      fontFamily: "Space Grotesk",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span
                      style={{
                        color: "#0099A6",
                        fontWeight: "700",
                        fontSize: "16px",
                      }}
                    >
                      •
                    </span>
                    <span>
                      All scheduled exercise days automatically include
                      Visensa's Fixed 8-Exercise Motor Protocol.
                    </span>
                  </div>
                </div>
              </div>

              {/* Save & Evaluation Action Buttons */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "12px",
                  marginTop: "20px",
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <button
                  onClick={handleResetForm}
                  style={{
                    padding: "14px 24px",
                    background: "transparent",
                    border: "1.5px solid #CBD5E1",
                    borderRadius: "14px",
                    color: "#64748B",
                    fontSize: "15px",
                    fontFamily: "Space Grotesk, sans-serif",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  Cancel
                </button>

                <button
                  onClick={handleSavePlan}
                  style={{
                    padding: "14px 32px",
                    background: "linear-gradient(135deg, #0099A6 0%, #007580 100%)",
                    boxShadow: "0px 4px 18px rgba(0, 153, 166, 0.3)",
                    border: "none",
                    borderRadius: "14px",
                    color: "white",
                    fontSize: "15px",
                    fontFamily: "Space Grotesk, sans-serif",
                    fontWeight: "700",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <Save size={18} color="white" strokeWidth={2.5} />
                  <span>Save & Assign Protocol</span>
                </button>
              </div>
            </div>
          )}
            </>
          )}
        </div>

        {/* ============================== */}
        {/* MODAL: REGISTER NEW PATIENT    */}
        {/* ============================== */}
        {isModalOpen && (
          <div
            onWheel={(e) => {
              if (modalScrollRef.current) {
                modalScrollRef.current.scrollTop += e.deltaY;
              }
            }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              background: "rgba(12, 40, 48, 0.4)",
              zIndex: 9999,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              backdropFilter: "blur(4px)",
            }}
          >
            <div
              ref={modalScrollRef}
              className="hide-scroll"
              onWheel={(e) => {
                e.stopPropagation();
                if (modalScrollRef.current) {
                  modalScrollRef.current.scrollTop += e.deltaY;
                }
              }}
              style={{
                width: "100%",
                maxWidth: "540px",
                maxHeight: "85vh",
                overflowY: "auto",
                overscrollBehavior: "contain",
                background: "white",
                borderRadius: "24px",
                boxShadow: "0px 20px 60px rgba(12, 40, 48, 0.15)",
                border: "1px solid #C4E8EC",
                display: "flex",
                flexDirection: "column",
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  padding: "24px 30px",
                  borderBottom: "1px solid #E2E8F0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "16px" }}
                >
                  <div
                    style={{
                      width: "42px",
                      height: "42px",
                      background:
                        "linear-gradient(135deg, #0099A6 0%, #007580 100%)",
                      borderRadius: "12px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="8.5" cy="7" r="4"></circle>
                      <line x1="20" y1="8" x2="20" y2="14"></line>
                      <line x1="23" y1="11" x2="17" y2="11"></line>
                    </svg>
                  </div>
                  <div>
                    <div
                      style={{
                        color: "#0C2830",
                        fontSize: "18px",
                        fontFamily: "Space Grotesk",
                        fontWeight: "700",
                      }}
                    >
                      Register new patient
                    </div>
                    <div
                      style={{
                        color: "#7AAAB4",
                        fontSize: "13px",
                        fontFamily: "Space Grotesk",
                      }}
                    >
                      Patient will receive login credentials via email
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setIsModalOpen(false)}
                  style={{ cursor: "pointer", padding: "4px" }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#7AAAB4"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </div>
              </div>

              <div
                style={{
                  padding: "24px 30px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "14px",
                      fontFamily: "Space Grotesk",
                      fontWeight: "600",
                      color: "#3A6870",
                    }}
                  >
                    Full name <span style={{ color: "#C0574C" }}>*</span>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Budi Santoso"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    style={{
                      width: "100%",
                      height: "46px",
                      padding: "0 16px",
                      background: "white",
                      border: "1.5px solid #E2E8F0",
                      borderRadius: "12px",
                      color: "#0C2830",
                      fontSize: "15px",
                      fontFamily: "Space Grotesk",
                      boxSizing: "border-box",
                      outline: "none",
                    }}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "14px",
                      fontFamily: "Space Grotesk",
                      fontWeight: "600",
                      color: "#3A6870",
                    }}
                  >
                    Email address <span style={{ color: "#C0574C" }}>*</span>
                  </div>
                  <input
                    type="email"
                    placeholder="e.g. budi@email.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    style={{
                      width: "100%",
                      height: "46px",
                      padding: "0 16px",
                      background: "white",
                      border: "1.5px solid #E2E8F0",
                      borderRadius: "12px",
                      color: "#0C2830",
                      fontSize: "15px",
                      fontFamily: "Space Grotesk",
                      boxSizing: "border-box",
                      outline: "none",
                    }}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "14px",
                      fontFamily: "Space Grotesk",
                      fontWeight: "600",
                      color: "#3A6870",
                    }}
                  >
                    Password <span style={{ color: "#7AAAB4", fontWeight: "400" }}>(optional)</span>
                  </div>
                  <input
                    type="password"
                    placeholder="Create a temporary password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    style={{
                      width: "100%",
                      height: "46px",
                      padding: "0 16px",
                      background: "white",
                      border: "1.5px solid #E2E8F0",
                      borderRadius: "12px",
                      color: "#0C2830",
                      fontSize: "15px",
                      fontFamily: "Space Grotesk",
                      boxSizing: "border-box",
                      outline: "none",
                    }}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "14px",
                      fontFamily: "Space Grotesk",
                      fontWeight: "600",
                      color: "#3A6870",
                    }}
                  >
                    Diagnosis / condition{" "}
                    <span style={{ color: "#C0574C" }}>*</span>
                  </div>
                  <div style={{ position: "relative" }}>
                    <select
                      value={regCondition}
                      onChange={(e) => setRegCondition(e.target.value)}
                      style={{
                        width: "100%",
                        height: "46px",
                        padding: "0 16px",
                        background: "white",
                        border: "1.5px solid #E2E8F0",
                        borderRadius: "12px",
                        color: "#0C2830",
                        fontSize: "15px",
                        fontFamily: "Space Grotesk",
                        boxSizing: "border-box",
                        outline: "none",
                        appearance: "none",
                      }}
                    >
                      <option value="" disabled>
                        Select condition
                      </option>
                      <option value="Stroke / Hemiparesis">Stroke / Hemiparesis</option>
                      <option value="Phantom Limb Pain">Phantom Limb Pain</option>
                      <option value="Stroke Recovery">Stroke Recovery</option>
                    </select>
                    <div
                      style={{
                        position: "absolute",
                        right: "16px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        pointerEvents: "none",
                      }}
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#7AAAB4"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "14px",
                      fontFamily: "Space Grotesk",
                      fontWeight: "600",
                      color: "#3A6870",
                    }}
                  >
                    Therapist note{" "}
                    <span style={{ color: "#7AAAB4", fontWeight: "400" }}>
                      (optional)
                    </span>
                  </div>
                  <textarea
                    placeholder="Initial assessment, session frequency..."
                    value={regNotes}
                    onChange={(e) => setRegNotes(e.target.value)}
                    style={{
                      width: "100%",
                      height: "100px",
                      padding: "12px 16px",
                      background: "white",
                      border: "1.5px solid #E2E8F0",
                      borderRadius: "12px",
                      color: "#0C2830",
                      fontSize: "15px",
                      fontFamily: "Space Grotesk",
                      boxSizing: "border-box",
                      outline: "none",
                      resize: "none",
                    }}
                  />
                </div>

                {regError && (
                  <div style={{ color: "#C0574C", fontSize: "13.5px", fontFamily: "Space Grotesk", fontWeight: "600" }}>
                    {regError}
                  </div>
                )}
              </div>

              <div
                style={{
                  padding: "20px 30px",
                  borderTop: "1px solid #E2E8F0",
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "12px",
                  background: "#F8FAFC",
                }}
              >
                <button
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: "10px 20px",
                    background: "white",
                    border: "1.5px solid #E2E8F0",
                    borderRadius: "10px",
                    color: "#3A6870",
                    fontSize: "14.5px",
                    fontFamily: "Space Grotesk",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleRegisterPatientSubmit}
                  disabled={isRegistering}
                  style={{
                    padding: "10px 24px",
                    background:
                      "linear-gradient(135deg, #0099A6 0%, #007580 100%)",
                    boxShadow: "0px 4px 12px rgba(0, 153, 166, 0.2)",
                    border: "none",
                    borderRadius: "10px",
                    color: "white",
                    fontSize: "14.5px",
                    fontFamily: "Space Grotesk",
                    fontWeight: "700",
                    cursor: isRegistering ? "not-allowed" : "pointer",
                    opacity: isRegistering ? 0.7 : 1,
                  }}
                >
                  {isRegistering ? "Registering..." : "Register patient"}
                </button>
              </div>
            </div>
          </div>
        )}
        {/* CUSTOM CLINICAL SUCCESS POP-UP MODAL */}
        <TherapyAssignedModal
          isOpen={isAssignedModalOpen}
          onClose={() => setIsAssignedModalOpen(false)}
          assignedData={assignedModalData}
        />
      </div>
    </>
  );
};

export default Dashboard;
