import React, { useState } from 'react';

export default function CCUsers({
  users,
  orgRequests,
  onApproveRequest,
  onRejectRequest,
  onPromote,
  onDeleteUser,
  onDemoteUser,
  onResetPassword,
  onCreateUser,
  loading,
}) {
  const [search, setSearch] = useState('');
  const [promoteUid, setPromoteUid] = useState('');
  const [tab, setTab] = useState('users');
  const [confirmAction, setConfirmAction] = useState(null); // { action, user }
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '' });
  const [creatingUser, setCreatingUser] = useState(false);
  const [createUserError, setCreateUserError] = useState('');
  const [createUserSuccess, setCreateUserSuccess] = useState('');

  const filtered = users.filter(u => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (u.displayName || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.role || '').toLowerCase().includes(q)
    );
  });

  function handlePromote() {
    if (!promoteUid.trim()) return;
    onPromote(promoteUid.trim());
    setPromoteUid('');
  }

  async function executeConfirm() {
    if (!confirmAction) return;
    const { action, user: u } = confirmAction;
    try {
      if (action === 'delete') await onDeleteUser(u.id);
      else if (action === 'demote') await onDemoteUser(u.id);
      else if (action === 'reset') await onResetPassword(u.email);
    } catch (err) {
      console.error(`Failed to ${action}:`, err);
    }
    setConfirmAction(null);
  }

  async function handleCreateUserSubmit(e) {
    e.preventDefault();
    setCreateUserError('');
    setCreateUserSuccess('');
    if (!newUser.name.trim() || !newUser.email.trim() || !newUser.password.trim()) {
      setCreateUserError('Name, email, and password are required.');
      return;
    }
    if (newUser.password.length < 8) {
      setCreateUserError('Password must be at least 8 characters.');
      return;
    }
    setCreatingUser(true);
    try {
      await onCreateUser({
        name: newUser.name.trim(),
        email: newUser.email.trim(),
        password: newUser.password,
      });
      setCreateUserSuccess('User account created successfully.');
      setNewUser({ name: '', email: '', password: '' });
      setTab('users');
    } catch (err) {
      setCreateUserError(err.message || 'Failed to create user.');
    } finally {
      setCreatingUser(false);
    }
  }

  return (
    <>
      {/* Confirm dialog */}
      {confirmAction && (
        <div className="cc-modal-overlay" onClick={() => setConfirmAction(null)}>
          <div className="cc-modal-card cc-confirm-card" onClick={e => e.stopPropagation()}>
            <h3>
              {confirmAction.action === 'delete' && '⚠️ Delete User'}
              {confirmAction.action === 'demote' && '↩️ Remove Coordinator'}
              {confirmAction.action === 'reset' && '🔑 Reset Password'}
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', margin: '12px 0' }}>
              {confirmAction.action === 'delete' &&
                `Are you sure you want to delete ${confirmAction.user.displayName || confirmAction.user.email}? This removes their profile permanently.`}
              {confirmAction.action === 'demote' &&
                `Demote ${confirmAction.user.displayName || confirmAction.user.email} back to participant?`}
              {confirmAction.action === 'reset' &&
                `Send a password reset email to ${confirmAction.user.email}?`}
            </p>
            <div className="cc-actions" style={{ justifyContent: 'flex-end', marginTop: 16 }}>
              <button className="cc-btn-sm reject" onClick={() => setConfirmAction(null)}>Cancel</button>
              <button className="cc-btn-sm approve" onClick={executeConfirm}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      <div className="cc-filter-bar" style={{ marginBottom: 8 }}>
        <button className={`cc-filter-btn${tab === 'users' ? ' active' : ''}`} onClick={() => setTab('users')}>
          All Users ({users.length})
        </button>
        <button className={`cc-filter-btn${tab === 'requests' ? ' active' : ''}`} onClick={() => setTab('requests')}>
          Coordinator Requests ({orgRequests.length})
        </button>
        <button className={`cc-filter-btn${tab === 'promote' ? ' active' : ''}`} onClick={() => setTab('promote')}>
          Promote User
        </button>
        <button className={`cc-filter-btn${tab === 'add' ? ' active' : ''}`} onClick={() => setTab('add')}>
          Add User
        </button>
      </div>

      {createUserSuccess && (
        <div className="cc-note" style={{ marginBottom: 10, borderColor: 'rgba(34,197,94,0.4)', color: '#4ade80' }}>
          <i className="fas fa-check-circle"></i>
          <span>{createUserSuccess}</span>
        </div>
      )}

      {tab === 'users' && (
        <>
          <div className="cc-search">
            <i className="fas fa-search"></i>
            <input
              placeholder="Search by name, email, role…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="cc-table-wrap">
            <table className="cc-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Signed Up</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: 20, color: 'rgba(255,255,255,0.3)' }}>Loading…</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: 20, color: 'rgba(255,255,255,0.3)' }}>No users found</td></tr>
                ) : (
                  filtered.map(u => (
                    <tr key={u.id}>
                      <td>{u.displayName || '—'}</td>
                      <td>{u.email || '—'}</td>
                      <td>
                        <span className={`cc-status ${u.role === 'admin' ? 'approved' : u.role === 'organiser' ? 'uploaded' : 'pending'}`}>
                          {u.role || 'participant'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td>
                        <div className="cc-actions">
                          {u.role !== 'admin' && (
                            <>
                              <button
                                className="cc-btn-sm edit"
                                title="Reset Password"
                                onClick={() => setConfirmAction({ action: 'reset', user: u })}
                              >
                                <i className="fas fa-key"></i>
                              </button>
                              {u.role === 'organiser' && (
                                <button
                                  className="cc-btn-sm waitlist"
                                  title="Remove Coordinator"
                                  onClick={() => setConfirmAction({ action: 'demote', user: u })}
                                >
                                  <i className="fas fa-user-minus"></i>
                                </button>
                              )}
                              <button
                                className="cc-btn-sm reject"
                                title="Delete User"
                                onClick={() => setConfirmAction({ action: 'delete', user: u })}
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </>
                          )}
                          {u.role === 'admin' && (
                            <span style={{ fontSize: '0.75rem', color: '#F5B301', fontWeight: 600 }}>
                              Master Admin
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'requests' && (
        <>
          {orgRequests.length === 0 ? (
            <div className="cc-section" style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
              No pending coordinator requests.
            </div>
          ) : (
            orgRequests.map(req => (
              <div key={req.id} className="cc-request-card">
                <h4>{req.displayName || 'Unknown'}</h4>
                <p className="cc-req-email">{req.email}</p>
                <p className="cc-req-reason">{req.reason}</p>
                <p className="cc-req-date">
                  Requested: {req.createdAt ? new Date(req.createdAt).toLocaleString() : '—'}
                </p>
                <div className="cc-actions">
                  <button className="cc-btn-sm approve" onClick={() => onApproveRequest(req.id, req.uid)}>
                    Approve
                  </button>
                  <button className="cc-btn-sm reject" onClick={() => onRejectRequest(req.id, req.uid)}>
                    Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </>
      )}

      {tab === 'promote' && (
        <div className="cc-section">
          <h3>Promote User to Coordinator</h3>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem', marginBottom: 14 }}>
            Enter the Firebase UID of the user you want to promote to organiser/coordinator.
          </p>
          <div className="cc-form-row">
            <input
              className="cc-input"
              placeholder="Firebase UID"
              value={promoteUid}
              onChange={e => setPromoteUid(e.target.value)}
            />
            <button className="cc-btn primary" onClick={handlePromote}>
              Promote
            </button>
          </div>
        </div>
      )}

      {tab === 'add' && (
        <div className="cc-section">
          <h3>Create Participant User</h3>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.82rem', marginBottom: 14 }}>
            This creates only a participant login account. It does not create any team.
          </p>
          <form onSubmit={handleCreateUserSubmit}>
            <div className="cc-form-row" style={{ marginBottom: 10 }}>
              <input
                className="cc-input"
                placeholder="Full name"
                value={newUser.name}
                onChange={(e) => setNewUser((u) => ({ ...u, name: e.target.value }))}
              />
              <input
                className="cc-input"
                type="email"
                placeholder="Email"
                value={newUser.email}
                onChange={(e) => setNewUser((u) => ({ ...u, email: e.target.value }))}
              />
            </div>
            <div className="cc-form-row" style={{ marginBottom: 10 }}>
              <input
                className="cc-input"
                type="text"
                placeholder="Default password (min 8 chars)"
                value={newUser.password}
                onChange={(e) => setNewUser((u) => ({ ...u, password: e.target.value }))}
              />
              <button className="cc-btn primary" type="submit" disabled={creatingUser}>
                {creatingUser ? 'Creating…' : 'Create User'}
              </button>
            </div>
          </form>
          {createUserError && <p style={{ color: '#f87171', fontSize: '0.85rem' }}>{createUserError}</p>}
        </div>
      )}
    </>
  );
}
