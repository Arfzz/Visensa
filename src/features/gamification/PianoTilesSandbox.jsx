import React, { useState } from 'react';
import { PianoTilesGame } from './PianoTilesGame';
import { RhythmExerciseView } from './RhythmExerciseView';

export const PianoTilesSandbox = () => {
  const [viewMode, setViewMode] = useState('3d'); // '3d' | 'standalone'

  if (viewMode === '3d') {
    return (
      <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
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
      <PianoTilesGame bgmUrl="/musics/fairytale.mp3" showSensitivityHUD={true} />
    </div>
  );
};

export default PianoTilesSandbox;
