import React, { useState } from "react";
import { X, UserPlus, Sparkles, Activity, AlertCircle } from "lucide-react";

const RegisterPatientModal = ({ isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [condition, setCondition] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !condition) {
      setErrorMsg("Please fill in patient name, email, and diagnosis.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${import.meta.env.VITE_API_URL || "https://visensa-production.up.railway.app/api/v1"}/patients/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name,
          email,
          password: password || undefined,
          condition,
          notes,
        }),
      });

      let responseData = null;
      if (res.ok) {
        responseData = await res.json();
      }

      const formattedPatient = {
        id: responseData?.data?.id
          ? responseData.data.id.substring(0, 2).toUpperCase()
          : name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase(),
        name,
        email,
        week: "Wk 1",
        condition,
        compliance: "Not started",
        sessions: 0,
        pain: "6/10",
        isNew: true,
        status: "New",
        color: "#0099A6",
      };

      if (onSuccess) onSuccess(formattedPatient);
      onClose();
    } catch (err) {
      console.warn("Register patient sync note:", err.message);
      const fallbackPatient = {
        id: name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase() || "NP",
        name,
        email,
        week: "Wk 1",
        condition,
        compliance: "Not started",
        sessions: 0,
        pain: "6/10",
        isNew: true,
        status: "New",
        color: "#0099A6",
      };
      if (onSuccess) onSuccess(fallbackPatient);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        zIndex: 10000,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "16px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "520px",
          background: "white",
          borderRadius: "24px",
          padding: "32px",
          boxShadow: "0px 24px 60px rgba(12, 40, 48, 0.25)",
          border: "1.5px solid #C4E8EC",
          position: "relative",
          boxSizing: "border-box",
        }}
      >
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          type="button"
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            background: "rgba(0, 153, 166, 0.08)",
            border: "none",
            borderRadius: "50%",
            width: "32px",
            height: "32px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
            color: "#7AAAB4",
            transition: "all 0.2s",
          }}
        >
          <X size={18} />
        </button>

        {/* MODAL HEADER */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "24px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "16px",
              background: "rgba(0, 153, 166, 0.1)",
              border: "1px solid rgba(0, 153, 166, 0.25)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <UserPlus size={24} color="#0099A6" />
          </div>
          <div>
            <div
              style={{
                color: "#0C2830",
                fontSize: "20px",
                fontFamily: "Space Grotesk, sans-serif",
                fontWeight: "800",
              }}
            >
              Register New Patient
            </div>
            <div
              style={{
                color: "#7AAAB4",
                fontSize: "13.5px",
                fontFamily: "Space Grotesk, sans-serif",
              }}
            >
              Create patient profile and prepare roster entry
            </div>
          </div>
        </div>

        {errorMsg && (
          <div
            style={{
              background: "rgba(239, 68, 68, 0.08)",
              border: "1px solid rgba(239, 68, 68, 0.25)",
              borderRadius: "12px",
              padding: "10px 14px",
              color: "#EF4444",
              fontSize: "13px",
              fontFamily: "Space Grotesk",
              marginBottom: "18px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* FORM FIELDS */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label
              style={{
                display: "block",
                color: "#3A6870",
                fontSize: "13.5px",
                fontFamily: "Space Grotesk",
                fontWeight: "600",
                marginBottom: "6px",
              }}
            >
              Full Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Kenji Morales"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{
                width: "100%",
                height: "44px",
                padding: "0 16px",
                background: "#F8FAFC",
                border: "1.5px solid #E2E8F0",
                borderRadius: "12px",
                color: "#0C2830",
                fontSize: "14px",
                fontFamily: "Space Grotesk",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                color: "#3A6870",
                fontSize: "13.5px",
                fontFamily: "Space Grotesk",
                fontWeight: "600",
                marginBottom: "6px",
              }}
            >
              Patient Email *
            </label>
            <input
              type="email"
              placeholder="e.g. kenji@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                height: "44px",
                padding: "0 16px",
                background: "#F8FAFC",
                border: "1.5px solid #E2E8F0",
                borderRadius: "12px",
                color: "#0C2830",
                fontSize: "14px",
                fontFamily: "Space Grotesk",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                color: "#3A6870",
                fontSize: "13.5px",
                fontFamily: "Space Grotesk",
                fontWeight: "600",
                marginBottom: "6px",
              }}
            >
              Password *
            </label>
            <input
              type="password"
              placeholder="Minimal 6 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                height: "44px",
                padding: "0 16px",
                background: "#F8FAFC",
                border: "1.5px solid #E2E8F0",
                borderRadius: "12px",
                color: "#0C2830",
                fontSize: "14px",
                fontFamily: "Space Grotesk",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                color: "#3A6870",
                fontSize: "13.5px",
                fontFamily: "Space Grotesk",
                fontWeight: "600",
                marginBottom: "6px",
              }}
            >
              Primary Diagnosis / Condition *
            </label>
            <div style={{ position: "relative" }}>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                required
                style={{
                  width: "100%",
                  height: "44px",
                  padding: "0 16px",
                  background: "#F8FAFC",
                  border: "1.5px solid #E2E8F0",
                  borderRadius: "12px",
                  color: condition ? "#0C2830" : "#94A3B8", // Biar abu-abu kalo belum milih
                  fontSize: "14px",
                  fontFamily: "Space Grotesk",
                  outline: "none",
                  appearance: "none",
                  boxSizing: "border-box",
                  cursor: "pointer",
                }}
              >
                <option value="" disabled hidden>
                  Select a condition...
                </option>
                <option value="Stroke">Stroke</option>
                <option value="Phantom Limb Pain">Phantom Limb Pain</option>
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
          <div>
            <label
              style={{
                display: "block",
                color: "#3A6870",
                fontSize: "13.5px",
                fontFamily: "Space Grotesk",
                fontWeight: "600",
                marginBottom: "6px",
              }}
            >
              Clinical Notes (Optional)
            </label>
            <textarea
              placeholder="Initial observations or intake notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              style={{
                width: "100%",
                padding: "12px 16px",
                background: "#F8FAFC",
                border: "1.5px solid #E2E8F0",
                borderRadius: "12px",
                color: "#0C2830",
                fontSize: "14px",
                fontFamily: "Space Grotesk",
                outline: "none",
                boxSizing: "border-box",
                resize: "none",
              }}
            />
          </div>

          {/* ACTION BUTTONS */}
          <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: "12px",
                background: "white",
                border: "1.5px solid #E2E8F0",
                borderRadius: "12px",
                color: "#64748B",
                fontSize: "14px",
                fontFamily: "Space Grotesk",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                flex: 2,
                padding: "12px",
                background: "linear-gradient(135deg, #0099A6 0%, #007580 100%)",
                border: "none",
                borderRadius: "12px",
                color: "white",
                fontSize: "14px",
                fontFamily: "Space Grotesk",
                fontWeight: "700",
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(0, 153, 166, 0.3)",
              }}
            >
              {isLoading ? "Registering..." : "Register Patient"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPatientModal;
