import React, { useState, useEffect } from "react";

export default function DebugArmPanel() {
  const [rot, setRot] = useState({ x: 0, y: 0, z: 0 });

  // Lempar datanya ke global window biar bisa dibaca langsung sama useFrame
  useEffect(() => {
    window.debugLowerArm = rot;
  }, [rot]);

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      left: '20px',
      zIndex: 9999,
      background: 'rgba(20, 20, 20, 0.85)',
      color: '#fff',
      padding: '20px',
      borderRadius: '10px',
      fontFamily: 'sans-serif',
      minWidth: '250px',
      backdropFilter: 'blur(5px)',
      border: '1px solid #444'
    }}>
      <h3 style={{ marginTop: 0, borderBottom: '1px solid #444', paddingBottom: '10px' }}>
        Debug Lower Arm
      </h3>
      
      {['x', 'y', 'z'].map((axis) => (
        <div key={axis} style={{ marginBottom: '15px' }}>
          <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', textTransform: 'uppercase', fontSize: '14px' }}>
            <span>Sumbu {axis}</span>
            <span style={{ color: '#00ffcc' }}>{rot[axis].toFixed(2)}</span>
          </label>
          <input 
            type="range" 
            min="-3.14" 
            max="3.14" 
            step="0.05" 
            value={rot[axis]} 
            onChange={e => setRot({ ...rot, [axis]: parseFloat(e.target.value) })} 
            style={{ width: '100%', cursor: 'pointer' }}
          />
        </div>
      ))}

      <button 
        onClick={() => setRot({ x: 0, y: 0, z: 0 })}
        style={{
          width: '100%', padding: '10px', marginTop: '10px', 
          background: '#dc3545', color: 'white', border: 'none', 
          borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold'
        }}
      >
        Reset ke 0
      </button>
    </div>
  );
}