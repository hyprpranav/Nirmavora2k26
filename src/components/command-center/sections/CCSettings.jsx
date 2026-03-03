import React from 'react';

export default function CCSettings({ settings, onToggle }) {
  const toggles = [
    { key: 'registrationOpen', label: 'Registration Open' },
    { key: 'feedbackEnabled', label: 'Feedback Enabled' },
    { key: 'attendanceEnabled', label: 'Attendance Enabled' },
  ];

  return (
    <div className="cc-section">
      <h3><i className="fas fa-cog" style={{ marginRight: 8, color: '#6366f1' }}></i>Platform Settings</h3>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem', marginBottom: 16 }}>
        Toggle platform-wide settings below.
      </p>
      {toggles.map(t => (
        <div key={t.key} className="cc-toggle-row">
          <label>{t.label}</label>
          <button
            className={`cc-toggle${settings[t.key] ? ' on' : ''}`}
            onClick={() => onToggle(t.key)}
          >
            {settings[t.key] ? 'ON' : 'OFF'}
          </button>
        </div>
      ))}
    </div>
  );
}
