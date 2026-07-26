import React from 'react';
import { useExerciseStore } from '../store/zustand/useExerciseStore';
import { useExerciseTracker } from '../hooks/useExerciseTracker';

export default function DebugExerciseUI() {
  // --- RUN TRACKER HOOK ---
  useExerciseTracker();

  // --- STORE SUBSCRIPTION ---
  const exerciseType = useExerciseStore((state) => state.exerciseType);
  const repCount = useExerciseStore((state) => state.repCount);
  const phase = useExerciseStore((state) => state.phase);
  const avgDistance = useExerciseStore((state) => state.avgDistance);
  const thresholdOpen = useExerciseStore((state) => state.thresholdOpen);
  const thresholdClose = useExerciseStore((state) => state.thresholdClose);
  const resetExercise = useExerciseStore((state) => state.resetExercise);

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        backgroundColor: '#0F172A',
        color: '#F8FAFC',
        border: '2px solid #38BDF8',
        borderRadius: '12px',
        padding: '16px',
        fontFamily: 'monospace',
        fontSize: '13px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
        minWidth: '240px',
        pointerEvents: 'auto',
      }}
    >
      <div style={{ fontWeight: 'bold', color: '#38BDF8', marginBottom: '8px', fontSize: '14px' }}>
        ⚙️ EXERCISE DEBUGGER
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div>
          <span style={{ color: '#94A3B8' }}>Exercise: </span>
          <span style={{ fontWeight: 'bold', color: '#FACC15' }}>{exerciseType}</span>
        </div>
        <div>
          <span style={{ color: '#94A3B8' }}>Phase: </span>
          <span
            style={{
              fontWeight: 'bold',
              color: phase === 'WAITING_CLOSE' ? '#4ADE80' : '#F87171',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              padding: '2px 6px',
              borderRadius: '4px',
            }}
          >
            {phase}
          </span>
        </div>
        <div>
          <span style={{ color: '#94A3B8' }}>Reps: </span>
          <span style={{ fontWeight: 'bold', fontSize: '18px', color: '#38BDF8' }}>{repCount}</span>
        </div>
        <div style={{ marginTop: '4px', paddingTop: '4px', borderTop: '1px solid #334155' }}>
          <span style={{ color: '#94A3B8' }}>Avg Distance: </span>
          <span style={{ fontWeight: 'bold', color: '#E2E8F0' }}>{avgDistance.toFixed(3)}</span>
        </div>
        <div style={{ fontSize: '11px', color: '#64748B' }}>
          Target: Open &gt; {thresholdOpen} | Close &lt; {thresholdClose}
        </div>
        <button
          onClick={resetExercise}
          style={{
            marginTop: '8px',
            padding: '6px 12px',
            backgroundColor: '#EF4444',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '12px',
          }}
        >
          Reset Reps
        </button>
      </div>
    </div>
  );
}
