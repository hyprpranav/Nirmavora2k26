import React from 'react';

export default function CCAttendance({ teams, onMarkAttendance }) {
  const approved = teams.filter(t => t.status === 'approved');
  const present = approved.filter(t => t.attendance).length;

  return (
    <>
      <div className="cc-stats-grid" style={{ marginBottom: 20 }}>
        <div className="cc-stat-card green">
          <div className="cc-stat-value">{present}</div>
          <div className="cc-stat-label">Present</div>
        </div>
        <div className="cc-stat-card red">
          <div className="cc-stat-value">{approved.length - present}</div>
          <div className="cc-stat-label">Absent</div>
        </div>
        <div className="cc-stat-card">
          <div className="cc-stat-value">{approved.length}</div>
          <div className="cc-stat-label">Approved Teams</div>
        </div>
      </div>

      <div className="cc-table-wrap">
        <table className="cc-table">
          <thead>
            <tr>
              <th>Team ID</th>
              <th>Team Name</th>
              <th>Event</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {approved.map(team => (
              <tr key={team.id}>
                <td>{team.teamId || '—'}</td>
                <td>{team.teamName}</td>
                <td style={{ textTransform: 'capitalize' }}>{team.eventType}</td>
                <td>
                  <span className={`cc-status ${team.attendance ? 'present' : 'absent'}`}>
                    {team.attendance ? 'Present' : 'Absent'}
                  </span>
                </td>
                <td>
                  {!team.attendance ? (
                    <button className="cc-btn-sm approve" onClick={() => onMarkAttendance(team.id, true)}>
                      Mark Present
                    </button>
                  ) : (
                    <button className="cc-btn-sm reject" onClick={() => onMarkAttendance(team.id, false)}>
                      Undo
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {approved.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', padding: 20 }}>
                  No approved teams yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
