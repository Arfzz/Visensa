import React, { useState, useRef, useEffect } from "react";
import visensaLogo from "../../assets/visensa-logo.png";
import {
  LayoutDashboard,
  Calendar,
  Search,
  Plus,
  AlertCircle,
  LogOut,
  ChevronLeft,
  User,
} from "lucide-react";

const AdminSidebar = ({
  isSidebarOpen,
  setIsSidebarOpen,
  activeView,
  setActiveView,
  selectedPatient,
  onSelectPatient,
  patientsList = [],
  onOpenAddPatientModal,
  onLogout,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const sidebarListRef = useRef(null);
  const [doctorProfile, setDoctorProfile] = useState({
    name: "Loading...",
    initials: "--",
    specialization: "Loading..."
  });
  const API_BASE = import.meta.env.VITE_API_URL || "https://visensa-production.up.railway.app/api/v1";

  const filteredPatients = patientsList.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const reviewRequiredCount = patientsList.filter(
    (p) => p.isNew || p.status === "Warning" || p.status === "Completed / Review Required"
  ).length;

  useEffect(() => {
    const fetchDoctorProfile = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return;

    const res = await fetch(`${API_BASE}/doctors/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

        if (res.ok) {
          const result = await res.json();
          const doc = result.data;
          
          // Logic skeptis: Ambil 2 huruf pertama dari kata-kata di namanya
          const nameParts = doc.name ? doc.name.split(" ") : ["D", "R"];
          const initials = nameParts.length > 1 
            ? (nameParts[0][0] + nameParts[1][0]).toUpperCase()
            : nameParts[0].substring(0, 2).toUpperCase();

          setDoctorProfile({
            name: doc.name || "Unknown Doctor",
            initials: initials,
            specialization: doc.specialization || "General Practitioner"
          });
        }
      } catch (err) {
        console.warn("Gagal ambil profil dokter:", err.message);
      }
    };

    fetchDoctorProfile();
  }, []);

  return (
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
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          borderRadius: "20px",
        }}
      >
        {/* --- BRAND HEADER & TOGGLE --- */}
        <div
          style={{
            padding: isSidebarOpen ? "24px 20px 16px" : "24px 0 16px",
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
              cursor: isSidebarOpen ? "default" : "pointer",
            }}
            title={!isSidebarOpen ? "Expand sidebar" : undefined}
          >
            <img
              src={visensaLogo}
              alt="VISENSA Logo"
              style={{ width: "28px", height: "auto", flexShrink: 0 }}
            />
            {isSidebarOpen && (
              <div
                style={{
                  color: "#F0FAFB",
                  fontSize: "22px",
                  fontWeight: "800",
                  letterSpacing: "1px",
                  whiteSpace: "nowrap",
                }}
              >
                VISENSA
              </div>
            )}
          </div>

          {isSidebarOpen && (
            <div
              onClick={() => setIsSidebarOpen(false)}
              style={{
                cursor: "pointer",
                color: "#7AAAB4",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "4px",
                borderRadius: "6px",
                transition: "all 0.2s",
              }}
              title="Collapse sidebar"
            >
              <ChevronLeft size={20} />
            </div>
          )}
        </div>

        {/* --- TIER 1: GLOBAL NAVIGATION --- */}
        <div
          style={{
            padding: isSidebarOpen ? "0 16px 16px" : "0 12px 16px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => setActiveView("overview")}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: isSidebarOpen ? "flex-start" : "center",
              gap: "12px",
              padding: isSidebarOpen ? "12px 16px" : "12px 0",
              borderRadius: "12px",
              border: "none",
              background:
                activeView === "overview"
                  ? "linear-gradient(135deg, #0099A6 0%, #007580 100%)"
                  : "transparent",
              color: activeView === "overview" ? "#FFFFFF" : "#94A3B8",
              fontSize: "14px",
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: activeView === "overview" ? "700" : "600",
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow:
                activeView === "overview"
                  ? "0 4px 14px rgba(0, 153, 166, 0.3)"
                  : "none",
            }}
            title="Clinic Overview"
          >
            <LayoutDashboard size={20} style={{ flexShrink: 0 }} />
            {isSidebarOpen && <span>Overview</span>}
          </button>

          <button
            onClick={() => setActiveView("schedules")}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: isSidebarOpen ? "flex-start" : "center",
              gap: "12px",
              padding: isSidebarOpen ? "12px 16px" : "12px 0",
              borderRadius: "12px",
              border: "none",
              background:
                activeView === "schedules"
                  ? "linear-gradient(135deg, #0099A6 0%, #007580 100%)"
                  : "transparent",
              color: activeView === "schedules" ? "#FFFFFF" : "#7AAAB4",
              fontSize: "14px",
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: activeView === "schedules" ? "700" : "600",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            title="Therapy Schedules"
          >
            <Calendar size={20} style={{ flexShrink: 0 }} />
            {isSidebarOpen && <span>Therapy Schedules</span>}
          </button>
        </div>

        {/* --- DIVIDER --- */}
        <div
          style={{
            height: "1px",
            background: "rgba(255, 255, 255, 0.10)",
            margin: isSidebarOpen ? "0 20px" : "0 16px",
            flexShrink: 0,
          }}
        />

        {/* --- TIER 2: PATIENT DIRECTORY --- */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            padding: isSidebarOpen ? "16px" : "16px 8px",
            boxSizing: "border-box",
          }}
        >
          {/* Header & Add Button */}
          <div
            style={{
              display: "flex",
              justifyContent: isSidebarOpen ? "space-between" : "center",
              alignItems: "center",
              marginBottom: "12px",
              flexShrink: 0,
            }}
          >
            {isSidebarOpen ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span
                  style={{
                    color: "#7AAAB4",
                    fontSize: "11px",
                    fontFamily: "Space Mono, monospace",
                    letterSpacing: "1.2px",
                    fontWeight: "700",
                  }}
                >
                  PATIENTS ({patientsList.length})
                </span>
                {reviewRequiredCount > 0 && (
                  <span
                    style={{
                      background: "rgba(212, 168, 67, 0.15)",
                      border: "1px solid rgba(212, 168, 67, 0.3)",
                      borderRadius: "20px",
                      padding: "2px 7px",
                      color: "#D4A843",
                      fontSize: "10px",
                      fontFamily: "Space Mono, monospace",
                      fontWeight: "700",
                    }}
                  >
                    {reviewRequiredCount}!
                  </span>
                )}
              </div>
            ) : (
              <User size={18} color="#7AAAB4" />
            )}

            {isSidebarOpen && (
              <button
                onClick={onOpenAddPatientModal}
                style={{
                  width: "26px",
                  height: "26px",
                  background: "rgba(0, 153, 166, 0.15)",
                  border: "1px solid rgba(0, 153, 166, 0.3)",
                  borderRadius: "8px",
                  color: "#3ED8C8",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                title="Register New Patient"
              >
                <Plus size={14} />
              </button>
            )}
          </div>

          {/* Compact Search Input */}
          {isSidebarOpen && (
            <div
              style={{
                position: "relative",
                marginBottom: "12px",
                flexShrink: 0,
              }}
            >
              <Search
                size={14}
                color="#7AAAB4"
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              />
              <input
                type="text"
                placeholder="Search roster..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px 8px 34px",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "10px",
                  color: "#F0FAFB",
                  fontSize: "13px",
                  fontFamily: "Space Grotesk, sans-serif",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
          )}

          {/* Patient Cards Roster */}
          <div
            className="hide-scroll"
            ref={sidebarListRef}
            onWheel={(e) => {
              if (sidebarListRef.current) {
                sidebarListRef.current.scrollTop += e.deltaY;
              }
            }}
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: "auto",
              overscrollBehavior: "contain",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {filteredPatients.map((patient) => {
              const isSelected =
                activeView === "patient" && selectedPatient?.id === patient.id;
              const hasAlert =
                patient.isNew ||
                patient.status === "Warning" ||
                patient.status === "Completed / Review Required";

              return (
                <div
                  key={patient.id}
                  onClick={() => {
                    onSelectPatient(patient);
                    setActiveView("patient");
                  }}
                  style={{
                    padding: isSidebarOpen ? "12px" : "10px 0",
                    background: isSelected
                      ? "rgba(0, 153, 166, 0.18)"
                      : "rgba(255, 255, 255, 0.03)",
                    border: isSelected
                      ? "1px solid #0099A6"
                      : "1px solid rgba(255, 255, 255, 0.05)",
                    borderRadius: "14px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: isSidebarOpen ? "space-between" : "center",
                    gap: "10px",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      overflow: "hidden",
                    }}
                  >
                    {/* Avatar */}
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "10px",
                        background: isSelected ? "#0099A6" : "rgba(255, 255, 255, 0.08)",
                        color: isSelected ? "white" : "#3ED8C8",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        fontSize: "13px",
                        fontFamily: "Space Grotesk, sans-serif",
                        fontWeight: "700",
                        flexShrink: 0,
                      }}
                    >
                      {patient.id}
                    </div>

                    {isSidebarOpen && (
                      <div style={{ overflow: "hidden" }}>
                        <div
                          style={{
                            color: isSelected ? "#FFFFFF" : "#F0FAFB",
                            fontSize: "14px",
                            fontFamily: "Space Grotesk, sans-serif",
                            fontWeight: isSelected ? "700" : "600",
                            whiteSpace: "nowrap",
                            textOverflow: "ellipsis",
                            overflow: "hidden",
                          }}
                        >
                          {patient.name}
                        </div>
                        <div
                          style={{
                            color: "#7AAAB4",
                            fontSize: "11px",
                            fontFamily: "Space Mono, monospace",
                          }}
                        >
                          {patient.week} • {patient.compliance}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Visual Warning Badge Indicator */}
                  {hasAlert && (
                    <div
                      title={patient.isNew ? "New Patient" : "Review Required"}
                      style={{
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <AlertCircle size={15} color="#D4A843" />
                    </div>
                  )}
                </div>
              );
            })}

            {filteredPatients.length === 0 && isSidebarOpen && (
              <div
                style={{
                  padding: "16px",
                  textAlign: "center",
                  color: "#7AAAB4",
                  fontSize: "12px",
                  fontFamily: "Space Grotesk",
                }}
              >
                No patients match "{searchTerm}"
              </div>
            )}
          </div>
        </div>

        {/* --- FOOTER: DOCTOR PROFILE & LOGOUT --- */}
        <div
          style={{
            padding: isSidebarOpen ? "16px" : "16px 8px",
            borderTop: "1px solid rgba(255, 255, 255, 0.10)",
            display: "flex",
            alignItems: "center",
            justifyContent: isSidebarOpen ? "space-between" : "center",
            flexShrink: 0,
          }}
        >
          {isSidebarOpen ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #0099A6 0%, #007580 100%)",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  color: "white",
                  fontSize: "13px",
                  fontFamily: "Space Grotesk",
                  fontWeight: "700",
                  flexShrink: 0,
                }}
              >
                {/* PANGGIL INISIAL DINAMIS */}
                {doctorProfile.initials}
              </div>
              <div style={{ overflow: "hidden" }}>
                <div
                  style={{
                    color: "#F0FAFB",
                    fontSize: "13.5px",
                    fontFamily: "Space Grotesk",
                    fontWeight: "700",
                    whiteSpace: "nowrap",
                  }}
                >
                  {/* PANGGIL NAMA DINAMIS */}
                  {doctorProfile.name}
                </div>
                <div
                  style={{
                    color: "#7AAAB4",
                    fontSize: "11px",
                    fontFamily: "Space Mono",
                  }}
                >
                  {/* PANGGIL SPESIALISASI DINAMIS */}
                  Neurologist
                </div>
              </div>
            </div>
          ) : null}

          <div
            onClick={onLogout}
            style={{
              cursor: "pointer",
              color: "#7AAAB4",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "8px",
              borderRadius: "8px",
              transition: "all 0.2s",
            }}
            title="Logout"
          >
            <LogOut size={18} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
