import React from "react";
import { Bell, AlertTriangle, CheckCircle2, TrendingUp, Info, X } from "lucide-react";

const NotificationBell = ({ notifications = [], showNotif, setShowNotif, onMarkAllRead }) => {
  const unreadCount = notifications.filter((n) => n.unread).length;

  const getIcon = (item) => {
    if (item.type === "alert" || item.title?.includes("compliance")) {
      return <AlertTriangle size={18} color="#D4A843" />;
    }
    if (item.type === "success" || item.title?.includes("complete")) {
      return <CheckCircle2 size={18} color="#4BA882" />;
    }
    if (item.type === "progress" || item.title?.includes("progress")) {
      return <TrendingUp size={18} color="#0099A6" />;
    }
    return <Info size={18} color="#3ED8C8" />;
  };

  return (
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
          border: showNotif ? "1.5px solid #0099A6" : "1.5px solid transparent",
          transition: "all 0.2s ease",
        }}
      >
        <Bell size={20} color="#4A5568" />
        {unreadCount > 0 && (
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
        )}
      </div>

      {showNotif && (
        <div
          style={{
            position: "absolute",
            top: "60px",
            right: "0",
            width: "420px",
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
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  color: "#0C2830",
                  fontSize: "18px",
                  fontFamily: "Space Grotesk, sans-serif",
                  fontWeight: "700",
                }}
              >
                Notifications
              </div>
              {unreadCount > 0 && (
                <div
                  style={{
                    background: "#D4A843",
                    color: "white",
                    padding: "2px 10px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontFamily: "Space Mono, monospace",
                    fontWeight: "700",
                  }}
                >
                  {unreadCount}
                </div>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div
                onClick={onMarkAllRead}
                style={{
                  color: "#0099A6",
                  fontSize: "13.5px",
                  fontFamily: "Space Grotesk, sans-serif",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Mark all read
              </div>
              <X
                onClick={() => setShowNotif(false)}
                style={{ cursor: "pointer" }}
                size={18}
                color="#7AAAB4"
              />
            </div>
          </div>

          <div style={{ maxHeight: "400px", overflowY: "auto" }}>
            {notifications.length > 0 ? (
              notifications.map((notif, idx) => (
                <div
                  key={notif.id || idx}
                  style={{
                    padding: "16px 24px",
                    borderBottom: "1px solid #F1F5F9",
                    background: notif.unread ? "rgba(12, 40, 48, 0.02)" : "white",
                    display: "flex",
                    gap: "14px",
                  }}
                >
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      minWidth: "36px",
                      background: "rgba(0, 153, 166, 0.08)",
                      borderRadius: "10px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {getIcon(notif)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        color: "#0C2830",
                        fontSize: "14.5px",
                        fontFamily: "Space Grotesk, sans-serif",
                        fontWeight: notif.unread ? "700" : "500",
                        marginBottom: "4px",
                      }}
                    >
                      {notif.title}
                    </div>
                    <div
                      style={{
                        color: "#7AAAB4",
                        fontSize: "13px",
                        fontFamily: "Space Grotesk, sans-serif",
                        lineHeight: "1.4",
                        marginBottom: "6px",
                      }}
                    >
                      {notif.desc || notif.message}
                    </div>
                    <div
                      style={{
                        color: "#94A3B8",
                        fontSize: "11.5px",
                        fontFamily: "Space Mono, monospace",
                      }}
                    >
                      {notif.time || "Recent"}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div
                style={{
                  padding: "30px",
                  textAlign: "center",
                  color: "#7AAAB4",
                  fontSize: "14px",
                  fontFamily: "Space Grotesk",
                }}
              >
                No notifications right now.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
