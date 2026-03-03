import React, { useState } from 'react';

const ADMIN_CODE = '8870881397';

export default function CCSettings({ settings, onToggle, onDeleteParticipants, onDeleteOrganisers, onDeleteAll }) {
  const [codeModal, setCodeModal] = useState(null);  // { action, label }
  const [codeInput, setCodeInput] = useState('');
  const [codeError, setCodeError] = useState('');
  const [busy, setBusy] = useState(false);

  const toggles = [
    { key: 'registrationOpen', label: 'Registration Open', desc: 'Controls registration access on the landing page and event selection' },
    { key: 'feedbackEnabled', label: 'Feedback Enabled', desc: 'Shows a floating feedback button on every page' },
    { key: 'attendanceEnabled', label: 'Attendance Enabled', desc: 'Allows organisers to mark attendance. Admin can always mark attendance.' },
    { key: 'organisersCanEdit', label: 'Organisers Can Edit', desc: 'When ON, coordinators can edit team details. Admin can always edit.' },
  ];

  const dangerActions = [
    { key: 'participants', label: 'Delete All Participants Data', desc: 'Removes all team registrations, payment data, and participant records.', icon: 'fa-users-slash', handler: onDeleteParticipants },
    { key: 'organisers', label: 'Remove All Organisers', desc: 'Removes all organiser accounts. Admin account is not affected.', icon: 'fa-user-shield', handler: onDeleteOrganisers },
    { key: 'all', label: 'Delete Overall Data', desc: 'Deletes ALL data — participants, teams, organisers. Only admin account remains.', icon: 'fa-skull-crossbones', handler: onDeleteAll },
  ];

  function openCodeModal(action) {
    setCodeModal(action);
    setCodeInput('');
    setCodeError('');
  }

  async function handleConfirmCode() {
    const cleaned = codeInput.replace(/\s/g, '');
    if (cleaned !== ADMIN_CODE) {
      setCodeError('Invalid code. Operation cancelled.');
      return;
    }
    setBusy(true);
    try {
      await codeModal.handler();
      setCodeModal(null);
      alert(`✅ ${codeModal.label} — completed successfully.`);
    } catch (err) {
      setCodeError('Operation failed: ' + (err.message || 'Unknown error'));
    }
    setBusy(false);
  }

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

      {/* ═══ Danger Zone ═══ */}
      <div className="cc-danger-zone">
        <h3><i className="fas fa-exclamation-triangle" style={{ marginRight: 8, color: '#f44336' }}></i>Danger Zone</h3>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem', marginBottom: 16 }}>
          These actions are <strong style={{ color: '#f44336' }}>irreversible</strong>. A 10-digit verification code is required. Download a backup from the Export section before proceeding.
        </p>
        {dangerActions.map(a => (
          <div key={a.key} className="cc-danger-row">
            <div>
              <strong><i className={`fas ${a.icon}`} style={{ marginRight: 6 }}></i>{a.label}</strong>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', margin: '2px 0 0' }}>{a.desc}</p>
            </div>
            <button className="cc-danger-btn" onClick={() => openCodeModal(a)}>
              <i className="fas fa-trash-alt"></i> Delete
            </button>
          </div>
        ))}
      </div>

      {/* ═══ Code Verification Modal ═══ */}
      {codeModal && (
        <div className="cc-modal-overlay" onClick={() => !busy && setCodeModal(null)}>
          <div className="cc-modal-card cc-danger-modal" onClick={e => e.stopPropagation()}>
            <div className="cc-modal-header">
              <h3 style={{ color: '#f44336' }}><i className="fas fa-exclamation-triangle" style={{ marginRight: 8 }}></i>{codeModal.label}</h3>
            </div>
            <div className="cc-modal-body">
              <p style={{ marginBottom: 12, color: 'rgba(255,255,255,0.6)' }}>{codeModal.desc}</p>
              <p style={{ marginBottom: 16, fontWeight: 600, color: '#f44336' }}>
                This action cannot be undone. Enter the 10-digit admin verification code to proceed.
              </p>
              <input
                type="text"
                placeholder="Enter 10-digit code"
                value={codeInput}
                onChange={e => { setCodeInput(e.target.value); setCodeError(''); }}
                maxLength={12}
                style={{ width: '100%', padding: '12px 14px', background: 'var(--dark-base, #0d0d0d)', border: '1px solid #f4433688', borderRadius: 8, color: '#fff', fontSize: '1.1rem', fontFamily: 'monospace', textAlign: 'center', letterSpacing: 3 }}
                autoFocus
                disabled={busy}
              />
              {codeError && <p style={{ color: '#f44336', fontSize: '0.85rem', marginTop: 8 }}>{codeError}</p>}
            </div>
            <div className="cc-modal-footer">
              <button className="cc-btn-secondary" onClick={() => setCodeModal(null)} disabled={busy}>Cancel</button>
              <button className="cc-danger-btn" onClick={handleConfirmCode} disabled={busy || !codeInput.trim()}>
                {busy ? 'Deleting…' : 'Confirm & Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
