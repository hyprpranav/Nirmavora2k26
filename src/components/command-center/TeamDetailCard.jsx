import React, { useState, useEffect } from 'react';
import { getTeamNotes } from '../../services/teamService';

const ADMIN_CODE = '8870881397';

/**
 * Floating card that shows full team details.
 * Props:
 *   team          – the team object
 *   onClose       – close the card
 *   onSave        – (docId, updatedFields) save edited fields to Firestore
 *   canEdit       – boolean: whether current user can enter edit mode
 *   canAttendance – boolean: whether attendance section is accessible
 *   onConfirmAttendance – (docId, memberAttendance, status) save attendance
 *   isAdmin       – boolean: whether current user is admin (for event swap)
 */
export default function TeamDetailCard({
  team,
  onClose,
  onSave,
  canEdit,
  canAttendance,
  onConfirmAttendance,
  isAdmin,
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [attendanceMode, setAttendanceMode] = useState(false);
  const [memberAtt, setMemberAtt] = useState({});
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState([]);
  const [swapModal, setSwapModal] = useState(false);
  const [swapPin, setSwapPin] = useState('');
  const [swapError, setSwapError] = useState('');
  const [swapping, setSwapping] = useState(false);

  // Build member list from team data
  function getMembers(t) {
    const m = [{ key: 'leader', label: 'Team Leader', name: t.leaderName }];
    if (t.member1Name) m.push({ key: 'member1', label: 'Member 1', name: t.member1Name });
    if (t.member2Name) m.push({ key: 'member2', label: 'Member 2', name: t.member2Name });
    if (t.member3Name) m.push({ key: 'member3', label: 'Member 3', name: t.member3Name });
    return m;
  }

  useEffect(() => {
    if (!team) return;
    // Init form with all editable fields
    setForm({
      teamId: team.teamId || '',
      teamName: team.teamName || '',
      collegeName: team.collegeName || '',
      department: team.department || '',
      year: team.year || '',
      leaderName: team.leaderName || '',
      leaderEmail: team.leaderEmail || '',
      leaderPhone: team.leaderPhone || '',
      member1Name: team.member1Name || '',
      member1Email: team.member1Email || '',
      member1Phone: team.member1Phone || '',
      member2Name: team.member2Name || '',
      member2Email: team.member2Email || '',
      member2Phone: team.member2Phone || '',
      member3Name: team.member3Name || '',
      member3Email: team.member3Email || '',
      member3Phone: team.member3Phone || '',
      problemTitle: team.problemTitle || '',
      sdgGoal: Array.isArray(team.sdgGoals) ? team.sdgGoals.join(', ') : (team.sdgGoal || ''),
      abstractLink: team.abstractLink || '',
      guideName: team.guideName || '',
      guideEmail: team.guideEmail || '',
      eventType: team.eventType || '',
    });
    // Init attendance from existing data or null
    const existing = team.memberAttendance || {};
    const att = { leader: existing.leader || null };
    if (team.member1Name) att.member1 = existing.member1 || null;
    if (team.member2Name) att.member2 = existing.member2 || null;
    if (team.member3Name) att.member3 = existing.member3 || null;
    setMemberAtt(att);
    // Load team notes
    getTeamNotes(team.id).then(setNotes).catch(() => setNotes([]));
  }, [team]);

  if (!team) return null;

  const members = getMembers(team);

  function updateForm(key, val) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleSave() {
    setSaving(true);
    await onSave(team.id, form);
    setSaving(false);
    setEditing(false);
  }

  function toggleMemberAtt(key) {
    setMemberAtt((prev) => {
      const cur = prev[key];
      // cycle: null → present → absent → present
      if (cur === null || cur === undefined) return { ...prev, [key]: 'present' };
      if (cur === 'present') return { ...prev, [key]: 'absent' };
      return { ...prev, [key]: 'present' };
    });
  }

  function markAllPresent() {
    const updated = {};
    Object.keys(memberAtt).forEach((k) => { updated[k] = 'present'; });
    setMemberAtt(updated);
  }

  function markAllAbsent() {
    const updated = {};
    Object.keys(memberAtt).forEach((k) => { updated[k] = 'absent'; });
    setMemberAtt(updated);
  }

  async function confirmAttendance() {
    setSaving(true);
    const vals = Object.values(memberAtt);
    const allPresent = vals.every((v) => v === 'present');
    const allAbsent = vals.every((v) => v === 'absent');
    const hasNull = vals.some((v) => v === null || v === undefined);
    let status = 'partial';
    if (allPresent) status = 'present';
    else if (allAbsent) status = 'absent';
    else if (hasNull) status = 'partial';
    await onConfirmAttendance(team.id, memberAtt, status);
    setSaving(false);
    setAttendanceMode(false);
  }

  async function handleEventSwap() {
    const cleaned = swapPin.replace(/\s/g, '');
    if (cleaned !== ADMIN_CODE) {
      setSwapError('Invalid code. Operation cancelled.');
      return;
    }
    setSwapping(true);
    const newEvent = team.eventType === 'designathon' ? 'hackathon' : 'designathon';
    await onSave(team.id, { eventType: newEvent });
    setSwapping(false);
    setSwapModal(false);
    setSwapPin('');
  }

  function renderField(label, key, type = 'text') {
    if (editing) {
      return (
        <div className="cc-detail-field">
          <span className="cc-detail-label">{label}</span>
          <input
            className="cc-input"
            type={type}
            value={form[key] || ''}
            onChange={(e) => updateForm(key, e.target.value)}
          />
        </div>
      );
    }
    return (
      <div className="cc-detail-field">
        <span className="cc-detail-label">{label}</span>
        <span className="cc-detail-value">{form[key] || '—'}</span>
      </div>
    );
  }

  return (
    <div className="cc-modal-overlay" onClick={onClose}>
      <div className="cc-modal-card cc-team-detail-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="cc-card-header">
          <div>
            <h3>{team.teamName}</h3>
            <span className={`cc-status ${team.status}`} style={{ marginLeft: 8 }}>{team.status}</span>
          </div>
          <div className="cc-card-header-actions">
            {canEdit && !editing && !attendanceMode && (
              <button className="cc-btn-sm edit" title="Edit" onClick={() => setEditing(true)}>
                <i className="fas fa-pen"></i> Edit
              </button>
            )}
            {canAttendance && !editing && !attendanceMode && (
              <button className="cc-btn-sm approve" title="Attendance" onClick={() => setAttendanceMode(true)}>
                <i className="fas fa-clipboard-check"></i> Attendance
              </button>
            )}
            <button className="cc-btn-sm reject" onClick={onClose}>
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="cc-card-body">
          {!attendanceMode ? (
            <>
              {/* Team Info */}
              <div className="cc-detail-section">
                <h4><i className="fas fa-info-circle"></i> Team Info</h4>
                <div className="cc-detail-grid">
                  {renderField('Team ID', 'teamId')}
                  {renderField('Team Name', 'teamName')}
                  {renderField('College', 'collegeName')}
                  {renderField('Department', 'department')}
                  {renderField('Year', 'year')}
                  {renderField('Event', 'eventType')}
                </div>
              </div>

              {/* Leader */}
              <div className="cc-detail-section">
                <h4><i className="fas fa-user-tie"></i> Team Leader</h4>
                <div className="cc-detail-grid">
                  {renderField('Name', 'leaderName')}
                  {renderField('Email', 'leaderEmail', 'email')}
                  {renderField('Phone', 'leaderPhone', 'tel')}
                </div>
              </div>

              {/* Members */}
              {[1, 2, 3].map((n) => {
                const nameKey = `member${n}Name`;
                if (!team[nameKey]) return null;
                return (
                  <div className="cc-detail-section" key={n}>
                    <h4><i className="fas fa-user"></i> Member {n}</h4>
                    <div className="cc-detail-grid">
                      {renderField('Name', `member${n}Name`)}
                      {renderField('Email', `member${n}Email`, 'email')}
                      {renderField('Phone', `member${n}Phone`, 'tel')}
                    </div>
                  </div>
                );
              })}

              {/* Guide Details */}
              {(team.guideName || team.guideEmail || editing) && (
                <div className="cc-detail-section">
                  <h4><i className="fas fa-chalkboard-teacher"></i> Guide Details</h4>
                  <div className="cc-detail-grid">
                    {renderField('Guide Name', 'guideName')}
                    {renderField('Guide Email', 'guideEmail', 'email')}
                  </div>
                </div>
              )}

              {/* Problem */}
              <div className="cc-detail-section">
                <h4><i className="fas fa-lightbulb"></i> Problem Statement</h4>
                <div className="cc-detail-grid">
                  {renderField('Problem Title', 'problemTitle')}
                  {renderField('SDG Goal', 'sdgGoal')}
                  {editing ? renderField('Abstract Link (legacy)', 'abstractLink') : null}
                </div>
                {/* Abstract File Download */}
                {!editing && (
                  <div style={{ marginTop: 12 }}>
                    {team.abstractFileUrl ? (
                      <a
                        href={team.abstractFileUrl.replace('/image/upload/', '/raw/upload/')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cc-btn-sm approve"
                        style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                      >
                        <i className="fas fa-download"></i> Download Abstract
                        {team.abstractFileName && <span style={{ fontSize: '0.78rem', opacity: 0.7 }}> ({team.abstractFileName})</span>}
                      </a>
                    ) : team.abstractLink ? (
                      <a
                        href={team.abstractLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cc-btn-sm"
                        style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                      >
                        <i className="fas fa-external-link-alt"></i> Open Abstract Link
                      </a>
                    ) : (
                      <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>No abstract uploaded</span>
                    )}
                  </div>
                )}
                {/* Payment Screenshot View */}
                {!editing && (team.paymentScreenshotUrl || team.paymentScreenshotLink) && (
                  <div style={{ marginTop: 10 }}>
                    <a
                      href={team.paymentScreenshotUrl || team.paymentScreenshotLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cc-btn-sm"
                      style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(99,102,241,0.2)', color: '#a5b4fc' }}
                    >
                      <i className="fas fa-image"></i> View Payment Screenshot
                    </a>
                    {team.paymentTxnId && (
                      <span style={{ marginLeft: 10, fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)' }}>TXN: {team.paymentTxnId}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Audit / Tracking Info */}
              {!editing && (team.addedBy || team.lastEditedBy || team.attendanceMarkedBy) && (
                <div className="cc-detail-section">
                  <h4><i className="fas fa-history"></i> Audit Trail</h4>
                  <div className="cc-detail-grid">
                    {team.addedBy && (
                      <div className="cc-detail-field">
                        <span className="cc-detail-label">Added By</span>
                        <span className="cc-detail-value">{team.addedBy === 'admin' ? '🛡️ Admin (Manual)' : '👤 Self-registered'}</span>
                      </div>
                    )}
                    {team.lastEditedBy && (
                      <div className="cc-detail-field">
                        <span className="cc-detail-label">Last Edited By</span>
                        <span className="cc-detail-value">{team.lastEditedBy}</span>
                      </div>
                    )}
                    {team.lastEditedAt && (
                      <div className="cc-detail-field">
                        <span className="cc-detail-label">Last Edited At</span>
                        <span className="cc-detail-value">{new Date(team.lastEditedAt).toLocaleString()}</span>
                      </div>
                    )}
                    {team.attendanceMarkedBy && (
                      <div className="cc-detail-field">
                        <span className="cc-detail-label">Attendance By</span>
                        <span className="cc-detail-value">{team.attendanceMarkedBy}</span>
                      </div>
                    )}
                    {team.attendanceMarkedAt && (
                      <div className="cc-detail-field">
                        <span className="cc-detail-label">Attendance At</span>
                        <span className="cc-detail-value">{new Date(team.attendanceMarkedAt).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Save / Cancel */}
              {editing && (
                <div className="cc-card-footer-actions">
                  <button className="cc-btn-sm reject" onClick={() => setEditing(false)} disabled={saving}>Cancel</button>
                  <button className="cc-btn-sm approve" onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              )}

              {/* Event Swap — Admin only */}
              {!editing && isAdmin && (
                <div className="cc-detail-section">
                  <h4><i className="fas fa-exchange-alt"></i> Event Type Swap</h4>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem', marginBottom: 10 }}>
                    Current: <strong style={{ color: '#F5B301' }}>{team.eventType === 'designathon' ? 'Designathon' : 'Hackathon'}</strong>
                  </p>
                  <button className="cc-btn-sm edit" onClick={() => { setSwapModal(true); setSwapPin(''); setSwapError(''); }}>
                    <i className="fas fa-exchange-alt"></i> Swap to {team.eventType === 'designathon' ? 'Hackathon' : 'Designathon'}
                  </button>
                </div>
              )}

              {/* Team Notes */}
              {!editing && notes.length > 0 && (
                <div className="cc-detail-section">
                  <h4><i className="fas fa-sticky-note"></i> Team Notes ({notes.length})</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {notes.map((n) => (
                      <div key={n.id} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: '10px 14px', borderLeft: '3px solid #F5B301' }}>
                        <div style={{ color: '#fff', fontSize: '0.88rem', marginBottom: 4 }}>{n.note}</div>
                        <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.72rem' }}>
                          — {n.commenterName || n.commenterEmail} · {new Date(n.createdAt).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* ─── Attendance Mode ─── */
            <>
              <div className="cc-detail-section">
                <h4><i className="fas fa-clipboard-check"></i> Mark Attendance</h4>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem', margin: '4px 0 16px' }}>
                  Click each member to toggle Present / Absent. Then confirm.
                </p>

                <div className="cc-att-bulk-actions">
                  <button className="cc-btn-sm approve" onClick={markAllPresent}>
                    <i className="fas fa-check-double"></i> Mark All Present
                  </button>
                  <button className="cc-btn-sm reject" onClick={markAllAbsent}>
                    <i className="fas fa-times-circle"></i> Mark All Absent
                  </button>
                </div>

                <div className="cc-att-members">
                  {members.map((m) => {
                    const status = memberAtt[m.key];
                    return (
                      <div className="cc-att-member-row" key={m.key}>
                        <div className="cc-att-member-info">
                          <span className="cc-att-member-label">{m.label}</span>
                          <span className="cc-att-member-name">{m.name}</span>
                        </div>
                        <div className="cc-att-member-actions">
                          <button
                            className={`cc-att-btn present${status === 'present' ? ' active' : ''}`}
                            onClick={() => setMemberAtt((p) => ({ ...p, [m.key]: 'present' }))}
                          >
                            Present
                          </button>
                          <button
                            className={`cc-att-btn absent${status === 'absent' ? ' active' : ''}`}
                            onClick={() => setMemberAtt((p) => ({ ...p, [m.key]: 'absent' }))}
                          >
                            Absent
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="cc-card-footer-actions">
                <button className="cc-btn-sm reject" onClick={() => setAttendanceMode(false)} disabled={saving}>Back</button>
                <button className="cc-btn-sm approve" onClick={confirmAttendance} disabled={saving}>
                  {saving ? 'Confirming…' : '✓ Confirm Attendance'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Event Swap PIN Modal */}
      {swapModal && (
        <div className="cc-modal-overlay" style={{ zIndex: 1100 }} onClick={() => !swapping && setSwapModal(false)}>
          <div className="cc-modal-card cc-danger-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div className="cc-modal-header">
              <h3 style={{ color: '#F5B301' }}><i className="fas fa-exchange-alt" style={{ marginRight: 8 }}></i>Swap Event Type</h3>
            </div>
            <div className="cc-modal-body">
              <p style={{ marginBottom: 12, color: 'rgba(255,255,255,0.6)' }}>
                Swap <strong>{team.teamName}</strong> from <strong>{team.eventType === 'designathon' ? 'Designathon' : 'Hackathon'}</strong> to <strong>{team.eventType === 'designathon' ? 'Hackathon' : 'Designathon'}</strong>.
              </p>
              <p style={{ marginBottom: 16, fontWeight: 600, color: '#F5B301' }}>Enter the 10-digit admin verification code to proceed.</p>
              <input
                type="text"
                placeholder="Enter 10-digit code"
                value={swapPin}
                onChange={e => { setSwapPin(e.target.value); setSwapError(''); }}
                maxLength={12}
                style={{ width: '100%', padding: '12px 14px', background: 'var(--dark-base, #0d0d0d)', border: '1px solid #F5B30188', borderRadius: 8, color: '#fff', fontSize: '1.1rem', fontFamily: 'monospace', textAlign: 'center', letterSpacing: 3 }}
                autoFocus
                disabled={swapping}
              />
              {swapError && <p style={{ color: '#f44336', fontSize: '0.85rem', marginTop: 8 }}>{swapError}</p>}
            </div>
            <div className="cc-modal-footer">
              <button className="cc-btn-secondary" onClick={() => setSwapModal(false)} disabled={swapping}>Cancel</button>
              <button className="cc-btn-sm approve" onClick={handleEventSwap} disabled={swapping || !swapPin.trim()}>
                {swapping ? 'Swapping…' : 'Confirm Swap'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
