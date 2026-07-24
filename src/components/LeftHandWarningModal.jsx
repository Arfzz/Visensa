import React from "react";
import { useVisionStore } from "../store/zustand/VisionStore";

export function LeftHandWarningModal() {
  const isLeftHandWarning = useVisionStore((state) => state.isLeftHandWarning);

  if (!isLeftHandWarning) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: "24px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 50,
        width: "90%",
        maxWidth: "460px",
        padding: "16px 20px",
        borderRadius: "16px",
        background: "rgba(220, 38, 38, 0.35)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        border: "1px solid rgba(248, 113, 113, 0.5)",
        boxShadow: "0 10px 30px 0 rgba(220, 38, 38, 0.3)",
        display: "flex",
        alignItems: "center",
        gap: "14px",
        color: "#ffffff",
        animation: "fadeInDown 0.3s ease-out forwards",
      }}
    >
      <div
        style={{
          width: "44px",
          height: "44px",
          borderRadius: "12px",
          background: "rgba(239, 68, 68, 0.8)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          boxShadow: "0 0 15px rgba(239, 68, 68, 0.5)",
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </div>

      <div>
        <h4
          style={{
            margin: 0,
            fontSize: "15px",
            fontWeight: "700",
            letterSpacing: "0.3px",
            color: "#ffffff",
          }}
        >
          Tangan Kiri Terdeteksi
        </h4>
        <p
          style={{
            margin: "2px 0 0 0",
            fontSize: "13px",
            color: "rgba(255, 255, 255, 0.9)",
            lineHeight: "1.4",
          }}
        >
          Sistem menggunakan model Lengan Kanan. Harap gunakan Tangan Kanan untuk mengontrol.
        </p>
      </div>
    </div>
  );
}

export default LeftHandWarningModal;
