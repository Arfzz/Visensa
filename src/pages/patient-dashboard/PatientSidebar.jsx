import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Clock, 
  Gamepad2, 
  Settings, 
  Flame, 
  Clock1, 
  Clock10Icon, 
  LogOut 
} from "lucide-react";
import visensaLogo from "../../assets/visensa-logo.png";
import { useStreakStore } from "../../features/gamification/streak/useStreakStore";

export const PatientSidebar = ({ activeMenu, onSelectMenu }) => {
  // --- STORE & NAVIGATION ---
  const currentStreak = useStreakStore((state) => state.currentStreak);
  const navigate = useNavigate();

  // --- LOGIC LOGOUT ---
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    navigate("/login"); 
  };

  // --- MENU ITEMS WITH ICONS ---
  const menuItems = useMemo(
    () => [
      { id: "Dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "Sessions", label: "Sessions", icon: Clock },
      { id: "Interactive Practice", label: "Interactive Practice", icon: Gamepad2, hasBadge: true },
      { id: "Game History", label: "Practice History", icon: Clock10Icon },
      { id: "Settings", label: "Settings", icon: Settings },
    ],
    []
  );

  return (
    <>
      <style>
        {`
          .patient-sidebar {
            width: 300px;
            min-width: 300px;
            background: #151E2C;
            border-radius: 24px;
            display: flex;
            flex-direction: column;
            padding: 35px 25px;
            box-sizing: border-box;
            z-index: 10;
            box-shadow: 0px 13px 80px rgba(226, 236, 249, 0.25);
          }
          .logout-btn {
            margin-top: auto; 
          }
          @media (max-width: 1024px) {
            .patient-sidebar {
              width: 260px;
              min-width: 260px;
              padding: 30px 15px;
            }
          }
          @media (max-width: 768px) {
            .patient-sidebar {
              position: fixed;
              bottom: 0;
              left: 0;
              width: 100vw;
              min-width: 100vw;
              height: 70px;
              flex-direction: row;
              padding: 0 10px;
              border-radius: 24px 24px 0 0;
              justify-content: space-around;
              align-items: center;
              z-index: 50;
            }
            .sidebar-header {
              display: none !important;
            }
            .sidebar-menu-list {
              flex-direction: row !important;
              gap: 5px !important;
              width: 100%;
              justify-content: space-around;
              margin-bottom: 0 !important;
            }
            .menu-item-text {
              display: none !important;
            }
            .menu-item-container {
              padding: 12px !important;
              justify-content: center !important;
              position: relative;
              background: transparent !important;
              box-shadow: none !important;
            }
            .menu-item-container.active {
              background: rgba(200, 241, 53, 0.2) !important;
            }
            .menu-badge {
              position: absolute;
              top: 0;
              right: 0;
              padding: 2px 6px !important;
              background: rgba(245, 158, 11, 0.9) !important;
              border: none !important;
            }
            .menu-badge span {
              color: white !important;
            }
            .menu-badge svg {
              display: none !important;
            }
            .logout-btn {
              margin-top: 0 !important; 
            }
          }
        `}
      </style>
      <div className="patient-sidebar">
        {/* --- SIDEBAR HEADER LOGO --- */}
        <div className="sidebar-header" style={{ display: "flex", alignItems: "center", gap: "12px", paddingLeft: "15px", marginBottom: "45px" }}>
          <img src={visensaLogo} alt="VISENSA" style={{ width: "24px", height: "auto" }} />
          <div style={{ color: "#F0FAFB", fontSize: "26px", fontWeight: "800", letterSpacing: "1px", fontFamily: "Space Grotesk, sans-serif" }}>
            VISENSA
          </div>
        </div>

        {/* --- MENU NAVIGATION LIST WITH ICONS --- */}
        <div className="sidebar-menu-list" style={{ display: "flex", flexDirection: "column", gap: "12px", flex: 1 }}>
          {menuItems.map((item) => {
            const isActive = activeMenu === item.id;
            const IconComponent = item.icon;

            return (
              <div
                key={item.id}
                className={`menu-item-container ${isActive ? "active" : ""}`}
                onClick={() => onSelectMenu(item.id)}
                style={{
                  padding: "16px 20px",
                  background: isActive ? "linear-gradient(135deg, #C8F135 0%, #96C000 100%)" : "transparent",
                  borderRadius: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                  cursor: "pointer",
                  boxShadow: isActive ? "0px 5px 17px rgba(31, 168, 143, 0.30)" : "none",
                  transition: "all 0.2s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <IconComponent
                    size={20}
                    color={isActive ? "#1A2332" : "#7AAAB4"}
                    strokeWidth={2.5}
                    style={{ flexShrink: 0 }}
                  />
                  <div
                    className="menu-item-text"
                    style={{
                      color: isActive ? "#1A2332" : "#7AAAB4",
                      fontSize: "16.5px",
                      fontWeight: isActive ? "700" : "500",
                      fontFamily: "Space Grotesk, sans-serif",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.label}
                  </div>
                </div>

                {item.hasBadge && (
                  <div
                    className="menu-badge"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "4px 10px",
                      borderRadius: "12px",
                      background: isActive ? "rgba(26, 35, 50, 0.15)" : "rgba(245, 158, 11, 0.15)",
                      border: isActive ? "1px solid rgba(26, 35, 50, 0.25)" : "1px solid rgba(245, 158, 11, 0.3)",
                      flexShrink: 0,
                    }}
                  >
                    <Flame
                      size={14}
                      color={isActive ? "#1A2332" : "#F59E0B"}
                      fill={isActive ? "rgba(26, 35, 50, 0.3)" : "rgba(245, 158, 11, 0.3)"}
                    />
                    <span
                      style={{
                        color: isActive ? "#1A2332" : "#F59E0B",
                        fontSize: "13.5px",
                        fontWeight: "700",
                        fontFamily: "Space Mono, monospace",
                      }}
                    >
                      {currentStreak}
                    </span>
                  </div>
                )}
              </div>
            );
          })}

          {/* TOMBOL LOGOUT */}
          <div
            className="menu-item-container logout-btn"
            onClick={handleLogout}
            style={{
              padding: "16px 20px",
              background: "transparent",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: "12px",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <LogOut
                size={20}
                color="#EF4444"
                strokeWidth={2.5}
                style={{ flexShrink: 0 }}
              />
              <div
                className="menu-item-text"
                style={{
                  color: "#EF4444",
                  fontSize: "16.5px",
                  fontWeight: "600",
                  fontFamily: "Space Grotesk, sans-serif",
                  whiteSpace: "nowrap",
                }}
              >
                Log Out
              </div>
            </div>
          </div>
          {/* END LOGOUT */}

        </div>
      </div>
    </>
  );
};

export default PatientSidebar;