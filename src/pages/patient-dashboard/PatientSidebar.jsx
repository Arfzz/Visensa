import { useMemo } from "react";
import { LayoutDashboard, Clock, Gamepad2, Settings, Flame, Clock1, Clock10Icon } from "lucide-react";
import visensaLogo from "../../assets/visensa-logo.png";
import { useStreakStore } from "../../features/gamification/streak/useStreakStore";

export const PatientSidebar = ({ activeMenu, onSelectMenu }) => {
  // --- STORE DATA ---
  const currentStreak = useStreakStore((state) => state.currentStreak);

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
    <div
      style={{
        width: "300px",
        minWidth: "300px",
        background: "#151E2C",
        borderRadius: "24px",
        display: "flex",
        flexDirection: "column",
        padding: "35px 25px",
        boxSizing: "border-box",
        zIndex: 10,
        boxShadow: "0px 13px 80px rgba(226, 236, 249, 0.25)",
      }}
    >
      {/* --- SIDEBAR HEADER LOGO --- */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", paddingLeft: "15px", marginBottom: "45px" }}>
        <img src={visensaLogo} alt="VISENSA" style={{ width: "24px", height: "auto" }} />
        <div style={{ color: "#F0FAFB", fontSize: "26px", fontWeight: "800", letterSpacing: "1px", fontFamily: "Space Grotesk, sans-serif" }}>
          VISENSA
        </div>
      </div>

      {/* --- MENU NAVIGATION LIST WITH ICONS --- */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", flex: 1 }}>
        {menuItems.map((item) => {
          const isActive = activeMenu === item.id;
          const IconComponent = item.icon;

          return (
            <div
              key={item.id}
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

              {/* STREAK NUMERIC BADGE FOR INTERACTIVE PRACTICE */}
              {item.hasBadge && (
                <div
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
      </div>

      {/* --- FOOTER RECOVERY STREAK BLOCK --- */}
      <div style={{ background: "rgba(59, 184, 176, 0.06)", border: "1.5px solid rgba(59, 184, 176, 0.16)", borderRadius: "16px", padding: "18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <Flame size={18} color="#3ED8C8" fill="rgba(62, 216, 200, 0.2)" />
          <div style={{ color: "#3ED8C8", fontSize: "15.5px", fontWeight: "700", fontFamily: "Space Grotesk, sans-serif" }}>
            {currentStreak}-day streak
          </div>
        </div>
        <div style={{ color: "#7AAAB4", fontSize: "14px", fontFamily: "Space Grotesk, sans-serif" }}>
          Consistent recovery progress.
        </div>
      </div>
    </div>
  );
};

export default PatientSidebar;
