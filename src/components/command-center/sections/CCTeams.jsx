import React, { useState } from 'react';
import TeamDetailCard from '../TeamDetailCard';

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
  canEdit,
  canAttendance,
  onConfirmAttendance,
}) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [paymentView, setPaymentView] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);

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

  return (
    <>
      {/* Team Detail Card Modal */}
      {selectedTeam && (
        <TeamDetailCard
          team={selectedTeam}
          onClose={() => setSelectedTeam(null)}
          onSave={async (docId, data) => {
            await onEdit(docId, data);
            setSelectedTeam(null);
          }}
          canEdit={canEdit}
          canAttendance={canAttendance}
          onConfirmAttendance={async (docId, memberAtt, status) => {
            if (onConfirmAttendance) await onConfirmAttendance(docId, memberAtt, status);
            setSelectedTeam(null);
          }}
        />
      )}

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
                  <th>Attendance</th>
                  <th>Actions</th>
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
                    <td>{team.collegeName}</td>
                    <td>{team.leaderName}</td>
                    <td>{team.memberCount || team.members?.length || '—'}</td>
                    <td>
                      <span className={`cc-status ${team.status}`}>{team.status}</span>
                    </td>
                    <td>
                      <span className={`cc-status ${team.attendanceStatus || 'not_marked'}`}>
                        {team.attendanceStatus === 'present' ? '✓ Present' :
                         team.attendanceStatus === 'partial' ? '◐ Partial' :
                         team.attendanceStatus === 'absent' ? '✗ Absent' :
                         '—'}
                      </span>
                    </td>
                    <td>
                      <div className="cc-actions" onClick={(e) => e.stopPropagation()}>
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
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', padding: 20 }}>
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
