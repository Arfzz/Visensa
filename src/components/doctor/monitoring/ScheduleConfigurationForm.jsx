import React, { useState, useEffect } from "react";
import { getTomorrowDateString } from "../../../utils/scheduleCalculator";
import { Save, Database } from "lucide-react";

const ScheduleConfigurationForm = ({
  onSaveInitialProgram,
  patient,
  activeProgram,
  weeklySchedule,
}) => {
  const [planFreq, setPlanFreq] = useState(weeklySchedule?.frequencyPerWeek || 3);
  // --- SYNC DATABASE PROGRAM & SCHEDULE DATA ---
  useEffect(() => {
    if (activeProgram) {
      if (activeProgram.startDate) {
        setPlanStartDate(activeProgram.startDate);
      }
      if (activeProgram.programDurationWeeks) {
        setPlanDuration(Number(activeProgram.programDurationWeeks));
      }
    }
    if (weeklySchedule) {
      if (weeklySchedule.frequencyPerWeek) {
        setPlanFreq(Number(weeklySchedule.frequencyPerWeek));
      }
    }
  }, [activeProgram, weeklySchedule, patient?.id]);

  const handleFrequencyChange = (val) => {
    setPlanFreq(Number(val));
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (onSaveInitialProgram) {
      onSaveInitialProgram({
        patientId: patient?.id,
        frequencyPerWeek: planFreq,
        restIntervalDays: 1, // Defaulting to 1 as it is no longer configurable
        programDurationWeeks: planDuration,
        startDate: planStartDate,
      });
    }
  };

  return (
    <div
      style={{
        background: "white",
        padding: "30px",
        borderRadius: "20px",
        border: "1.5px solid #C4E8EC",
        boxShadow: "0 4px 15px rgba(0,0,0,0.02)",
      }}
    >
      {/* FORM TITLE BAR */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <div
            style={{
              color: "#0C2830",
              fontSize: "18px",
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: "700",
            }}
          >
            Schedule Configuration
          </div>
          <div
            style={{
              color: "#7AAAB4",
              fontSize: "13.5px",
              fontFamily: "Space Grotesk, sans-serif",
              marginTop: "2px",
            }}
          >
            Prescribe therapy parameters and project calendar schedule for {patient?.name || "patient"}
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
          {activeProgram?.id && (
            <div
              style={{
                background: "rgba(75, 168, 130, 0.1)",
                border: "1px solid rgba(75, 168, 130, 0.3)",
                borderRadius: "20px",
                padding: "4px 14px",
                color: "#4BA882",
                fontSize: "12.5px",
                fontFamily: "Space Mono, monospace",
                fontWeight: "700",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Database size={13} />
              <span>Database Synced</span>
            </div>
          )}
          <div
            style={{
              background: "rgba(0, 153, 166, 0.08)",
              border: "1px solid rgba(0, 153, 166, 0.2)",
              borderRadius: "20px",
              padding: "4px 14px",
              color: "#0099A6",
              fontSize: "13px",
              fontFamily: "Space Mono, monospace",
              fontWeight: "700",
            }}
          >
            Fixed 8-Exercise Protocol
          </div>
        </div>
      </div>

      {/* 3 COMPACT INPUTS GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        {/* 1. Frequency */}
        <div>
          <div
            style={{
              fontSize: "14px",
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: "600",
              color: "#3A6870",
              marginBottom: "8px",
            }}
          >
            Frequency per week
          </div>
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
              fontFamily: "Space Grotesk, sans-serif",
              outline: "none",
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
        </div>


        {/* 2. Program Duration */}
        <div>
          <div
            style={{
              fontSize: "14px",
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: "600",
              color: "#3A6870",
              marginBottom: "8px",
            }}
          >
            Program duration
          </div>
          <select
            value={planDuration}
            onChange={(e) => setPlanDuration(Number(e.target.value))}
            style={{
              width: "100%",
              height: "46px",
              padding: "0 16px",
              background: "#F8FAFC",
              border: "1.5px solid #E2E8F0",
              borderRadius: "12px",
              color: "#0C2830",
              fontSize: "14.5px",
              fontFamily: "Space Grotesk, sans-serif",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value={1}>1 Week</option>
            <option value={2}>2 Weeks</option>
            <option value={4}>4 Weeks (1 Month)</option>
            <option value={8}>8 Weeks (2 Months)</option>
          </select>
        </div>

        {/* 3. Start Date */}
        <div>
          <div
            style={{
              fontSize: "14px",
              fontFamily: "Space Grotesk, sans-serif",
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
              fontFamily: "Space Grotesk, sans-serif",
              outline: "none",
              boxSizing: "border-box",
              cursor: "pointer",
            }}
          />
        </div>
      </div>


      {/* SAVE INITIAL PROGRAM ACTION BUTTON */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={handleSubmit}
          type="button"
          style={{
            padding: "14px 28px",
            background: "linear-gradient(135deg, #0099A6 0%, #007580 100%)",
            border: "none",
            borderRadius: "14px",
            color: "white",
            fontSize: "15px",
            fontFamily: "Space Grotesk, sans-serif",
            fontWeight: "700",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            boxShadow: "0 4px 18px rgba(0, 153, 166, 0.3)",
            transition: "all 0.2s ease",
          }}
        >
          <Save size={18} />
          <span>{activeProgram ? "Update Therapy Program" : "Save Initial Program & Publish"}</span>
        </button>
      </div>
    </div>
  );
};

export default ScheduleConfigurationForm;
