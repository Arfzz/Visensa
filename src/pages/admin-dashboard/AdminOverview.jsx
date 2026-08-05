import React, { useState } from 'react';

const mockPatientsData = [
  { id: "RJ", name: "Robert Johnson", condition: "Phantom Limb Pain", totalExercises: 24, lastPainScore: 4, previousPainScore: 5, compliance: "87%", status: "Excellent", lastActive: "Today", week: "Wk 4", isNew: false, color: "#0099A6" },
  { id: "ML", name: "Margaret Lim", condition: "Stroke Recovery", totalExercises: 12, lastPainScore: 7, previousPainScore: 7, compliance: "55%", status: "Warning", lastActive: "4 days ago", week: "Wk 2", isNew: false, color: "#D4A843" },
  { id: "AK", name: "Ahmad Kusuma", condition: "Phantom Limb Pain", totalExercises: 56, lastPainScore: 3, previousPainScore: 4, compliance: "98%", status: "Excellent", lastActive: "Today", week: "Wk 7", isNew: false, color: "#4BA882" },
  { id: "DS", name: "Diana Santoso", condition: "Stroke Recovery", totalExercises: 8, lastPainScore: 8, previousPainScore: 9, compliance: "100%", status: "Good", lastActive: "Yesterday", week: "Wk 1", isNew: false, color: "#0099A6" },
  { id: "KM", name: "Kenji Morales", condition: "Stroke / Hemiparesis", totalExercises: 0, lastPainScore: 6, previousPainScore: 6, compliance: "New", status: "New", lastActive: "Just joined", week: "Wk 4", isNew: true, color: "#0099A6" },
];

const getStatusColor = (status) => {
  switch(status) {
    case "Excellent": return { bg: "rgba(75, 168, 130, 0.10)", text: "#4BA882", border: "rgba(75, 168, 130, 0.20)" };
    case "Good": return { bg: "rgba(62, 216, 200, 0.10)", text: "#3ED8C8", border: "rgba(62, 216, 200, 0.20)" };
    case "Warning": return { bg: "rgba(212, 168, 67, 0.10)", text: "#D4A843", border: "rgba(212, 168, 67, 0.20)" };
    case "New": return { bg: "rgba(0, 153, 166, 0.10)", text: "#0099A6", border: "rgba(0, 153, 166, 0.20)" };
    default: return { bg: "#F1F5F9", text: "#64748B", border: "#E2E8F0" };
  }
};

const AdminOverview = ({ onSelectPatient, onAddPatient, patients = mockPatientsData }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPatients = patients.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handlePatientClick = (patient) => {
    if (onSelectPatient) {
      onSelectPatient(patient);
    }
  };

  return (
    <div style={{ width: "100%", boxSizing: "border-box" }}>
      
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px", marginTop: "4px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ color: "#0C2830", fontSize: "32px", fontFamily: "Space Grotesk, sans-serif", fontWeight: "800", marginBottom: "6px" }}>Clinic Overview</div>
          <div style={{ color: "#7AAAB4", fontSize: "15px", fontFamily: "Space Grotesk, sans-serif", fontWeight: "500" }}>Manage your patients and monitor their progress.</div>
        </div>
        
        <div style={{ position: "relative" }}>
          <svg style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)" }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7AAAB4" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input 
            type="text" 
            placeholder="Search patients..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ padding: "14px 20px 14px 44px", width: "260px", borderRadius: "14px", border: "1.5px solid #C4E8EC", outline: "none", fontSize: "15px", fontFamily: "Space Grotesk", color: "#0C2830", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}
          />
        </div>
      </div>

      {/* Top Stats Cards */}
      <div style={{ display: "flex", gap: "24px", marginBottom: "40px", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 250px", background: "white", padding: "28px", borderRadius: "24px", border: "1px solid #E2E8F0", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <div style={{ width: "40px", height: "40px", background: "rgba(0, 153, 166, 0.1)", borderRadius: "12px", display: "flex", justifyContent: "center", alignItems: "center" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0099A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </div>
            <div style={{ color: "#7AAAB4", fontSize: "14px", fontFamily: "Space Mono", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px" }}>Total Patients</div>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
            <span style={{ color: "#0C2830", fontSize: "40px", fontFamily: "Space Grotesk", fontWeight: "700" }}>{patients.length}</span>
            <span style={{ color: "#4BA882", fontSize: "14px", fontWeight: "600" }}>+2 this month</span>
          </div>
        </div>

        <div style={{ flex: "1 1 250px", background: "white", padding: "28px", borderRadius: "24px", border: "1px solid #E2E8F0", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <div style={{ width: "40px", height: "40px", background: "rgba(75, 168, 130, 0.1)", borderRadius: "12px", display: "flex", justifyContent: "center", alignItems: "center" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4BA882" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
            </div>
            <div style={{ color: "#7AAAB4", fontSize: "14px", fontFamily: "Space Mono", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px" }}>Avg Compliance</div>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
            <span style={{ color: "#0C2830", fontSize: "40px", fontFamily: "Space Grotesk", fontWeight: "700" }}>85%</span>
            <span style={{ color: "#D4A843", fontSize: "14px", fontWeight: "600" }}>Needs attention</span>
          </div>
        </div>

        <div style={{ flex: "1 1 250px", background: "white", padding: "28px", borderRadius: "24px", border: "1px solid #E2E8F0", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <div style={{ width: "40px", height: "40px", background: "rgba(62, 216, 200, 0.1)", borderRadius: "12px", display: "flex", justifyContent: "center", alignItems: "center" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3ED8C8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            </div>
            <div style={{ color: "#7AAAB4", fontSize: "14px", fontFamily: "Space Mono", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px" }}>Total Sessions</div>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
            <span style={{ color: "#0C2830", fontSize: "40px", fontFamily: "Space Grotesk", fontWeight: "700" }}>100</span>
            <span style={{ color: "#4BA882", fontSize: "14px", fontWeight: "600" }}>+12 this week</span>
          </div>
        </div>
      </div>

      {/* Patients Table */}
      <div style={{ background: "white", borderRadius: "24px", border: "1px solid #E2E8F0", boxShadow: "0 4px 20px rgba(0,0,0,0.02)", overflow: "hidden" }}>
        <div style={{ padding: "24px 30px", borderBottom: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ color: "#0C2830", fontSize: "18px", fontFamily: "Space Grotesk", fontWeight: "700" }}>Patient List</div>
          <button 
            onClick={onAddPatient}
            style={{ padding: "10px 20px", background: "#0099A6", color: "white", border: "none", borderRadius: "10px", fontSize: "14px", fontFamily: "Space Grotesk", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", transition: "background 0.2s" }} 
            onMouseEnter={(e) => e.target.style.background = "#008a95"} 
            onMouseLeave={(e) => e.target.style.background = "#0099A6"}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Add Patient
          </button>
        </div>

        <div style={{ width: "100%", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "#F8FAFC" }}>
                <th style={{ padding: "16px 30px", color: "#7AAAB4", fontSize: "13px", fontFamily: "Space Mono", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px", borderBottom: "1px solid #E2E8F0" }}>Patient</th>
                <th style={{ padding: "16px 30px", color: "#7AAAB4", fontSize: "13px", fontFamily: "Space Mono", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px", borderBottom: "1px solid #E2E8F0" }}>Condition</th>
                <th style={{ padding: "16px 30px", color: "#7AAAB4", fontSize: "13px", fontFamily: "Space Mono", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px", borderBottom: "1px solid #E2E8F0" }}>Sessions</th>
                <th style={{ padding: "16px 30px", color: "#7AAAB4", fontSize: "13px", fontFamily: "Space Mono", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px", borderBottom: "1px solid #E2E8F0" }}>Last Pain Score</th>
                <th style={{ padding: "16px 30px", color: "#7AAAB4", fontSize: "13px", fontFamily: "Space Mono", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px", borderBottom: "1px solid #E2E8F0" }}>Status</th>
                <th style={{ padding: "16px 30px", color: "#7AAAB4", fontSize: "13px", fontFamily: "Space Mono", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px", borderBottom: "1px solid #E2E8F0" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((patient, index) => {
                const statusTheme = getStatusColor(patient.status || (patient.isNew ? "New" : "Good"));
                const lastPain = patient.lastPainScore || (patient.pain ? parseInt(patient.pain) : 4);
                const prevPain = patient.previousPainScore || lastPain + 1;
                const painTrend = lastPain < prevPain ? "↓" : lastPain > prevPain ? "↑" : "—";
                const painTrendColor = lastPain < prevPain ? "#4BA882" : lastPain > prevPain ? "#C0574C" : "#7AAAB4";

                return (
                  <tr 
                    key={patient.id} 
                    onClick={() => handlePatientClick(patient)}
                    style={{ borderBottom: index !== filteredPatients.length - 1 ? "1px solid #E2E8F0" : "none", cursor: "pointer", transition: "background 0.2s" }} 
                    onMouseEnter={(e) => e.currentTarget.style.background = "#F8FAFC"} 
                    onMouseLeave={(e) => e.currentTarget.style.background = "white"}
                  >
                    <td style={{ padding: "20px 30px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "rgba(0, 153, 166, 0.1)", color: "#0099A6", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "14px", fontFamily: "Space Grotesk", fontWeight: "700", flexShrink: 0 }}>
                          {patient.id}
                        </div>
                        <div>
                          <div style={{ color: "#0C2830", fontSize: "16px", fontFamily: "Space Grotesk", fontWeight: "700", marginBottom: "4px" }}>{patient.name}</div>
                          <div style={{ color: "#7AAAB4", fontSize: "13px", fontFamily: "Space Grotesk" }}>{patient.lastActive || "Recently active"}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "20px 30px", color: "#3A6870", fontSize: "15px", fontFamily: "Space Grotesk", fontWeight: "500" }}>
                      {patient.condition}
                    </td>
                    <td style={{ padding: "20px 30px" }}>
                      <div style={{ color: "#0C2830", fontSize: "16px", fontFamily: "Space Mono", fontWeight: "600", marginBottom: "4px" }}>{patient.totalExercises ?? patient.sessions ?? 0}</div>
                      <div style={{ color: "#7AAAB4", fontSize: "13px", fontFamily: "Space Mono" }}>{patient.compliance} comp.</div>
                    </td>
                    <td style={{ padding: "20px 30px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ color: "#D4A843", fontSize: "20px", fontFamily: "Space Mono", fontWeight: "700" }}>{lastPain}</span>
                        <span style={{ color: "#7AAAB4", fontSize: "14px", fontFamily: "Space Mono" }}>/10</span>
                        {(patient.totalExercises > 0 || patient.sessions > 0) && (
                          <span style={{ color: painTrendColor, fontSize: "14px", fontFamily: "Space Mono", fontWeight: "600", marginLeft: "4px" }}>
                            {painTrend}
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: "20px 30px" }}>
                      <div style={{ display: "inline-flex", padding: "6px 12px", background: statusTheme.bg, color: statusTheme.text, border: `1px solid ${statusTheme.border}`, borderRadius: "100px", fontSize: "13px", fontFamily: "Space Mono", fontWeight: "700" }}>
                        {patient.status || (patient.isNew ? "New" : "Active")}
                      </div>
                    </td>
                    <td style={{ padding: "20px 30px" }}>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePatientClick(patient);
                        }}
                        style={{ padding: "8px 16px", background: "white", border: "1px solid #C4E8EC", color: "#0099A6", borderRadius: "8px", fontSize: "14px", fontFamily: "Space Grotesk", fontWeight: "600", cursor: "pointer", transition: "all 0.2s" }}
                        onMouseEnter={(e) => { e.target.style.background = "#0099A6"; e.target.style.color = "white"; }}
                        onMouseLeave={(e) => { e.target.style.background = "white"; e.target.style.color = "#0099A6"; }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredPatients.length === 0 && (
            <div style={{ padding: "40px", textAlign: "center", color: "#7AAAB4", fontSize: "15px", fontFamily: "Space Grotesk" }}>
              No patients found matching "{searchQuery}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
