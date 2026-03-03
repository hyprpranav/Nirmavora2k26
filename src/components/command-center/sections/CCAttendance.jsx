import React, { useState } from 'react';
import TeamDetailCard from '../TeamDetailCard';

export default function CCAttendance({ teams, onConfirmAttendance, attendanceClosed, canEdit }) {
  const approved = teams.filter(t => t.status === 'approved');
  const present = approved.filter(t => t.attendanceStatus === 'present').length;
  const partial = approved.filter(t => t.attendanceStatus === 'partial').length;
  const absent = approved.filter(t => t.attendanceStatus === 'absent').length;
  const notMarked = approved.length - present - partial - absent;
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [filter, setFilter] = useState('all');

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

      <div className="cc-table-wrap">
        <table className="cc-table">
          <thead>
            <tr>
              <th>Team ID</th>
              <th>Team Name</th>
              <th>Event</th>
              <th>Members</th>
              <th>Attendance</th>
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
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', padding: 20 }}>
                  No teams found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
