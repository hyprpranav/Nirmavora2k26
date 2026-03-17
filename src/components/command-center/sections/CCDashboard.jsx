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

  /* Revenue: sum of memberCount × 350 for all VERIFIED payment teams */
  const totalRevenue = teams
    .filter(t => t.paymentStatus === PAYMENT_STATUS.VERIFIED)
    .reduce((sum, t) => sum + ((t.memberCount || 3) * 350), 0);

  /* Total participants (sum of memberCount across all teams) */
  const totalParticipants = teams.reduce((sum, t) => sum + (t.memberCount || 1), 0);

  /* Count of manually added teams */
  const manualTeams = teams.filter(t => t.addedBy === 'admin' || t.addedBy === 'coordinator').length;

  /* College analytics: team count per college */
  const collegeMap = teams.reduce((acc, t) => {
    const raw = (t.collegeName || '').trim();
    if (!raw) return acc;
    const key = raw.toLowerCase();
    if (!acc[key]) {
      acc[key] = { name: raw, count: 0 };
    }
    acc[key].count += 1;
    return acc;
  }, {});

  const collegeStats = Object.values(collegeMap).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  const totalColleges = collegeStats.length;
  const maxCollegeCount = collegeStats.length ? collegeStats[0].count : 1;

  return (
    <>
      <div className="cc-stats-grid">
        <div className="cc-stat-card">
          <div className="cc-stat-value">{total}</div>
          <div className="cc-stat-label">Total Teams</div>
        </div>
        <div className="cc-stat-card purple" style={{ borderLeft: '3px solid #a78bfa' }}>
          <div className="cc-stat-value">{totalParticipants}</div>
          <div className="cc-stat-label">Total Participants</div>
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
        <div className="cc-stat-card gold" style={{ borderLeft: '3px solid var(--accent)' }}>
          <div className="cc-stat-value">₹{totalRevenue.toLocaleString('en-IN')}</div>
          <div className="cc-stat-label">Revenue Collected</div>
        </div>
        {manualTeams > 0 && (
          <div className="cc-stat-card purple">
            <div className="cc-stat-value">{manualTeams}</div>
            <div className="cc-stat-label">Manual Adds</div>
          </div>
        )}
        <div className="cc-stat-card blue">
          <div className="cc-stat-value">{totalColleges}</div>
          <div className="cc-stat-label">Unique Colleges</div>
        </div>
      </div>

      <div className="cc-section">
        <h3>College-wise Team Distribution</h3>
        {collegeStats.length > 0 ? (
          <div className="cc-college-chart">
            {collegeStats.map((item) => {
              const pct = Math.max((item.count / maxCollegeCount) * 100, 6);
              return (
                <div className="cc-college-row" key={item.name}>
                  <div className="cc-college-meta">
                    <span className="cc-college-name">{item.name}</span>
                    <span className="cc-college-count">{item.count}</span>
                  </div>
                  <div className="cc-college-track">
                    <div className="cc-college-bar" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ color: 'rgba(255,255,255,0.45)' }}>No college data available yet.</div>
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
