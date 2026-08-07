import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminOverview from "./AdminOverview";
import TherapyAssignedModal from "./TherapyAssignedModal";
import PatientMonitoring from "../../components/doctor/monitoring/PatientMonitoring";
import NotificationBell from "../../components/doctor/monitoring/NotificationBell";
import RegisterPatientModal from "../../components/doctor/monitoring/RegisterPatientModal";
import { useProgramScheduleStore } from "../../store/useProgramScheduleStore";

const Dashboard = () => {
  const navigate = useNavigate();
  const mainContentRef = useRef(null);

  // --- STORE INTEGRATION ---
  const {
    activeProgram,
    weeklySchedule,
    fetchProgramFromApi,
  } = useProgramScheduleStore();

  // --- NAVIGATION & CONTAINER UI STATE ---
  const [activeView, setActiveView] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activePatient, setActivePatient] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showNotif, setShowNotif] = useState(false);

  // --- DYNAMIC DATA STATES (DYNAMIC BACKEND INTEGRATION) ---
  const [patientsList, setPatientsList] = useState([]);
  const [notificationsList, setNotificationsList] = useState([]);
  const [patientFeedbackLogs, setPatientFeedbackLogs] = useState([]);
  const [doctorName, setDoctorName] = useState("Dr. Sarah K.");

  // --- MODAL SUCCESS STATE ---
  const [isAssignedModalOpen, setIsAssignedModalOpen] = useState(false);
  const [assignedModalData, setAssignedModalData] = useState(null);

  // --- LOCK BODY OVERFLOW FOR DASHBOARD APP VIEW ---
  useEffect(() => {
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
    };
  }, []);

  // --- DYNAMIC DATA FETCHING ON MOUNT ---
  useEffect(() => {
    // 1. Doctor User Profile
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.name) setDoctorName(`Dr. ${user.name}`);
      }
    } catch (e) {
      console.warn("User parse notice:", e);
    }

    // 2. Fetch Notifications from API
    (async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${import.meta.env.VITE_API_URL || "https://visensa-production.up.railway.app/api/v1"}/notifications`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (res.ok) {
          const result = await res.json();
          if (result.data && Array.isArray(result.data)) {
            setNotificationsList(result.data);
          }
        }
      } catch (err) {
        console.warn("Notifications API sync notice:", err.message);
      }
    })();

    // 3. Fetch Patients Roster from API
    (async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${import.meta.env.VITE_API_URL || "https://visensa-production.up.railway.app/api/v1"}/patients`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (res.ok) {
          const result = await res.json();
          if (result.data && Array.isArray(result.data) && result.data.length > 0) {
            const formatted = result.data.map((p, idx) => ({
              id: p.id ? (p.id.length > 6 ? p.id.substring(0, 4).toUpperCase() : p.id) : `P${idx + 1}`,
              rawId: p.id,
              name: p.name,
              email: p.email || `${p.name.toLowerCase().replace(/\s+/g, "")}@email.com`,
              week: p.week || "Wk 1",
              condition: p.condition || "Stroke Recovery",
              compliance: p.compliance || (p.isNew ? "Not started" : "85%"),
              sessions: p.sessions ?? p.totalExercises ?? 0,
              pain: p.pain ?? p.pain_level ?? null,
              isNew: Boolean(p.isNew || !p.has_program),
              status: p.status || (p.isNew ? "New" : "Active"),
              color: "#0099A6",
            }));
            setPatientsList(formatted);
            if (!activePatient) {
              setActivePatient(formatted[0]);
            }
          }
        }
      } catch (err) {
        console.warn("Patients API sync notice:", err.message);
      }
    })();
  }, []);

  // --- SYNC SELECTED PATIENT PROGRAM, PROFILE & LOGS FROM SUPABASE DB ---
  const handleSelectPatient = useCallback(
    async (patientObj) => {
      const patient = typeof patientObj === "string" 
        ? patientsList.find((p) => p.id === patientObj || p.rawId === patientObj) 
        : patientObj;

      if (!patient) return;
      setActivePatient(patient);
      // 1. IMMEDIATE STATE CLEANUP (Prevent Stale State Contamination)
      setPatientFeedbackLogs([]);

      const targetId = patient.rawId || patient.id;
      if (!targetId) return;

      const token = localStorage.getItem("accessToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      try {
        // 1. Fetch Active Program & Schedule from DB
        const progData = await fetchProgramFromApi(targetId);

        // 2. Fetch Specific Patient Profile Details from DB
        const patRes = await fetch(`${import.meta.env.VITE_API_URL || "https://visensa-production.up.railway.app/api/v1"}/patients/${targetId}`, { headers });
        let dbPatient = null;
        if (patRes.ok) {
          const result = await patRes.json();
          if (result.data) dbPatient = result.data;
        }

        // 3. Fetch Patient Feedback Logs from DB
        const logsRes = await fetch(`${import.meta.env.VITE_API_URL || "https://visensa-production.up.railway.app/api/v1"}/patients/${targetId}/feedback-logs`, { headers });
        let dbLogs = [];
        if (logsRes.ok) {
          const result = await logsRes.json();
          if (result.data && Array.isArray(result.data)) {
            dbLogs = result.data;
          }
        }
        setPatientFeedbackLogs(dbLogs);

        // 4. Calculate Dynamic Metrics from DB Data
        const prog = progData?.activeProgram;
        const hasActiveProg = Boolean(prog && prog.status !== "completed");
        
        let weekStr = patient.week || "Wk 1";
        if (prog?.startDate) {
          const startMs = new Date(prog.startDate).getTime();
          if (!isNaN(startMs)) {
            const diffWeeks = Math.max(1, Math.ceil((Date.now() - startMs) / (7 * 86400000)));
            weekStr = `Wk ${diffWeeks}`;
          }
        }

        const totalCompleted = prog?.totalCompletedSessions || patient.sessions || 0;
        const complianceVal = hasActiveProg ? "100%" : "Not started";

        const syncedPatient = {
          ...patient,
          name: dbPatient?.name || patient.name,
          condition: dbPatient?.condition || patient.condition || "Stroke Recovery",
          notes: dbPatient?.notes || patient.notes,
          isNew: !hasActiveProg,
          status: hasActiveProg ? "Active" : "New",
          week: weekStr,
          compliance: complianceVal,
          sessions: totalCompleted,
          pain: dbPatient?.pain ?? dbPatient?.pain_level ?? patient.pain ?? null,
        };

        setActivePatient(syncedPatient);
        setPatientsList((prev) =>
          prev.map((p) => (p.id === patient.id || p.rawId === targetId ? syncedPatient : p))
        );
      } catch (err) {
        console.warn("Patient monitoring DB sync notice:", err.message);
      }
    },
    [patientsList, fetchProgramFromApi]
  );

  // --- ASSIGN / PUBLISH THERAPY PROGRAM HANDLER ---
  const handleAssignInitialProgram = async (programPayload) => {
    const freq = programPayload?.frequencyPerWeek || 3;
    const rest = programPayload?.restIntervalDays || 1;
    const duration = programPayload?.programDurationWeeks || 4;
    const startDateStr = programPayload?.startDate || "Tomorrow";

    const targetId = activePatient?.rawId || activePatient?.id;
    try {
      const token = localStorage.getItem("accessToken");
      if (targetId) {
        await fetch(`${import.meta.env.VITE_API_URL || "https://visensa-production.up.railway.app/api/v1"}/programs`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            patient_id: targetId,
            patientId: targetId,
            program_duration_weeks: duration,
            programDurationWeeks: duration,
            frequency_per_week: freq,
            frequencyPerWeek: freq,
            rest_interval_days: rest,
            restIntervalDays: rest,
            start_date: startDateStr,
            startDate: startDateStr,
          }),
        });
      }
    } catch (err) {
      console.warn("Publish program backend notice:", err.message);
    }

    if (activePatient) {
      activePatient.isNew = false;
      activePatient.clinicalStatus = "active";
      activePatient.status = "Active";
      activePatient.has_program = true;

      if (targetId) {
        await fetchProgramFromApi(targetId);
      }

      const updated = {
        ...activePatient,
        isNew: false,
        clinicalStatus: "active",
        status: "Active",
        has_program: true,
        patient_programs: [{ id: "assigned_prog" }],
      };

      setActivePatient(updated);
      setPatientsList((prev) =>
        prev.map((p) => (p.id === activePatient.id || p.rawId === targetId ? updated : p))
      );

      await handleSelectPatient(updated);
    }

    setAssignedModalData({
      patientName: activePatient?.name || "Patient",
      frequencyPerWeek: freq,
      restIntervalDays: rest,
      programDurationWeeks: duration,
      startDate: startDateStr,
      endDate: `In ${duration} Weeks`,
      totalSessions: duration * freq,
    });
    setIsAssignedModalOpen(true);
  };

  // --- REFRESH DATA HANDLER ---
  const handleRefreshPatientData = () => {
    if (activePatient) {
      handleSelectPatient(activePatient);
    }
  };

  // --- NOTIFICATION HANDLERS ---
  const handleMarkAllRead = () => {
    setNotificationsList((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  // --- REGISTER NEW PATIENT SUCCESS ---
  const handleRegisterSuccess = (newPatient) => {
    setPatientsList((prev) => [newPatient, ...prev]);
    setActivePatient(newPatient);
    setActiveView("patient");
  };

  // --- LOGOUT HANDLER ---
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
        `}
      </style>
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
          overflow: "hidden",
        }}
      >
        {/* 1. LEFT SIDEBAR */}
        <AdminSidebar
          activeView={activeView}
          isSidebarOpen={isSidebarOpen}
          onOpenAddPatientModal={() => setIsModalOpen(true)}
          onSelectPatient={(p) => {
            handleSelectPatient(p);
            setActiveView("patient");
          }}
          patientsList={patientsList}
          selectedPatient={activePatient}
          setActiveView={setActiveView}
          setIsSidebarOpen={setIsSidebarOpen}
          onLogout={handleLogout}
        />

        {/* 2. RIGHT MAIN CANVAS */}
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
            maxHeight: "calc(100vh - 48px)",
            overflowY: "auto",
            overscrollBehavior: "contain",
            WebkitOverflowScrolling: "touch",
            display: "flex",
            flexDirection: "column",
            paddingRight: "16px",
            paddingBottom: "60px",
            boxSizing: "border-box",
          }}
        >
        {activeView === "overview" ? (
          <AdminOverview
            patients={patientsList}
            onSelectPatient={(patient) => {
              handleSelectPatient(patient);
              setActiveView("patient");
            }}
            onAddPatient={() => setIsModalOpen(true)}
          />
        ) : (
          <>
            {/* TOP BAR: Greeting & Notifications Bell */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "28px",
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
                    marginBottom: "6px",
                  }}
                >
                  Hello, {doctorName}
                </div>
                <div
                  style={{
                    color: "#1A2332",
                    fontSize: "36px",
                    fontWeight: "700",
                  }}
                >
                  Patient Monitoring
                </div>
              </div>

              {/* Notification Bell & Dropdown Panel */}
              <NotificationBell
                notifications={notificationsList}
                onMarkAllRead={handleMarkAllRead}
                setShowNotif={setShowNotif}
                showNotif={showNotif}
              />
            </div>

            {/* MAIN MONITORING VIEW */}
            {activePatient ? (
              <PatientMonitoring
                activeProgram={activeProgram}
                weeklySchedule={weeklySchedule}
                patientFeedbackLogs={patientFeedbackLogs}
                patient={activePatient}
                handleAssignInitialProgram={handleAssignInitialProgram}
                onRefreshData={handleRefreshPatientData}
              />
            ) : (
              <div
                style={{
                  padding: "60px",
                  textAlign: "center",
                  color: "#7AAAB4",
                  background: "white",
                  borderRadius: "20px",
                  border: "1.5px solid #C4E8EC",
                  fontFamily: "Space Grotesk",
                }}
              >
                No patient selected or no patients assigned to your roster yet.
              </div>
            )}
          </>
        )}
      </div>

      {/* 3. REGISTER PATIENT MODAL */}
      {isModalOpen && (
        <RegisterPatientModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleRegisterSuccess}
        />
      )}

      {/* 4. THERAPY ASSIGNED SUCCESS MODAL */}
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
