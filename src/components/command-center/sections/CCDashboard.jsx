import React, { useMemo, useState } from 'react';

export default function CCDashboard({ teams, users, TEAM_STATUS, PAYMENT_STATUS }) {
  const [collegeModalOpen, setCollegeModalOpen] = useState(false);
  const [collegeEventFilter, setCollegeEventFilter] = useState('all');
  const [collegeSort, setCollegeSort] = useState('desc');

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

  /* Overall unique colleges from all teams */
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

  /* Modal analytics by selected event filter */
  const filteredTeams = useMemo(() => {
    if (collegeEventFilter === 'all') return teams;
    return teams.filter((t) => t.eventType === collegeEventFilter);
  }, [teams, collegeEventFilter]);

  const collegeDetails = useMemo(() => {
    const map = filteredTeams.reduce((acc, t) => {
      const raw = (t.collegeName || '').trim();
      if (!raw) return acc;
      const key = raw.toLowerCase();
      if (!acc[key]) {
        acc[key] = {
          name: raw,
          count: 0,
          designathonCount: 0,
          hackathonCount: 0,
          teams: [],
        };
      }
      acc[key].count += 1;
      if (t.eventType === 'designathon') acc[key].designathonCount += 1;
      if (t.eventType === 'hackathon') acc[key].hackathonCount += 1;
      acc[key].teams.push({
        teamId: t.teamId || 'Pending',
        teamName: t.teamName || 'Unnamed Team',
        eventType: t.eventType || 'unknown',
      });
      return acc;
    }, {});

    const arr = Object.values(map).sort((a, b) => {
      if (collegeSort === 'asc') return a.count - b.count || a.name.localeCompare(b.name);
      return b.count - a.count || a.name.localeCompare(b.name);
    });

    return arr;
  }, [filteredTeams, collegeSort]);

  const modalTotalColleges = collegeDetails.length;
  const modalTotalTeams = filteredTeams.length;
  const modalTopCollege = collegeDetails.length ? collegeDetails[0] : null;
  const modalLeastCollege = collegeDetails.length ? collegeDetails[collegeDetails.length - 1] : null;
  const modalMaxCount = collegeDetails.length ? Math.max(...collegeDetails.map((c) => c.count)) : 1;

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
        <button
          type="button"
          className="cc-stat-card cc-stat-card-action"
          onClick={() => setCollegeModalOpen(true)}
        >
          <div className="cc-stat-value">View</div>
          <div className="cc-stat-label">Debut College Details</div>
        </button>
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

      {collegeModalOpen && (
        <div className="cc-modal-overlay" onClick={() => setCollegeModalOpen(false)}>
          <div className="cc-modal-card cc-college-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cc-card-header">
              <div>
                <h3>Debut College Details</h3>
                <span className="cc-stat-label">College-wise breakdown by event and teams</span>
              </div>
              <button className="cc-btn-sm reject" onClick={() => setCollegeModalOpen(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="cc-card-body">
              <div className="cc-college-controls">
                <div className="cc-filter-bar" style={{ marginBottom: 0 }}>
                  <button className={`cc-filter-btn ${collegeEventFilter === 'all' ? 'active' : ''}`} onClick={() => setCollegeEventFilter('all')}>All</button>
                  <button className={`cc-filter-btn ${collegeEventFilter === 'designathon' ? 'active' : ''}`} onClick={() => setCollegeEventFilter('designathon')}>Designathon</button>
                  <button className={`cc-filter-btn ${collegeEventFilter === 'hackathon' ? 'active' : ''}`} onClick={() => setCollegeEventFilter('hackathon')}>Hackathon</button>
                </div>
                <div className="cc-college-sort-wrap">
                  <label htmlFor="college-sort">Sort</label>
                  <select id="college-sort" className="cc-input" value={collegeSort} onChange={(e) => setCollegeSort(e.target.value)}>
                    <option value="desc">Highest to Lowest</option>
                    <option value="asc">Lowest to Highest</option>
                  </select>
                </div>
              </div>

              <div className="cc-stats-grid cc-college-summary-grid">
                <div className="cc-stat-card">
                  <div className="cc-stat-value">{modalTotalColleges}</div>
                  <div className="cc-stat-label">Total Colleges</div>
                </div>
                <div className="cc-stat-card blue">
                  <div className="cc-stat-value">{modalTotalTeams}</div>
                  <div className="cc-stat-label">Total Teams (Selected Filter)</div>
                </div>
                <div className="cc-stat-card green">
                  <div className="cc-stat-value">{modalTopCollege ? modalTopCollege.count : 0}</div>
                  <div className="cc-stat-label">Most: {modalTopCollege ? modalTopCollege.name : '—'}</div>
                </div>
                <div className="cc-stat-card orange">
                  <div className="cc-stat-value">{modalLeastCollege ? modalLeastCollege.count : 0}</div>
                  <div className="cc-stat-label">Least: {modalLeastCollege ? modalLeastCollege.name : '—'}</div>
                </div>
              </div>

              {collegeDetails.length > 0 ? (
                <>
                  <div className="cc-college-chart" style={{ marginBottom: 18 }}>
                    {collegeDetails.map((item) => {
                      const pct = Math.max((item.count / modalMaxCount) * 100, 6);
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

                  <div className="cc-table-wrap">
                    <table className="cc-table">
                      <thead>
                        <tr>
                          <th>College</th>
                          <th>Total</th>
                          <th>Designathon</th>
                          <th>Hackathon</th>
                          <th>Team Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        {collegeDetails.map((item) => (
                          <tr key={`table-${item.name}`}>
                            <td>{item.name}</td>
                            <td>{item.count}</td>
                            <td>{item.designathonCount}</td>
                            <td>{item.hackathonCount}</td>
                            <td>
                              {item.teams.map((tm) => `${tm.teamName} (${tm.teamId}) - ${tm.eventType}`).join(', ')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div style={{ color: 'rgba(255,255,255,0.45)' }}>No teams found for this filter.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
