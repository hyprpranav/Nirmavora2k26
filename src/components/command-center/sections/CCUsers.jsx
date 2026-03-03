import React, { useState } from 'react';

export default function CCUsers({ users, orgRequests, onApproveRequest, onRejectRequest, onPromote, loading }) {
  const [search, setSearch] = useState('');
  const [promoteUid, setPromoteUid] = useState('');
  const [tab, setTab] = useState('users');

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

  return (
    <>
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
      </div>

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
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} style={{ textAlign: 'center', padding: 20, color: 'rgba(255,255,255,0.3)' }}>Loading…</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={4} style={{ textAlign: 'center', padding: 20, color: 'rgba(255,255,255,0.3)' }}>No users found</td></tr>
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
    </>
  );
}
