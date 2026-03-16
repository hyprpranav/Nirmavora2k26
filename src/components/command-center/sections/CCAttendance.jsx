import React, { useState } from 'react';
import TeamDetailCard from '../TeamDetailCard';

const ADMIN_CODE = '8870881397';

export default function CCAttendance({
  teams,
  onConfirmAttendance,
  attendanceClosed,
  canEdit,
  isAdmin,
  onResetTeamAttendance,
  onResetAllAttendance,
}) {
  const approved = teams.filter(t => t.status === 'approved');
  const present = approved.filter(t => t.attendanceStatus === 'present').length;
  const partial = approved.filter(t => t.attendanceStatus === 'partial').length;
  const absent = approved.filter(t => t.attendanceStatus === 'absent').length;
  const notMarked = approved.length - present - partial - absent;
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [filter, setFilter] = useState('all');
  const [pinModal, setPinModal] = useState(null);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [resetting, setResetting] = useState(false);

  const filtered = approved.filter(t => {
    if (filter === 'all') return true;
    if (filter === 'present') return t.attendanceStatus === 'present';
    if (filter === 'partial') return t.attendanceStatus === 'partial';
    if (filter === 'absent') return t.attendanceStatus === 'absent';
    if (filter === 'not_marked') return !t.attendanceStatus || t.attendanceStatus === 'not_marked';
    return true;
  });

  if (attendanceClosed) {
    return (
      <div className="cc-section" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <i className="fas fa-lock" style={{ fontSize: '2.5rem', color: 'rgba(255,255,255,0.15)', marginBottom: 16 }}></i>
        <h3 style={{ color: '#FF9800', marginBottom: 8 }}>Attendance Closed</h3>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
          Attendance marking is currently disabled by the admin. Contact the admin to enable it.
        </p>
      </div>
    );
  }

  async function confirmReset() {
    const cleaned = pin.replace(/\s/g, '');
    if (cleaned !== ADMIN_CODE) {
      setPinError('Invalid code. Operation cancelled.');
      return;
    }

    setResetting(true);
    try {
      if (pinModal?.mode === 'single' && pinModal?.team && onResetTeamAttendance) {
        await onResetTeamAttendance(pinModal.team);
      }
      if (pinModal?.mode === 'all' && onResetAllAttendance) {
        await onResetAllAttendance();
      }
      setPinModal(null);
      setPin('');
      setPinError('');
    } finally {
      setResetting(false);
    }
  }

  return (
    <>
      {selectedTeam && (
        <TeamDetailCard
          team={selectedTeam}
          onClose={() => setSelectedTeam(null)}
          onSave={async () => {}}
          canEdit={false}
          canAttendance={true}
          onConfirmAttendance={async (docId, memberAtt, status) => {
            await onConfirmAttendance(docId, memberAtt, status);
            setSelectedTeam(null);
          }}
        />
      )}

      <div className="cc-stats-grid" style={{ marginBottom: 20 }}>
        <div className="cc-stat-card green">
          <div className="cc-stat-value">{present}</div>
          <div className="cc-stat-label">Present</div>
        </div>
        <div className="cc-stat-card" style={{ borderColor: '#F5B301' }}>
          <div className="cc-stat-value" style={{ color: '#F5B301' }}>{partial}</div>
          <div className="cc-stat-label">Partial</div>
        </div>
        <div className="cc-stat-card red">
          <div className="cc-stat-value">{absent}</div>
          <div className="cc-stat-label">Absent</div>
        </div>
        <div className="cc-stat-card">
          <div className="cc-stat-value">{notMarked}</div>
          <div className="cc-stat-label">Not Marked</div>
        </div>
        <div className="cc-stat-card">
          <div className="cc-stat-value">{approved.length}</div>
          <div className="cc-stat-label">Approved Teams</div>
        </div>
      </div>

      <div className="cc-filter-bar">
        {['all', 'present', 'partial', 'absent', 'not_marked'].map(f => (
          <button
            key={f}
            className={`cc-filter-btn${filter === f ? ' active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'not_marked' ? 'Not Marked' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem', margin: '8px 0 16px' }}>
        Click a team to open the attendance card and mark each member individually.
      </p>

      {isAdmin && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
          <button
            className="cc-btn-sm reject"
            onClick={() => {
              setPinModal({ mode: 'all' });
              setPin('');
              setPinError('');
            }}
          >
            <i className="fas fa-undo-alt"></i> Restore All Attendance
          </button>
          <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.42)', alignSelf: 'center' }}>
            Admin only: requires 10-digit verification code.
          </span>
        </div>
      )}

      <div className="cc-table-wrap">
        <table className="cc-table">
          <thead>
            <tr>
              <th>Team ID</th>
              <th>Team Name</th>
              <th>Event</th>
              <th>Members</th>
              <th>Attendance</th>
              {isAdmin && <th>Admin Action</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.map(team => (
              <tr
                key={team.id}
                className="cc-team-row-clickable"
                onClick={() => setSelectedTeam(team)}
                style={{ cursor: 'pointer' }}
              >
                <td>{team.teamId || '—'}</td>
                <td>{team.teamName}</td>
                <td style={{ textTransform: 'capitalize' }}>{team.eventType}</td>
                <td>{team.memberCount || '—'}</td>
                <td>
                  <span className={`cc-status ${team.attendanceStatus || 'not_marked'}`}>
                    {team.attendanceStatus === 'present' ? '✓ Present' :
                     team.attendanceStatus === 'partial' ? '◐ Partial' :
                     team.attendanceStatus === 'absent' ? '✗ Absent' :
                     'Not Marked'}
                  </span>
                </td>
                {isAdmin && (
                  <td onClick={(e) => e.stopPropagation()}>
                    <button
                      className="cc-btn-sm"
                      style={{ background: 'rgba(245,179,1,0.16)', color: '#F5B301', border: '1px solid rgba(245,179,1,0.45)' }}
                      disabled={!team.attendanceStatus || team.attendanceStatus === 'not_marked'}
                      onClick={() => {
                        setPinModal({ mode: 'single', team });
                        setPin('');
                        setPinError('');
                      }}
                    >
                      Unmark Team
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={isAdmin ? 6 : 5} style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', padding: 20 }}>
                  No teams found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pinModal && (
        <div className="cc-modal-overlay" style={{ zIndex: 1100 }} onClick={() => !resetting && setPinModal(null)}>
          <div className="cc-modal-card cc-danger-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div className="cc-modal-header">
              <h3 style={{ color: '#F5B301' }}>
                <i className="fas fa-shield-alt" style={{ marginRight: 8 }}></i>
                Verify Admin Action
              </h3>
            </div>
            <div className="cc-modal-body">
              <p style={{ marginBottom: 12, color: 'rgba(255,255,255,0.6)' }}>
                {pinModal.mode === 'all'
                  ? 'This will restore attendance for all approved teams.'
                  : `This will unmark attendance for ${pinModal.team?.teamName || 'this team'}.`}
              </p>
              <p style={{ marginBottom: 14, fontWeight: 600, color: '#F5B301' }}>
                Enter the 10-digit admin verification code.
              </p>
              <input
                type="text"
                placeholder="Enter 10-digit code"
                value={pin}
                onChange={(e) => { setPin(e.target.value); setPinError(''); }}
                maxLength={12}
                style={{ width: '100%', padding: '12px 14px', background: 'var(--dark-base, #0d0d0d)', border: '1px solid #F5B30188', borderRadius: 8, color: '#fff', fontSize: '1.1rem', fontFamily: 'monospace', textAlign: 'center', letterSpacing: 3 }}
                autoFocus
                disabled={resetting}
              />
              {pinError && <p style={{ color: '#f44336', fontSize: '0.85rem', marginTop: 8 }}>{pinError}</p>}
            </div>
            <div className="cc-modal-footer" style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="cc-btn-sm" onClick={() => setPinModal(null)} disabled={resetting}>Cancel</button>
              <button className="cc-btn-sm approve" onClick={confirmReset} disabled={resetting}>
                {resetting ? 'Processing…' : 'Confirm Restore'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
