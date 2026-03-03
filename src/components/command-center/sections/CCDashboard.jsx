import React from 'react';

export default function CCDashboard({ teams, users, TEAM_STATUS, PAYMENT_STATUS }) {
  const total = teams.length;
  const approved = teams.filter(t => t.status === TEAM_STATUS.APPROVED).length;
  const pending = teams.filter(t => t.status === TEAM_STATUS.PENDING).length;
  const waitlisted = teams.filter(t => t.status === TEAM_STATUS.WAITLISTED).length;
  const cancelled = teams.filter(t => t.status === TEAM_STATUS.CANCELLED).length;
  const paidVerified = teams.filter(t => t.paymentStatus === PAYMENT_STATUS.VERIFIED).length;
  const designathon = teams.filter(t => t.eventType === 'designathon').length;
  const hackathon = teams.filter(t => t.eventType === 'hackathon').length;
  const attended = teams.filter(t => t.attendance).length;
  const totalUsers = users ? users.length : 0;

  return (
    <>
      <div className="cc-stats-grid">
        <div className="cc-stat-card">
          <div className="cc-stat-value">{total}</div>
          <div className="cc-stat-label">Total Teams</div>
        </div>
        <div className="cc-stat-card green">
          <div className="cc-stat-value">{approved}</div>
          <div className="cc-stat-label">Approved</div>
        </div>
        <div className="cc-stat-card orange">
          <div className="cc-stat-value">{pending}</div>
          <div className="cc-stat-label">Pending</div>
        </div>
        <div className="cc-stat-card gold">
          <div className="cc-stat-value">{waitlisted}</div>
          <div className="cc-stat-label">Waitlisted</div>
        </div>
        <div className="cc-stat-card red">
          <div className="cc-stat-value">{cancelled}</div>
          <div className="cc-stat-label">Cancelled</div>
        </div>
        <div className="cc-stat-card blue">
          <div className="cc-stat-value">{paidVerified}</div>
          <div className="cc-stat-label">Payments Verified</div>
        </div>
        <div className="cc-stat-card purple">
          <div className="cc-stat-value">{designathon}</div>
          <div className="cc-stat-label">Designathon</div>
        </div>
        <div className="cc-stat-card">
          <div className="cc-stat-value">{hackathon}</div>
          <div className="cc-stat-label">Hackathon</div>
        </div>
        <div className="cc-stat-card green">
          <div className="cc-stat-value">{attended}</div>
          <div className="cc-stat-label">Attended</div>
        </div>
        {users && (
          <div className="cc-stat-card blue">
            <div className="cc-stat-value">{totalUsers}</div>
            <div className="cc-stat-label">Total Users</div>
          </div>
        )}
      </div>

      <div className="cc-section">
        <h3>Recent Teams</h3>
        <div className="cc-table-wrap">
          <table className="cc-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Team Name</th>
                <th>Event</th>
                <th>College</th>
                <th>Status</th>
                <th>Payment</th>
              </tr>
            </thead>
            <tbody>
              {teams.slice(0, 10).map(t => (
                <tr key={t.id}>
                  <td>{t.teamId || '—'}</td>
                  <td>{t.teamName}</td>
                  <td style={{ textTransform: 'capitalize' }}>{t.eventType}</td>
                  <td>{t.collegeName}</td>
                  <td><span className={`cc-status ${t.status}`}>{t.status}</span></td>
                  <td><span className={`cc-status ${t.paymentStatus || 'not_paid'}`}>{t.paymentStatus || 'not_paid'}</span></td>
                </tr>
              ))}
              {teams.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', padding: 20 }}>No teams yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
