import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PatientSidebar from "./PatientSidebar";
import PatientOnboardingCard from "../../components/patient/dashboard/PatientOnboardingCard";
import ActiveTherapyDashboard from "../../components/patient/dashboard/ActiveTherapyDashboard";
import PatientSessionsView from "../../components/patient/dashboard/PatientSessionsView";
import PatientSessionDetail from "../../components/patient/dashboard/PatientSessionDetail";
import InteractivePracticeHub from "../../features/gamification/interactive-practice/InteractivePracticeHub";
import { useProgramScheduleStore } from "../../store/useProgramScheduleStore";
import { useStreakStore } from "../../features/gamification/streak/useStreakStore";
import { LogOut, Save, Music, Gamepad2 } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "https://visensa-production.up.railway.app/api/v1";

const PatientDashboard = ({ initialTab = "Dashboard" }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // --- UI NAVIGATION STATE ---
  const [activeMenu, setActiveMenu] = useState(
    location.state?.activeMenu || initialTab,
  );
  const [selectedSession, setSelectedSession] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // --- DYNAMIC DATA STATES ---
  const [user, setUser] = useState(() => {
    try {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  });

  const [patient, setPatient] = useState(null);
  const [sessionLogs, setSessionLogs] = useState([]);
  const [gamificationStats, setGamificationStats] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [monthlyGoal, setMonthlyGoal] = useState(0);
  const [minigameHistory, setMinigameHistory] = useState([]);

  // --- SETTINGS FORM STATE ---
  const [fullName, setFullName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");

  // --- PROGRAM SCHEDULE STORE ---
  const { activeProgram, weeklySchedule, fetchProgramFromApi } =
    useProgramScheduleStore();

  // --- DYNAMIC API DATA FETCHING ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // 1. Fetch Patient Profile
        const patRes = await fetch(`${API_BASE}/patients/me`, { headers });
        let currentPatientId = null;
        if (patRes.ok) {
          const patJson = await patRes.json();
          if (patJson.data) {
            setPatient(patJson.data);
            currentPatientId = patJson.data.id;
            const fetchedName = patJson.data.user?.name || patJson.data.name || "";
            const fetchedEmail = patJson.data.user?.email || patJson.data.email || "";
            setFullName(fetchedName);
            setEmail(fetchedEmail);
            setUser((prev) => ({ ...prev, ...patJson.data, name: fetchedName, email: fetchedEmail }));
          }
        }

        // 2. Fetch Active Program from DB with patient ID override
        await fetchProgramFromApi(currentPatientId);

        // 3. Fetch Exercise Session Logs
        const logsRes = await fetch(`${API_BASE}/sessions/exercise/me`, {
          headers,
        });
        if (logsRes.ok) {
          const logsJson = await logsRes.json();
          const rawLogs = logsJson.data ?? [];

          const formatted = rawLogs.map((log, index, all) => {
            const d = new Date(log.created_at);
            const day = d.getDate().toString();
            const month = d.toLocaleString("default", { month: "short" });
            const today = new Date();
            const isToday = d.toDateString() === today.toDateString();
            const isYesterday = new Date(today - 86400000).toDateString() === d.toDateString();
            const dayName = d.toLocaleString("default", { weekday: "short" });
            const year = d.getFullYear();

            const title = isToday
              ? `Today, ${day} ${month} ${year}`
              : isYesterday
                ? `Yesterday, ${day} ${month} ${year}`
                : `${dayName}, ${day} ${month} ${year}`;

            const newPain = log.pain_level ?? null;
            const prevSession = all[index + 1];
            const oldPain = prevSession?.pain_level ?? newPain;

            const status = log.pain_level <= 3 ? "Excellent" : log.pain_level <= 5 ? "Good" : log.pain_level <= 7 ? "Fair" : "Completed";
            const statusColor = log.pain_level <= 3 ? "#4BA882" : "#0099A6";
            const statusBg = log.pain_level <= 3 ? "rgba(75, 168, 130, 0.10)" : "rgba(0, 153, 166, 0.10)";

            return {
              id: log.id,
              rawDate: log.created_at,
              title,
              day,
              month,
              date: `${day} ${month}`,
              isToday,
              newPain,
              oldPain,
              durationSeconds: log.duration_seconds || 0,
              status,
              statusColor,
              statusBg,
            };
          });

          setSessionLogs(formatted);
        }

        // 4. Fetch Gamification Stats
        const statsRes = await fetch(`${API_BASE}/sessions/stats/me`, {
          headers,
        });
        if (statsRes.ok) {
          const statsJson = await statsRes.json();
          if (statsJson.data) {
            const combinedStats = {
              ...(statsJson.data.gamification || {}),
              ...(statsJson.data || {}),
            };
            setGamificationStats(combinedStats);

            if (combinedStats.current_streak !== undefined) {
              useStreakStore.setState({
                currentStreak: combinedStats.current_streak || 0,
                longestStreak: combinedStats.highest_streak || 0,
                streakFreezeAvailable: combinedStats.freeze_available || 0,
                lastCompletedDate: combinedStats.last_completed_date || null,
              });
            }
          }
        }

        // 5. Fetch Monthly Goal dynamically from DB endpoint session.service.js
        const goalRes = await fetch(`${API_BASE}/sessions/stats/monthly-goal`, {
          headers,
        });
        if (goalRes.ok) {
          const goalJson = await goalRes.json();
          const fetchedGoal = goalJson.data?.monthly_goal ?? goalJson.monthly_goal;
          if (fetchedGoal !== undefined && fetchedGoal !== null) {
            setMonthlyGoal(Number(fetchedGoal));
          }
        }

        // 6. Fetch Notifications
        const notifRes = await fetch(`${API_BASE}/notifications`, { headers });
        if (notifRes.ok) {
          const notifJson = await notifRes.json();
          if (Array.isArray(notifJson.data)) {
            setNotifications(notifJson.data);
          }
        }

        // 7. Fetch Minigame History
        if (user?.id) {
          const miniRes = await fetch(`${API_BASE}/minigame/logs/${user.id}`);
          if (miniRes.ok) {
            const miniJson = await miniRes.json();
            setMinigameHistory(miniJson.data || []);
          }
        }
      } catch (err) {
        console.warn("Patient dashboard API sync notice:", err.message);
      }
    };

    fetchData();
  }, [fetchProgramFromApi, user?.id, activeMenu]);

  // --- PROGRAM ASSIGNMENT GUARD ---
  const isExplicitlyUnassigned =
    activeProgram?.status === "unassigned" ||
    patient?.status === "unassigned";

  const hasActiveProgram = !isExplicitlyUnassigned;

  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const payload = {};
      if (fullName !== user?.name) payload.name = fullName;
      if (email !== user?.email) payload.email = email;
      if (password !== "") payload.password = password;

      const res = await fetch(`${API_BASE}/patients/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const updated = { ...user, name: fullName, email: email };
        setUser(updated);
        localStorage.setItem("user", JSON.stringify(updated));
        setPassword("");
        alert("Profile updated successfully!");
      }
    } catch (err) {
      console.error("Profile update error:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    for (let key in localStorage) {
      if (key.includes('streak')) {
        localStorage.removeItem(key);
      }
    }
    navigate("/");
  };

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

      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          background: "#F4F7F9",
          fontFamily: "Space Grotesk, sans-serif",
          padding: "24px",
          boxSizing: "border-box",
          gap: "24px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* 1. LEFT SIDEBAR */}
        <PatientSidebar
          activeMenu={activeMenu}
          onSelectMenu={(menu) => {
            setActiveMenu(menu);
            setSelectedSession(null);
          }}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />

        {/* 2. DYNAMIC CONTENT CANVAS */}
        {activeMenu === "Interactive Practice" ? (
          <div style={{ flex: 1, overflowY: "auto" }}>
            <InteractivePracticeHub />
          </div>
        ) : activeMenu === "Sessions" ? (
          /* SESSIONS TAB */
          selectedSession ? (
            <PatientSessionDetail
              session={selectedSession}
              onBack={() => setSelectedSession(null)}
            />
          ) : (
            <PatientSessionsView
              sessionLogs={sessionLogs}
              onSelectSession={setSelectedSession}
              notifications={notifications}
              onMarkAllRead={handleMarkAllNotificationsRead}
            />
          )
        ) : activeMenu === "Game History" || activeMenu === "Practice History" ? (
          /* PRACTICE HISTORY TAB WITH PIANO MUSIC ICON */
          <div className="hide-scroll" style={{ flex: 1, overflowY: "auto", paddingRight: "10px" }}>
            <div style={{ background: "white", padding: "32px", borderRadius: "24px", border: "1.5px solid #C4E8EC", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
              <div style={{ color: "#0C2830", fontSize: "24px", fontWeight: "700", marginBottom: "24px", fontFamily: "Space Grotesk, sans-serif" }}>
                Interactive Practice History
              </div>
              {minigameHistory.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {minigameHistory.map((m, i) => (
                    <div
                      key={i}
                      style={{
                        padding: "18px 20px",
                        borderRadius: "16px",
                        background: "#F8FAFC",
                        border: "1.5px solid #E2E8F0",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        {/* PIANO MUSIC ICON BADGE */}
                        <div
                          style={{
                            width: "46px",
                            height: "46px",
                            borderRadius: "14px",
                            background: "linear-gradient(135deg, rgba(0, 153, 166, 0.12) 0%, rgba(62, 216, 200, 0.12) 100%)",
                            border: "1.5px solid rgba(0, 153, 166, 0.25)",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            color: "#0099A6",
                            flexShrink: 0,
                          }}
                        >
                          <Music size={22} color="#0099A6" strokeWidth={2.2} />
                        </div>

                        <div>
                          <div style={{ color: "#0C2830", fontSize: "16px", fontWeight: "700", fontFamily: "Space Grotesk, sans-serif", marginBottom: "4px" }}>
                            {m.minigame?.title || "Piano Tiles Practice"}
                          </div>
                          <div style={{ color: "#7AAAB4", fontSize: "13.5px", fontFamily: "Space Grotesk, sans-serif" }}>
                            Score: <span style={{ color: "#0C2830", fontWeight: "700" }}>{m.score} pts</span> • Max Combo: <span style={{ color: "#4BA882", fontWeight: "700" }}>{m.max_combo || 0}</span>
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: "right" }}>
                        <div style={{ color: "#0099A6", fontFamily: "Space Mono, monospace", fontWeight: "700", fontSize: "14px" }}>
                          {new Date(m.played_at || m.created_at || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </div>
                        <div style={{ color: "#7AAAB4", fontSize: "12px", fontFamily: "Space Mono, monospace", marginTop: "2px" }}>
                          {new Date(m.played_at || m.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: "50px", textAlign: "center", color: "#7AAAB4", fontFamily: "Space Grotesk, sans-serif" }}>
                  No minigame practice sessions recorded yet.
                </div>
              )}
            </div>
          </div>
        ) : activeMenu === "Settings" ? (
          /* SETTINGS TAB */
          <div className="hide-scroll" style={{ flex: 1, overflowY: "auto", paddingRight: "10px" }}>
            {/* Page Header */}
            <div style={{ marginBottom: "32px" }}>
              <div style={{ color: "#0C2830", fontSize: "28px", fontWeight: "700", fontFamily: "Space Grotesk, sans-serif" }}>
                Settings
              </div>
              <div style={{ color: "#7AAAB4", fontSize: "14px", fontFamily: "Space Grotesk, sans-serif", marginTop: "4px" }}>
                Manage your profile and preferences.
              </div>
            </div>

            {/* Content Grid */}
            <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", alignItems: "flex-start" }}>
              {/* Card 1: Your Profile */}
              <div style={{ flex: "1 1 500px", background: "white", padding: "32px", borderRadius: "16px", border: "1.5px solid #F1F5F9", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
                <div style={{ color: "#0C2830", fontSize: "16px", fontWeight: "700", fontFamily: "Space Grotesk, sans-serif", marginBottom: "32px" }}>
                  Your profile
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "24px", marginBottom: "32px" }}>
                  <div>
                    <label style={{ color: "#7AAAB4", fontSize: "12px", fontFamily: "Space Mono, monospace", fontWeight: "700", letterSpacing: "1px", display: "block", marginBottom: "8px", textTransform: "uppercase" }}>Full Name</label>
                    <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} style={{ width: "100%", height: "48px", padding: "0 16px", background: "#FFFFFF", border: "1.5px solid #E2E8F0", borderRadius: "12px", outline: "none", fontSize: "15px", fontFamily: "Space Grotesk, sans-serif", color: "#1A2332", boxSizing: "border-box" }} />
                  </div>
                  <div>
                    <label style={{ color: "#7AAAB4", fontSize: "12px", fontFamily: "Space Mono, monospace", fontWeight: "700", letterSpacing: "1px", display: "block", marginBottom: "8px", textTransform: "uppercase" }}>Email Address</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%", height: "48px", padding: "0 16px", background: "#FFFFFF", border: "1.5px solid #E2E8F0", borderRadius: "12px", outline: "none", fontSize: "15px", fontFamily: "Space Grotesk, sans-serif", color: "#1A2332", boxSizing: "border-box" }} />
                  </div>
                  <div>
                    <label style={{ color: "#7AAAB4", fontSize: "12px", fontFamily: "Space Mono, monospace", fontWeight: "700", letterSpacing: "1px", display: "block", marginBottom: "8px", textTransform: "uppercase" }}>Change Password</label>
                    <input type="password" value={password} placeholder="Enter new password" onChange={(e) => setPassword(e.target.value)} style={{ width: "100%", height: "48px", padding: "0 16px", background: "#FFFFFF", border: "1.5px solid #E2E8F0", borderRadius: "12px", outline: "none", fontSize: "15px", fontFamily: "Space Grotesk, sans-serif", color: "#1A2332", boxSizing: "border-box" }} />
                  </div>
                </div>
                
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button onClick={handleSaveProfile} type="button" style={{ padding: "12px 24px", background: "#B5E3E7", color: "#ffffff", border: "none", borderRadius: "12px", fontWeight: "700", fontFamily: "Space Grotesk, sans-serif", fontSize: "15px", cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={(e) => e.target.style.background = "#9ACBCD"} onMouseLeave={(e) => e.target.style.background = "#B5E3E7"}>
                    Save changes
                  </button>
                </div>
              </div>

              {/* Card 2: Account Details & Logout */}
              <div style={{ flex: "1 1 300px", background: "white", borderRadius: "16px", border: "1.5px solid #F1F5F9", boxShadow: "0 2px 10px rgba(0,0,0,0.02)", display: "flex", flexDirection: "column" }}>
                <div style={{ padding: "24px 32px", borderBottom: "1.5px solid #F1F5F9" }}>
                  <div style={{ color: "#0C2830", fontSize: "16px", fontWeight: "700", fontFamily: "Space Grotesk, sans-serif" }}>
                    Account
                  </div>
                </div>
                
                <div style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
                  <div>
                    <div style={{ color: "#0C2830", fontSize: "14px", fontWeight: "700", fontFamily: "Space Grotesk, sans-serif", marginBottom: "4px" }}>Full Name</div>
                    <div style={{ color: "#94A3B8", fontSize: "14px", fontFamily: "Space Grotesk, sans-serif" }}>{user?.name || "Loading..."}</div>
                  </div>
                  <div>
                    <div style={{ color: "#0C2830", fontSize: "14px", fontWeight: "700", fontFamily: "Space Grotesk, sans-serif", marginBottom: "4px" }}>Account Role</div>
                    <div style={{ color: "#94A3B8", fontSize: "14px", fontFamily: "Space Grotesk, sans-serif" }}>Patient</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : !hasActiveProgram ? (
          /* STATE A: UNASSIGNED PATIENT */
          <div style={{ flex: 1, paddingRight: "10px", overflowY: "auto" }}>
            <PatientOnboardingCard
              patient={patient || user}
              onOpenPractice={() => setActiveMenu("Interactive Practice")}
            />
          </div>
        ) : (
          /* STATE B: ACTIVE PATIENT DASHBOARD */
          <ActiveTherapyDashboard
            patient={patient || user}
            program={activeProgram}
            schedule={weeklySchedule}
            stats={gamificationStats}
            sessionLogs={sessionLogs}
            notifications={notifications}
            monthlyGoal={monthlyGoal}
            onOpenPractice={() => setActiveMenu("Interactive Practice")}
            onStartSession={() => navigate("/intro")}
            onMarkAllRead={handleMarkAllNotificationsRead}
          />
        )}

      </div>
    </>
  );
};

export default PatientDashboard;
