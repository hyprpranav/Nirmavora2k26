import React, { useState } from 'react';

export default function CCTeams({
  teams,
  onApprove,
  onWaitlist,
  onCancel,
  onEdit,
  TEAM_STATUS,
  showPayments,
  onVerifyPayment,
  onRejectPayment,
  PAYMENT_STATUS,
}) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [paymentView, setPaymentView] = useState(false);

  const filters = ['all', 'pending', 'approved', 'waitlisted', 'cancelled'];

  const filtered = teams.filter(t => {
    const matchFilter = filter === 'all' || t.status === filter;
    const matchSearch =
      !search ||
      (t.teamName || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.teamId || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.collegeName || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.leaderName || '').toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  function startEdit(team) {
    setEditId(team.id);
    setEditForm({
      teamName: team.teamName,
      collegeName: team.collegeName,
      leaderName: team.leaderName,
      leaderPhone: team.leaderPhone,
    });
  }

  async function saveEdit() {
    await onEdit(editId, editForm);
    setEditId(null);
  }

  return (
    <>
      {/* Toggle between teams and payments view (admin only) */}
      {showPayments && (
        <div className="cc-filter-bar" style={{ marginBottom: 8 }}>
          <button
            className={`cc-filter-btn${!paymentView ? ' active' : ''}`}
            onClick={() => setPaymentView(false)}
          >
            Teams
          </button>
          <button
            className={`cc-filter-btn${paymentView ? ' active' : ''}`}
            onClick={() => setPaymentView(true)}
          >
            Payments
          </button>
        </div>
      )}

      {!paymentView ? (
        <>
          <div className="cc-search">
            <i className="fas fa-search"></i>
            <input
              placeholder="Search teams, colleges, leaders…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="cc-filter-bar">
            {filters.map(f => (
              <button
                key={f}
                className={`cc-filter-btn${filter === f ? ' active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)} (
                {f === 'all' ? teams.length : teams.filter(t => t.status === f).length})
              </button>
            ))}
          </div>

          <div className="cc-table-wrap">
            <table className="cc-table">
              <thead>
                <tr>
                  <th>Team ID</th>
                  <th>Team Name</th>
                  <th>Event</th>
                  <th>College</th>
                  <th>Leader</th>
                  <th>Members</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(team => (
                  <tr key={team.id}>
                    <td>{team.teamId || '—'}</td>
                    <td>
                      {editId === team.id ? (
                        <input
                          className="cc-input"
                          value={editForm.teamName}
                          onChange={e => setEditForm({ ...editForm, teamName: e.target.value })}
                          style={{ padding: '5px 8px', fontSize: '0.8rem' }}
                        />
                      ) : (
                        team.teamName
                      )}
                    </td>
                    <td style={{ textTransform: 'capitalize' }}>{team.eventType}</td>
                    <td>
                      {editId === team.id ? (
                        <input
                          className="cc-input"
                          value={editForm.collegeName}
                          onChange={e => setEditForm({ ...editForm, collegeName: e.target.value })}
                          style={{ padding: '5px 8px', fontSize: '0.8rem' }}
                        />
                      ) : (
                        team.collegeName
                      )}
                    </td>
                    <td>{team.leaderName}</td>
                    <td>{team.memberCount || team.members?.length || '—'}</td>
                    <td>
                      <span className={`cc-status ${team.status}`}>{team.status}</span>
                    </td>
                    <td>
                      <div className="cc-actions">
                        {editId === team.id ? (
                          <>
                            <button className="cc-btn-sm approve" onClick={saveEdit}>Save</button>
                            <button className="cc-btn-sm reject" onClick={() => setEditId(null)}>Cancel</button>
                          </>
                        ) : (
                          <>
                            {team.status === 'pending' && (
                              <>
                                <button className="cc-btn-sm approve" onClick={() => onApprove(team)}>
                                  Approve
                                </button>
                                <button className="cc-btn-sm waitlist" onClick={() => onWaitlist(team)}>
                                  Waitlist
                                </button>
                              </>
                            )}
                            {team.status !== 'cancelled' && (
                              <button className="cc-btn-sm reject" onClick={() => onCancel(team)}>
                                Cancel
                              </button>
                            )}
                            <button className="cc-btn-sm edit" onClick={() => startEdit(team)}>
                              Edit
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', padding: 20 }}>
                      No teams found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        /* ─── Payments View ─── */
        <div className="cc-table-wrap">
          <table className="cc-table">
            <thead>
              <tr>
                <th>Team ID</th>
                <th>Team Name</th>
                <th>TXN ID</th>
                <th>Screenshot</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {teams
                .filter(t => t.paymentStatus && t.paymentStatus !== PAYMENT_STATUS.NOT_PAID)
                .map(t => (
                  <tr key={t.id}>
                    <td>{t.teamId || '—'}</td>
                    <td>{t.teamName}</td>
                    <td>{t.paymentTxnId || '—'}</td>
                    <td>
                      {t.paymentScreenshotLink ? (
                        <a
                          href={t.paymentScreenshotLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#6366f1' }}
                        >
                          View
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>
                      <span className={`cc-status ${t.paymentStatus}`}>{t.paymentStatus}</span>
                    </td>
                    <td>
                      <div className="cc-actions">
                        {t.paymentStatus === PAYMENT_STATUS.UPLOADED && (
                          <>
                            <button className="cc-btn-sm approve" onClick={() => onVerifyPayment(t.id)}>
                              Verify
                            </button>
                            <button className="cc-btn-sm reject" onClick={() => onRejectPayment(t.id)}>
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
