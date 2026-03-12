import React, { useState } from 'react';
import TeamDetailCard from '../TeamDetailCard';

const DRIVE_LINKS = {
  abstract: 'https://drive.google.com/drive/folders/1NaWxbzBazzVvIjN8YZMs2mEgZL9RqMzV?usp=sharing',
  payment: 'https://drive.google.com/drive/folders/1adj2XwlskDCx9xYq8OhOQoKmA0FBBsZj?usp=sharing',
};

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
  onAddTeam,
  onDelete,
  isAdmin,
}) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [paymentView, setPaymentView] = useState(false);
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [busyTeamId, setBusyTeamId] = useState(null);

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
          isAdmin={isAdmin}
        />
      )}

      {/* Drive links + Add Team */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
        <a
          href={DRIVE_LINKS.abstract}
          target="_blank"
          rel="noopener noreferrer"
          className="cc-btn-sm"
          style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', padding: '6px 14px', borderRadius: 6 }}
        >
          <i className="fab fa-google-drive"></i> Abstracts Drive
        </a>
        <a
          href={DRIVE_LINKS.payment}
          target="_blank"
          rel="noopener noreferrer"
          className="cc-btn-sm"
          style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', padding: '6px 14px', borderRadius: 6 }}
        >
          <i className="fab fa-google-drive"></i> Payments Drive
        </a>
        {onAddTeam && (
          <button
            className="cc-btn-sm approve"
            style={{ padding: '6px 14px', borderRadius: 6 }}
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <i className="fas fa-plus"></i> {showAddForm ? 'Cancel' : 'Add Team Manually'}
          </button>
        )}
      </div>

      {/* Add Team Form */}
      {showAddForm && onAddTeam && (
        <AddTeamForm
          onSubmit={async (data) => {
            await onAddTeam(data);
            setShowAddForm(false);
          }}
          onCancel={() => setShowAddForm(false)}
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
                  <th>Abstract</th>
                  <th>Source</th>
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
                    <td onClick={(e) => e.stopPropagation()}>
                      {team.abstractFileUrl ? (
                        <a href={team.abstractFileUrl.replace('/image/upload/', '/raw/upload/')} target="_blank" rel="noopener noreferrer" style={{ color: '#22c55e', fontSize: '0.82rem' }} title={team.abstractFileName || 'Abstract'}>
                          <i className="fas fa-download"></i> Open
                        </a>
                      ) : team.abstractLink ? (
                        <a href={team.abstractLink} target="_blank" rel="noopener noreferrer" style={{ color: '#6366f1', fontSize: '0.82rem' }}>
                          <i className="fas fa-link"></i> Link
                        </a>
                      ) : '—'}
                    </td>
                    <td>
                      <span style={{ fontSize: '0.78rem', color: team.addedBy === 'admin' ? '#F5B301' : team.addedBy === 'coordinator' ? '#a78bfa' : 'rgba(255,255,255,0.4)' }}>
                        {team.addedBy === 'admin' ? '🛡️ Manual' : team.addedBy === 'coordinator' ? '📋 Coordinator' : '👤 Signed up'}
                      </span>
                    </td>
                    <td>
                      <div className="cc-actions" onClick={(e) => e.stopPropagation()}>
                        {team.status === 'pending' && (
                          <>
                            <button className="cc-btn-sm approve" disabled={busyTeamId === team.id} onClick={async () => {
                              setBusyTeamId(team.id);
                              try { await onApprove(team); } finally { setBusyTeamId(null); }
                            }}>
                              {busyTeamId === team.id ? 'Processing…' : 'Approve'}
                            </button>
                            <button className="cc-btn-sm waitlist" disabled={busyTeamId === team.id} onClick={async () => {
                              setBusyTeamId(team.id);
                              try { await onWaitlist(team); } finally { setBusyTeamId(null); }
                            }}>
                              {busyTeamId === team.id ? '…' : 'Waitlist'}
                            </button>
                          </>
                        )}
                        {team.status !== 'cancelled' && (
                          <button className="cc-btn-sm reject" disabled={busyTeamId === team.id} onClick={async () => {
                            setBusyTeamId(team.id);
                            try { await onCancel(team); } finally { setBusyTeamId(null); }
                          }}>
                            {busyTeamId === team.id ? '…' : 'Cancel'}
                          </button>
                        )}
                        {onDelete && (
                          <button
                            className="cc-btn-sm"
                            style={{ background: 'rgba(220,38,38,0.18)', color: '#f87171', border: '1px solid #f87171' }}
                            onClick={() => onDelete(team)}
                          >
                            <i className="fas fa-trash"></i> Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={11} style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', padding: 20 }}>
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
        <>
          {/* Payment status filter */}
          <div className="cc-filter-bar" style={{ marginBottom: 12 }}>
            {['all', 'uploaded', 'verified', 'rejected'].map(f => (
              <button
                key={f}
                className={`cc-filter-btn${paymentFilter === f ? ' active' : ''}`}
                onClick={() => setPaymentFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)} (
                {f === 'all'
                  ? teams.filter(t => t.paymentStatus && t.paymentStatus !== PAYMENT_STATUS.NOT_PAID).length
                  : teams.filter(t => t.paymentStatus === f).length})
              </button>
            ))}
          </div>
          <div className="cc-table-wrap">
            <table className="cc-table">
              <thead>
                <tr>
                  <th>Team ID</th>
                  <th>Team Name</th>
                  <th>Members</th>
                  <th>Amount</th>
                  <th>TXN ID</th>
                  <th>Screenshot</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {teams
                  .filter(t => t.paymentStatus && t.paymentStatus !== PAYMENT_STATUS.NOT_PAID)
                  .filter(t => paymentFilter === 'all' || t.paymentStatus === paymentFilter)
                  .map(t => (
                    <tr key={t.id}>
                      <td>{t.teamId || '—'}</td>
                      <td>{t.teamName}</td>
                      <td>{t.memberCount || '—'}</td>
                      <td>₹{(t.memberCount || 3) * 350}</td>
                      <td>{t.paymentTxnId || '—'}</td>
                      <td>
                        {(t.paymentScreenshotUrl || t.paymentScreenshotLink) ? (
                          <a
                            href={t.paymentScreenshotUrl || t.paymentScreenshotLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#6366f1' }}
                          >
                            <i className="fas fa-image"></i> View
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
        </>
      )}
    </>
  );
}

/* ─── Inline Add Team Form ─── */
function AddTeamForm({ onSubmit, onCancel }) {
  const [form, setForm] = useState({
    eventType: 'designathon',
    collegeName: '',
    teamName: '',
    sdgGoals: [],
    problemTitle: '',
    miniDescription: '',
    leaderName: '',
    leaderPhone: '',
    leaderEmail: '',
    leaderDepartment: '',
    member1Name: '',
    member1Phone: '',
    member1Email: '',
    member1Department: '',
    member2Name: '',
    member2Phone: '',
    member2Email: '',
    member2Department: '',
    member3Name: '',
    member3Phone: '',
    member3Email: '',
    member3Department: '',
    department: '',
    year: '',
    guideName: '',
    guideEmail: '',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  function upd(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.teamName.trim() || !form.leaderName.trim() || !form.collegeName.trim()) {
      setError('Team name, college, and leader name are required.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err.message || 'Failed to add team.');
      setBusy(false);
    }
  }

  const fieldStyle = {
    padding: '8px 12px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 6,
    color: '#fff',
    width: '100%',
    fontSize: '0.9rem',
  };

  return (
    <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(245,179,1,0.3)', borderRadius: 12, padding: 20, marginBottom: 16 }}>
      <h4 style={{ color: 'var(--accent)', marginBottom: 12 }}><i className="fas fa-plus-circle"></i> Add Team Manually</h4>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Event *</label>
            <select value={form.eventType} onChange={e => upd('eventType', e.target.value)} style={fieldStyle}>
              <option value="designathon">Designathon</option>
              <option value="hackathon">Hackathon</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Team Name *</label>
            <input value={form.teamName} onChange={e => upd('teamName', e.target.value)} style={fieldStyle} />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>College *</label>
            <input value={form.collegeName} onChange={e => upd('collegeName', e.target.value)} style={fieldStyle} />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Department</label>
            <input value={form.department} onChange={e => upd('department', e.target.value)} style={fieldStyle} />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Year</label>
            <input value={form.year} onChange={e => upd('year', e.target.value)} style={fieldStyle} />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>SDG Goals (comma-separated numbers)</label>
            <input value={form.sdgGoals.join(', ')} onChange={e => upd('sdgGoals', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} style={fieldStyle} placeholder="e.g. 1, 7, 13" />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Problem Title</label>
            <input value={form.problemTitle} onChange={e => upd('problemTitle', e.target.value)} style={fieldStyle} />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Leader Name *</label>
            <input value={form.leaderName} onChange={e => upd('leaderName', e.target.value)} style={fieldStyle} />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Leader Phone</label>
            <input value={form.leaderPhone} onChange={e => upd('leaderPhone', e.target.value)} style={fieldStyle} />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Leader Email</label>
            <input value={form.leaderEmail} onChange={e => upd('leaderEmail', e.target.value)} style={fieldStyle} type="email" />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Leader Department</label>
            <input value={form.leaderDepartment} onChange={e => upd('leaderDepartment', e.target.value)} style={fieldStyle} />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Member 1 Name</label>
            <input value={form.member1Name} onChange={e => upd('member1Name', e.target.value)} style={fieldStyle} />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Member 1 Phone</label>
            <input value={form.member1Phone} onChange={e => upd('member1Phone', e.target.value)} style={fieldStyle} />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Member 1 Email</label>
            <input value={form.member1Email} onChange={e => upd('member1Email', e.target.value)} style={fieldStyle} type="email" />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Member 1 Department</label>
            <input value={form.member1Department} onChange={e => upd('member1Department', e.target.value)} style={fieldStyle} />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Member 2 Name</label>
            <input value={form.member2Name} onChange={e => upd('member2Name', e.target.value)} style={fieldStyle} />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Member 2 Phone</label>
            <input value={form.member2Phone} onChange={e => upd('member2Phone', e.target.value)} style={fieldStyle} />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Member 2 Email</label>
            <input value={form.member2Email} onChange={e => upd('member2Email', e.target.value)} style={fieldStyle} type="email" />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Member 2 Department</label>
            <input value={form.member2Department} onChange={e => upd('member2Department', e.target.value)} style={fieldStyle} />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Member 3 Name</label>
            <input value={form.member3Name} onChange={e => upd('member3Name', e.target.value)} style={fieldStyle} />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Member 3 Phone</label>
            <input value={form.member3Phone} onChange={e => upd('member3Phone', e.target.value)} style={fieldStyle} />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Member 3 Email</label>
            <input value={form.member3Email} onChange={e => upd('member3Email', e.target.value)} style={fieldStyle} type="email" />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Member 3 Department</label>
            <input value={form.member3Department} onChange={e => upd('member3Department', e.target.value)} style={fieldStyle} />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Guide Name (Optional)</label>
            <input value={form.guideName} onChange={e => upd('guideName', e.target.value)} style={fieldStyle} placeholder="Faculty guide" />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Guide Email (Optional)</label>
            <input value={form.guideEmail} onChange={e => upd('guideEmail', e.target.value)} style={fieldStyle} type="email" placeholder="Guide email" />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 14, alignItems: 'center' }}>
          <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Description:</label>
          <input value={form.miniDescription} onChange={e => upd('miniDescription', e.target.value)} style={{ ...fieldStyle, flex: 1 }} placeholder="Optional description" />
        </div>
        {error && <p style={{ color: '#f87171', marginTop: 8, fontSize: '0.85rem' }}>{error}</p>}
        <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
          <button type="submit" className="cc-btn-sm approve" disabled={busy}>
            {busy ? 'Adding…' : '✓ Add Team'}
          </button>
          <button type="button" className="cc-btn-sm reject" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
