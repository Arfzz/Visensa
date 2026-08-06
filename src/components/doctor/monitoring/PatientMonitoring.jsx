import React, { useState } from "react";
import PatientHeader from "./PatientHeader";
import PatientFeedbackOverview from "./PatientFeedbackOverview";
import UnassignedAlertBanner from "./UnassignedAlertBanner";
import ScheduleConfigurationForm from "./ScheduleConfigurationForm";

const PatientMonitoring = ({
  patient,
  activeProgram,
  weeklySchedule,
  patientFeedbackLogs = [],
  handleAssignInitialProgram,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState("Feedback");

  if (!patient) {
    return (
      <div
        style={{
          padding: "60px",
          textAlign: "center",
          color: "#7AAAB4",
          background: "white",
          borderRadius: "20px",
          border: "1.5px solid #C4E8EC",
          fontFamily: "Space Grotesk, sans-serif",
        }}
      >
        No patient selected.
      </div>
    );
  }

  // --- PROGRAM ASSIGNMENT GUARD ---
  const hasAssignedProgram = Boolean(
    activeProgram ||
    (patient?.patient_programs && patient.patient_programs.length > 0) ||
    patient?.has_program ||
    patient?.isNew === false
  );
  const isUnassigned = !hasAssignedProgram;

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", boxSizing: "border-box" }}>
      
      {/* PATIENT HEADER */}
      <PatientHeader
        patient={patient}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* CONDITIONAL RENDERING: NEW / UNASSIGNED PATIENT VS ACTIVE PATIENT */}
      {isUnassigned ? (
        /* STATE 1: NEW / UNASSIGNED PATIENT */
        <div className="new-patient-flow" style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
          <UnassignedAlertBanner patient={patient} />
          <ScheduleConfigurationForm
            onSaveInitialProgram={handleAssignInitialProgram}
            patient={patient}
            activeProgram={activeProgram}
            weeklySchedule={weeklySchedule}
          />
        </div>
      ) : activeTab === "Plan" ? (
        /* STATE 2B: THERAPY PLAN RE-CONFIGURATION */
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
          <ScheduleConfigurationForm
            onSaveInitialProgram={handleAssignInitialProgram}
            patient={patient}
            activeProgram={activeProgram}
            weeklySchedule={weeklySchedule}
          />
        </div>
      ) : (
        /* STATE 2A: ACTIVE / COMPLETED PATIENT FEEDBACK & PROGRESS */
        <PatientFeedbackOverview
          feedbackLogs={patientFeedbackLogs}
          patient={patient}
          program={activeProgram}
          weeklySchedule={weeklySchedule}
        />
      )}
    </div>
  );
};

export default PatientMonitoring;
