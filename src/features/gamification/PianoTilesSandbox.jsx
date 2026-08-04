import React, { useState } from 'react';
import { PianoTilesGame } from './PianoTilesGame';
import { RhythmExerciseView } from './RhythmExerciseView';

export const PianoTilesSandbox = () => {
  const [viewMode, setViewMode] = useState('3d'); // '3d' | 'standalone'

  if (viewMode === '3d') {
    return (
      <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
        {/* Toggle Mode Button (Top-Left) */}
        <button
          onClick={() => setViewMode('standalone')}
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            zIndex: 200,
            padding: '10px 18px',
            fontSize: '0.82rem',
            fontWeight: 700,
            backgroundColor: '#0F172A',
            color: '#FFFFFF',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '20px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}
        >
          🔄 Switch to 2D Standalone Mode
        </button>

        <RhythmExerciseView />
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        backgroundColor: '#F1F5F9',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        boxSizing: 'border-box',
        position: 'relative',
      }}
    >
      <button
        onClick={() => setViewMode('3d')}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          padding: '10px 18px',
          fontSize: '0.82rem',
          fontWeight: 700,
          backgroundColor: '#00B8B0',
          color: '#FFFFFF',
          border: 'none',
          borderRadius: '20px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,184,176,0.3)',
        }}
      >
        ✋ Switch to 3D Hand Overlay Mode
      </button>

      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <h1
          style={{
            fontSize: '1.8rem',
            fontWeight: 800,
            color: '#0F172A',
            margin: '0 0 8px 0',
            fontFamily: "'Space Grotesk', system-ui, sans-serif",
          }}
        >
          Gamification Sandbox: Piano Tiles
        </h1>
        <p style={{ color: '#475569', margin: 0, fontSize: '0.9rem', fontWeight: 500 }}>
          Standalone testing environment for Task-Oriented Training &amp; 75 BPM Rhythmic Auditory Stimulation.
        </p>
      </div>

      <PianoTilesGame bgmUrl="/musics/fairytale.mp3" showSensitivityHUD={true} />
    </div>
  );
};

export default PianoTilesSandbox;
