import React from 'react';

export default function CCSettings({ settings, onToggle }) {
  const toggles = [
    { key: 'registrationOpen', label: 'Registration Open', desc: 'Controls registration access on the landing page and event selection' },
    { key: 'feedbackEnabled', label: 'Feedback Enabled', desc: 'Shows a floating feedback button on every page' },
    { key: 'attendanceEnabled', label: 'Attendance Enabled', desc: 'Allows organisers to mark attendance. Admin can always mark attendance.' },
    { key: 'organisersCanEdit', label: 'Organisers Can Edit', desc: 'When ON, coordinators can edit team details. Admin can always edit.' },
  ];

  return (
    <div className="cc-section">
      <h3><i className="fas fa-cog" style={{ marginRight: 8, color: '#6366f1' }}></i>Platform Settings</h3>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem', marginBottom: 16 }}>
        Toggle platform-wide settings below. Only the <strong style={{ color: '#F5B301' }}>Master Admin</strong> can change these.
      </p>
      {toggles.map(t => (
        <div key={t.key} className="cc-toggle-row">
          <div>
            <label>{t.label}</label>
            {t.desc && <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', margin: '2px 0 0' }}>{t.desc}</p>}
          </div>
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
