import { useState } from "react";
import { useNavigate } from "react-router-dom";
import visensaLogo from "../../assets/visensa-logo.png";

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

const movementStats = [
  {
    label: "Joint accuracy",
    val: "97%",
    sub: "latest session",
    color: "#3ED8C8",
  },
  {
    label: "Avg range score",
    val: "82%",
    sub: "exercises done",
    color: "#0099A6",
  },
  { label: "Completion", val: "8/8", sub: "exercises", color: "#4BA882" },
];

const dateTabs = ["Latest", "8 Jul", "7 Jul", "5 Jul", "3 Jul", "2 Jul"];

const exercisesData = [
  {
    name: "Open & close — gentle",
    reps: "10 reps",
    percent: 92,
    status: "Excellent",
    color: "#4BA882",
    bg: "rgba(75, 168, 130, 0.09)",
    stroke: "#4BA882",
    statusBg: "rgba(75, 168, 130, 0.10)",
  },
  {
    name: "Wrist flexion/extension",
    reps: "11 reps",
    percent: 89,
    status: "Excellent",
    color: "#4BA882",
    bg: "rgba(75, 168, 130, 0.09)",
    stroke: "#4BA882",
    statusBg: "rgba(75, 168, 130, 0.10)",
  },
  {
    name: "Pinch grip — coin",
    reps: "12 reps",
    percent: 75,
    status: "Good",
    color: "#3ED8C8",
    bg: "rgba(62, 216, 200, 0.09)",
    stroke: "#3ED8C8",
    statusBg: "rgba(62, 216, 200, 0.10)",
  },
  {
    name: "Wrist deviation — floating",
    reps: "13 reps",
    percent: 71,
    status: "Good",
    color: "#3ED8C8",
    bg: "rgba(62, 216, 200, 0.09)",
    stroke: "#3ED8C8",
    statusBg: "rgba(62, 216, 200, 0.10)",
  },
  {
    name: "Finger tap sequence",
    reps: "10 reps",
    percent: 88,
    status: "Excellent",
    color: "#4BA882",
    bg: "rgba(75, 168, 130, 0.09)",
    stroke: "#4BA882",
    statusBg: "rgba(75, 168, 130, 0.10)",
  },
  {
    name: "Static open hold",
    reps: "11 reps",
    percent: 78,
    status: "Good",
    color: "#3ED8C8",
    bg: "rgba(62, 216, 200, 0.09)",
    stroke: "#3ED8C8",
    statusBg: "rgba(62, 216, 200, 0.10)",
  },
  {
    name: "Single finger lift",
    reps: "12 reps",
    percent: 84,
    status: "Good",
    color: "#3ED8C8",
    bg: "rgba(62, 216, 200, 0.09)",
    stroke: "#3ED8C8",
    statusBg: "rgba(62, 216, 200, 0.10)",
  },
  {
    name: "Fist hold",
    reps: "13 reps",
    percent: 91,
    status: "Excellent",
    color: "#4BA882",
    bg: "rgba(75, 168, 130, 0.09)",
    stroke: "#4BA882",
    statusBg: "rgba(75, 168, 130, 0.10)",
  },
];

const notificationsData = [
  {
    id: 1,
    icon: "⚠️",
    title: "Margaret Lim — low compliance",
    desc: "No session in 4 days. Compliance dropped to 55%. Consider reaching out.",
    time: "2h ago",
    unread: true,
    color: "#D4A843",
    bg: "rgba(212, 168, 67, 0.07)",
  },
  {
    id: 2,
    icon: "✅",
    title: "Diana Santoso — first session complete",
    desc: "Diana completed her first therapy session today (8:05 min, 8/8 exercises).",
    time: "3h ago",
    unread: true,
    color: "#4BA882",
    bg: "rgba(75, 168, 130, 0.07)",
  },
  {
    id: 3,
    icon: "📈",
    title: "Ahmad Kusuma — remarkable progress",
    desc: "5 consecutive Excellent sessions. Pain reduced from 7 → 3 over 7 weeks.",
    time: "Today",
    unread: true,
    color: "#0099A6",
    bg: "rgba(0, 153, 166, 0.08)",
  },
  {
    id: 4,
    icon: "ⓘ",
    title: "Robert Johnson — weekly report ready",
    desc: "Week 4 summary is available. Average pain relief: −1.4 pts/session.",
    time: "Yesterday",
    unread: false,
    color: "#3ED8C8",
    bg: "rgba(62, 216, 200, 0.08)",
  },
];

// ==========================================
// 2. KOMPONEN UTAMA
// ==========================================

const Dashboard = () => {
  const navigate = useNavigate();

  // States
  const [activeTab, setActiveTab] = useState("Feedback");
  const [hoveredIndex, setHoveredIndex] = useState(2);
  const [showNotif, setShowNotif] = useState(false);

  // State untuk pasien aktif (Bisa ganti-ganti kalau diklik di sidebar)
  const [activePatient, setActivePatient] = useState(initialPatients[0]);

  // State untuk membuka/tutup Modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        background: "#F0F2F5",
        fontFamily: "Space Grotesk, sans-serif",
        overflow: "hidden",
        padding: "24px",
        boxSizing: "border-box",
        gap: "32px",
        position: "relative",
      }}
    >
      {/* ============================== */}
      {/* SIDEBAR (KIRI)                 */}
      {/* ============================== */}
      <div
        style={{
          width: "320px",
          minWidth: "320px",
          background: "#151E2C",
          borderRadius: "24px",
          boxShadow: "0px 13px 80px rgba(226, 236, 249, 0.25)",
          display: "flex",
          flexDirection: "column",
          zIndex: 10,
          overflow: "hidden",
        }}
      >
        {/* Logo Section */}
        <div
          style={{
            padding: "40px 30px",
            display: "flex",
            alignItems: "center",
            gap: "15px",
          }}
        >
          <img
            src={visensaLogo}
            alt="VISENSA Logo"
            style={{ width: "28px", height: "auto" }}
          />
          <div
            style={{
              color: "#F0FAFB",
              fontSize: "26px",
              fontWeight: "800",
              letterSpacing: "1px",
            }}
          >
            VISENSA
          </div>
        </div>

        <div
          style={{
            height: "1px",
            background: "rgba(255, 255, 255, 0.10)",
            margin: "0 30px",
          }}
        />

        {/* Patients List */}
        <div style={{ flex: 1, padding: "20px 30px", overflowY: "auto" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  color: "#7AAAB4",
                  fontSize: "11px",
                  fontFamily: "Space Mono",
                  letterSpacing: "1.2px",
                }}
              >
                PATIENTS (5)
              </div>
              <div
                style={{
                  background: "rgba(212, 168, 67, 0.12)",
                  border: "1px solid rgba(212, 168, 67, 0.25)",
                  borderRadius: "20px",
                  padding: "2px 6px",
                  color: "#D4A843",
                  fontSize: "10px",
                  fontFamily: "Space Mono",
                  fontWeight: "700",
                }}
              >
                1!
              </div>
            </div>

            {/* Tombol Add Patient (+) memicu isModalOpen */}
            <div
              onClick={() => setIsModalOpen(true)}
              style={{
                width: "28px",
                height: "28px",
                background: "rgba(96.85, 242.61, 255, 0.08)",
                borderRadius: "8px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <svg
                width="14"
                height="14"
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
          </div>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {initialPatients.map((patient) => {
              const isSelected = activePatient.id === patient.id;
              return (
                <div
                  key={patient.id}
                  onClick={() => setActivePatient(patient)}
                  style={{
                    padding: "12px 16px",
                    background: isSelected ? "#F0FAFB" : "transparent",
                    borderRadius: "12px",
                    border: isSelected
                      ? "1px solid #C4E8EC"
                      : "1px solid transparent",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      background: isSelected
                        ? "linear-gradient(135deg, #0099A6 0%, #007580 100%)"
                        : "#1A2536",
                      borderRadius: "50%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        color: isSelected ? "white" : "#7AAAB4",
                        fontSize: "13px",
                        fontWeight: "700",
                      }}
                    >
                      {patient.id}
                    </span>
                  </div>
                  <div>
                    <div
                      style={{
                        color: isSelected ? "#151E2C" : "#F0FAFB",
                        fontSize: "14.5px",
                        fontWeight: isSelected ? "700" : "500",
                        marginBottom: "2px",
                      }}
                    >
                      {patient.name}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <div
                        style={{
                          width: "8px",
                          height: "8px",
                          background: patient.color,
                          borderRadius: "50%",
                          boxShadow:
                            patient.id === "ML"
                              ? "0 0 0 3px rgba(212,168,67,0.2)"
                              : "none",
                        }}
                      />
                      <div
                        style={{
                          color: "#7AAAB4",
                          fontSize: "11px",
                          fontFamily: "Space Mono",
                        }}
                      >
                        {patient.week}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Doctor Footer */}
        <div
          style={{
            padding: "30px",
            borderTop: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "16px",
              background: "#F0FAFB",
              padding: "12px",
              borderRadius: "16px",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                background: "linear-gradient(135deg, #0099A6 0%, #007580 100%)",
                borderRadius: "50%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <span
                style={{ color: "white", fontSize: "13px", fontWeight: "700" }}
              >
                SK
              </span>
            </div>
            <div>
              <div
                style={{
                  color: "#0C2830",
                  fontSize: "14.5px",
                  fontWeight: "700",
                }}
              >
                Dr. Sarah K.
              </div>
              <div style={{ color: "#7AAAB4", fontSize: "12px" }}>
                Occupational Therapist
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate("/")}
            style={{
              width: "100%",
              padding: "12px",
              background: "#FFE9E9",
              border: "1px solid rgba(192, 86, 76, 0.5)",
              borderRadius: "12px",
              color: "#C0574C",
              fontSize: "14.5px",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Sign out
          </button>
        </div>
      </div>

      {/* ============================== */}
      {/* MAIN CONTENT (KANAN)           */}
      {/* ============================== */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          paddingRight: "12px",
          paddingBottom: "24px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header Top & Notifications */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "40px",
            marginTop: "16px",
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
              style={{ color: "#1A2332", fontSize: "36px", fontWeight: "700" }}
            >
              Patient Monitoring
            </div>
          </div>

          {/* Notification Bell */}
          <div style={{ position: "relative" }}>
            <div
              onClick={() => setShowNotif(!showNotif)}
              style={{
                width: "48px",
                height: "48px",
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

            {/* Dropdown Notifikasi */}
            {showNotif && (
              <div
                style={{
                  position: "absolute",
                  top: "60px",
                  right: "0",
                  width: "450px",
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
                          fontSize: "18px",
                        }}
                      >
                        {notif.icon}
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

        {/* Patient Detail Header Row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "30px",
          }}
        >
          <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                background: "linear-gradient(135deg, #0099A6 0%, #007580 100%)",
                borderRadius: "50%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                boxShadow: "0px 4px 15px rgba(0, 153, 166, 0.2)",
              }}
            >
              <span
                style={{ color: "white", fontSize: "20px", fontWeight: "700" }}
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

          {/* Navigasi Tab (Meredup jika pasien baru) */}
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
              onClick={() => setActiveTab("Movement")}
              style={{
                padding: "10px 20px",
                background:
                  activeTab === "Movement" ? "#F0FAFB" : "transparent",
                border:
                  activeTab === "Movement"
                    ? "1px solid #C4E8EC"
                    : "1px solid transparent",
                borderRadius: "12px",
                color: activeTab === "Movement" ? "#0099A6" : "#7AAAB4",
                fontSize: "15px",
                fontWeight: activeTab === "Movement" ? "700" : "500",
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
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
              Movement
            </button>
          </div>
        </div>

        {/* LOGIKA KONTEN: EMPTY STATE vs DATA */}
        {activePatient.isNew ? (
          /* ============================== */
          /* TAMPILAN EMPTY STATE (KOSONG)  */
          /* ============================== */
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
              {activePatient.name.toLowerCase()} has been registered but hasn't
              completed their first therapy session. Share their login link to
              get started.
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
        ) : (
          /* ============================== */
          /* TAMPILAN NORMAL (ADA DATA)     */
          /* ============================== */
          <>
            {activeTab === "Feedback" ? (
              /* TAB FEEDBACK FULL */
              <div>
                <div
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

                {/* Full Chart */}
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
                          <stop
                            offset="0%"
                            stopColor="rgba(0, 153, 166, 0.15)"
                          />
                          <stop
                            offset="100%"
                            stopColor="rgba(0, 153, 166, 0)"
                          />
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

                {/* Full Feedback Logs */}
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
              /* TAB MOVEMENT FULL */
              <div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "24px",
                    marginBottom: "30px",
                  }}
                >
                  {movementStats.map((stat, i) => (
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
                  style={{ display: "flex", gap: "12px", marginBottom: "30px" }}
                >
                  {dateTabs.map((date, i) => (
                    <div
                      key={i}
                      style={{
                        padding: "8px 20px",
                        background:
                          i === 0 ? "rgba(0, 153, 166, 0.08)" : "white",
                        borderRadius: "20px",
                        border:
                          i === 0
                            ? "1.5px solid #0099A6"
                            : "1.5px solid #C4E8EC",
                        color: i === 0 ? "#0099A6" : "#7AAAB4",
                        fontSize: "14.5px",
                        fontFamily: "Space Mono",
                        fontWeight: i === 0 ? "700" : "400",
                        cursor: "pointer",
                      }}
                    >
                      {date}
                    </div>
                  ))}
                </div>

                {/* <div style={{ background: "white", borderRadius: "20px", border: "1px solid #C4E8EC", boxShadow: "0 4px 15px rgba(0,0,0,0.02)", overflow: "hidden" }}>
                  <div style={{ padding: "20px 30px", borderBottom: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ color: "#0C2830", fontSize: "18px", fontWeight: "700" }}>Exercise breakdown</div>
                    <div style={{ color: "#7AAAB4", fontSize: "14.5px", fontFamily: "Space Mono" }}>8 of 8 done</div>
                  </div>
                  <div>
                    {exercisesData.map((ex, i) => (
                      <div key={i} style={{ padding: "18px 30px", borderBottom: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: "20px" }}>
                        <div style={{ width: "32px", height: "32px", background: ex.bg, border: `1.5px solid ${ex.stroke}33`, borderRadius: "10px", display: "flex", justifyContent: "center", alignItems: "center", flexShrink: 0 }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ex.stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                          </svg>
                        </div>
                        <div style={{ flex: 1, color: "#0C2830", fontSize: "16px", fontWeight: "500", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ex.name}</div>
                        <div style={{ color: "#7AAAB4", fontSize: "14.5px", fontFamily: "Space Mono", width: "70px", flexShrink: 0 }}>{ex.reps}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", width: "130px", flexShrink: 0 }}>
                          <div style={{ flex: 1, height: "6px", background: "#C4E8EC", borderRadius: "10px", overflow: "hidden" }}>
                            <div style={{ width: `${ex.percent}%`, height: "100%", background: ex.color, borderRadius: "10px" }} />
                          </div>
                          <div style={{ color: "#7AAAB4", fontSize: "13.5px", fontFamily: "Space Mono", width: "35px" }}>{ex.percent}%</div>
                        </div>
                        <div style={{ background: ex.statusBg, border: `1.5px solid ${ex.stroke}33`, borderRadius: "20px", padding: "4px 16px", color: ex.color, fontSize: "13.5px", fontFamily: "Space Mono", fontWeight: "700", minWidth: "95px", textAlign: "center", whiteSpace: "nowrap", flexShrink: 0 }}>
                          {ex.status}
                        </div>
                      </div>
                    ))}
                  </div>
                </div> */}
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
            style={{
              width: "840px",
              background: "white",
              borderRadius: "35px",
              boxShadow: "0px 35px 106px rgba(12, 40, 48, 0.18)",
              border: "1.77px solid #C4E8EC",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "35px 42px 28px",
                borderBottom: "1.77px solid #C4E8EC",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    marginBottom: "4px",
                  }}
                >
                  <div
                    style={{
                      width: "49px",
                      height: "49px",
                      background:
                        "linear-gradient(135deg, #0099A6 0%, #007580 100%)",
                      borderRadius: "14px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <svg
                      width="24"
                      height="24"
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
                  <div
                    style={{
                      color: "#0C2830",
                      fontSize: "28px",
                      fontFamily: "Space Grotesk",
                      fontWeight: "700",
                    }}
                  >
                    Register new patient
                  </div>
                </div>
                <div
                  style={{
                    color: "#7AAAB4",
                    fontSize: "21px",
                    fontFamily: "Space Grotesk",
                    paddingLeft: "65px",
                  }}
                >
                  Patient will receive login credentials via email
                </div>
              </div>

              <div
                onClick={() => setIsModalOpen(false)}
                style={{ cursor: "pointer", padding: "8px" }}
              >
                <svg
                  width="24"
                  height="24"
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

            {/* Modal Body */}
            <div
              style={{
                padding: "35px 42px",
                display: "flex",
                flexDirection: "column",
                gap: "28px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <div
                  style={{
                    fontSize: "21px",
                    fontFamily: "Space Grotesk",
                    fontWeight: "600",
                  }}
                >
                  <span style={{ color: "#3A6870" }}>Full name </span>
                  <span style={{ color: "#C0574C" }}>*</span>
                </div>
                <input
                  type="text"
                  placeholder="e.g. Budi Santoso"
                  style={{
                    width: "100%",
                    height: "73px",
                    padding: "0 24px",
                    background: "white",
                    border: "1.77px solid #C4E8EC",
                    borderRadius: "17px",
                    color: "#0C2830",
                    fontSize: "22px",
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
                  gap: "10px",
                }}
              >
                <div
                  style={{
                    fontSize: "21px",
                    fontFamily: "Space Grotesk",
                    fontWeight: "600",
                  }}
                >
                  <span style={{ color: "#3A6870" }}>
                    Diagnosis / condition{" "}
                  </span>
                  <span style={{ color: "#C0574C" }}>*</span>
                </div>
                <div style={{ position: "relative" }}>
                  <select
                    style={{
                      width: "100%",
                      height: "73px",
                      padding: "0 24px",
                      background: "white",
                      border: "1.77px solid #C4E8EC",
                      borderRadius: "17px",
                      color: "rgba(12, 40, 48, 0.50)",
                      fontSize: "22px",
                      fontFamily: "Space Grotesk",
                      boxSizing: "border-box",
                      outline: "none",
                      appearance: "none",
                    }}
                  >
                    <option>Select condition</option>
                    <option>Stroke / Hemiparesis</option>
                    <option>Phantom Limb Pain</option>
                  </select>
                  <div
                    style={{
                      position: "absolute",
                      right: "24px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      pointerEvents: "none",
                    }}
                  >
                    <svg
                      width="24"
                      height="24"
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
                  gap: "10px",
                }}
              >
                <div
                  style={{
                    fontSize: "21px",
                    fontFamily: "Space Grotesk",
                    fontWeight: "600",
                  }}
                >
                  <span style={{ color: "#3A6870" }}>Therapist note </span>
                  <span style={{ color: "#7AAAB4", fontWeight: "400" }}>
                    (optional)
                  </span>
                </div>
                <textarea
                  placeholder="Initial assessment, special considerations, session frequency…"
                  style={{
                    width: "100%",
                    height: "145px",
                    padding: "18px 24px",
                    background: "white",
                    border: "1.77px solid #C4E8EC",
                    borderRadius: "17px",
                    color: "#0C2830",
                    fontSize: "22px",
                    fontFamily: "Space Grotesk",
                    boxSizing: "border-box",
                    outline: "none",
                    resize: "none",
                  }}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: "24px 42px 35px",
                borderTop: "1.77px solid #C4E8EC",
                display: "flex",
                justifyContent: "flex-end",
                gap: "17px",
              }}
            >
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  padding: "15px 31px",
                  background: "white",
                  border: "1.77px solid #C4E8EC",
                  borderRadius: "17px",
                  color: "#3A6870",
                  fontSize: "23px",
                  fontFamily: "Space Grotesk",
                  fontWeight: "500",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  padding: "15px 38px",
                  background:
                    "linear-gradient(135deg, #0099A6 0%, #007580 100%)",
                  boxShadow: "0px 3.5px 21px rgba(0, 153, 166, 0.28)",
                  border: "none",
                  borderRadius: "17px",
                  color: "white",
                  fontSize: "23px",
                  fontFamily: "Space Grotesk",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                Register patient
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
