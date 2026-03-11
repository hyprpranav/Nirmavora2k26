import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getTeamByTeamId, markAttendance, addTeamNote, getTeamNotes, updateTeamDetails, confirmMemberAttendance } from '../services/teamService';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import '../styles/qr-public.css';

const PAYMENT_LABELS = {
  pending: 'Payment Pending',
  uploaded: 'Payment Uploaded',
  verified: 'Payment Verified',
  rejected: 'Payment Rejected',
};

export default function QRPublic() {
  const { teamId } = useParams();
  const { user, profile } = useAuth();
  const { settings: globalSettings } = useSettings();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState([]);
  const [noteText, setNoteText] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);
  const [markingAttendance, setMarkingAttendance] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);
  const [memberAtt, setMemberAtt] = useState({});

  const isStaff = profile && ['admin', 'organiser'].includes(profile.role);
  const isAdmin = profile?.role === 'admin';
  const canEdit = isAdmin || !!globalSettings?.organisersCanEdit;

  useEffect(() => {
    getTeamByTeamId(teamId).then(async (t) => {
      setTeam(t);
      setLoading(false);
      if (t) {
        // Init member attendance from existing data
        const existing = t.memberAttendance || {};
        const att = { leader: existing.leader || null };
        if (t.member1Name) att.member1 = existing.member1 || null;
        if (t.member2Name) att.member2 = existing.member2 || null;
        if (t.member3Name) att.member3 = existing.member3 || null;
        setMemberAtt(att);
      }
      if (t && isStaff) {
        const n = await getTeamNotes(t.id).catch(() => []);
        setNotes(n);
      }
    });
  }, [teamId]);

  async function refreshNotes() {
    if (!team) return;
    const n = await getTeamNotes(team.id).catch(() => []);
    setNotes(n);
  }

  async function handleAddNote() {
    if (!noteText.trim() || !team) return;
    setSubmittingNote(true);
    await addTeamNote(team.id, noteText.trim(), user?.email, profile?.displayName || user?.displayName || user?.email);
    setNoteText('');
    await refreshNotes();
    setSubmittingNote(false);
  }

  async function handleToggleAttendance() {
    if (!team) return;
    setMarkingAttendance(true);
    const newVal = !team.attended;
    await markAttendance(team.id, newVal);
    setTeam(t => ({ ...t, attended: newVal }));
    setMarkingAttendance(false);
  }

  async function handleConfirmMemberAttendance() {
    if (!team) return;
    setMarkingAttendance(true);
    const vals = Object.values(memberAtt);
    const allPresent = vals.every(v => v === 'present');
    const allAbsent = vals.every(v => v === 'absent');
    let status = 'partial';
    if (allPresent) status = 'present';
    else if (allAbsent) status = 'absent';
    await confirmMemberAttendance(team.id, memberAtt, status, user?.email || 'staff');
    setTeam(t => ({ ...t, memberAttendance: memberAtt, attendanceStatus: status, attended: status === 'present' }));
    setMarkingAttendance(false);
  }

  function startEditing() {
    setEditForm({
      teamName: team.teamName || '',
      collegeName: team.collegeName || '',
      leaderName: team.leaderName || '',
      leaderPhone: team.leaderPhone || '',
      leaderEmail: team.leaderEmail || '',
      problemTitle: team.problemTitle || '',
      miniDescription: team.miniDescription || '',
    });
    setEditing(true);
  }

  async function handleSaveEdit() {
    if (!team) return;
    setSavingEdit(true);
    await updateTeamDetails(team.id, {
      ...editForm,
      lastEditedBy: user?.email || 'staff',
      lastEditedAt: new Date().toISOString(),
    });
    setTeam(t => ({ ...t, ...editForm }));
    setEditing(false);
    setSavingEdit(false);
  }

  if (loading) return <div className="loader">Loading...</div>;
  if (!team) return <div className="qr-public"><p style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>Team not found.</p></div>;

  const memberCount = team.memberCount || 1;
  const paymentColor = team.paymentStatus === 'verified' ? '#4ade80' : team.paymentStatus === 'rejected' ? '#f87171' : team.paymentStatus === 'uploaded' ? '#fbbf24' : 'rgba(255,255,255,0.4)';
  const statusColor = team.status === 'approved' ? '#4ade80' : team.status === 'waitlisted' ? '#fbbf24' : team.status === 'cancelled' ? '#f87171' : '#a5b4fc';

  return (
    <section className="qr-public">
      <div className="qr-public-card">

        {/* Header */}
        <div className="qr-header">
          <h2>NIRMAVORA FEST 2026</h2>
          <span className="qr-event-badge">
            {team.eventType === 'designathon' ? 'Designathon' : 'Hackathon'}
          </span>
        </div>

        {/* Team Details — visible to everyone */}
        <div style={{ padding: '20px 0' }}>
          <h3 style={{ fontSize: '1.7rem', fontWeight: 700, marginBottom: 4, textAlign: 'center', color: '#fff' }}>{team.teamName}</h3>
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginBottom: 20 }}>Team ID: {team.teamId || '-'}</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.05)' }}>
              <i className="fas fa-university" style={{ color: '#F5B301', marginTop: 2, width: 18 }}></i>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', marginBottom: 2 }}>College</p>
                <p style={{ color: '#fff', fontWeight: 600 }}>{team.collegeName || '-'}</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.05)' }}>
              <i className="fas fa-lightbulb" style={{ color: '#F5B301', marginTop: 2, width: 18 }}></i>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', marginBottom: 2 }}>Problem Title</p>
                <p style={{ color: '#fff', fontWeight: 600 }}>{team.problemTitle || '-'}</p>
              </div>
            </div>

            {team.department && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.05)' }}>
                <i className="fas fa-graduation-cap" style={{ color: '#F5B301', marginTop: 2, width: 18 }}></i>
                <div>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', marginBottom: 2 }}>Department</p>
                  <p style={{ color: '#fff', fontWeight: 600 }}>{team.department}{team.year ? ' - ' + team.year : ''}</p>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.05)' }}>
              <i className="fas fa-users" style={{ color: '#F5B301', marginTop: 2, width: 18 }}></i>
              <div style={{ flex: 1 }}>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', marginBottom: 6 }}>Team Members ({memberCount})</p>
                <p style={{ color: '#fff', fontWeight: 600, marginBottom: 2 }}><i className="fas fa-user-tie" style={{ fontSize: '0.7rem', marginRight: 6, color: '#F5B301' }}></i>{team.leaderName || '-'} <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>(Leader)</span></p>
                {team.member1Name && <p style={{ color: '#fff', fontWeight: 500, marginBottom: 2 }}><i className="fas fa-user" style={{ fontSize: '0.7rem', marginRight: 6, color: 'rgba(255,255,255,0.3)' }}></i>{team.member1Name}</p>}
                {team.member2Name && <p style={{ color: '#fff', fontWeight: 500, marginBottom: 2 }}><i className="fas fa-user" style={{ fontSize: '0.7rem', marginRight: 6, color: 'rgba(255,255,255,0.3)' }}></i>{team.member2Name}</p>}
                {team.member3Name && <p style={{ color: '#fff', fontWeight: 500, marginBottom: 2 }}><i className="fas fa-user" style={{ fontSize: '0.7rem', marginRight: 6, color: 'rgba(255,255,255,0.3)' }}></i>{team.member3Name}</p>}
              </div>
            </div>

          </div>

          {/* Status badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
            <span style={{ padding: '5px 14px', borderRadius: 20, background: 'rgba(255,255,255,0.07)', color: statusColor, fontWeight: 600, fontSize: '0.82rem', textTransform: 'capitalize' }}>
              <i className="fas fa-circle" style={{ fontSize: '0.55rem', marginRight: 6, verticalAlign: 'middle' }}></i>{team.status}
            </span>
            <span style={{ padding: '5px 14px', borderRadius: 20, background: 'rgba(255,255,255,0.07)', color: paymentColor, fontWeight: 600, fontSize: '0.82rem' }}>
              <i className="fas fa-rupee-sign" style={{ marginRight: 6 }}></i>{PAYMENT_LABELS[team.paymentStatus] || 'Unknown'}
            </span>
          </div>
        </div>

        {/* Staff-only section */}
        {isStaff && (
          <div className="qr-staff-panel" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: 24, paddingTop: 20 }}>
            <h4 style={{ color: '#F5B301', marginBottom: 16 }}>
              <i className="fas fa-shield-alt" style={{ marginRight: 8 }}></i>Staff Actions
            </h4>

            {/* Per-Member Attendance */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginBottom: 10 }}>Member Attendance</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { key: 'leader', label: 'Leader', name: team.leaderName },
                  ...(team.member1Name ? [{ key: 'member1', label: 'Member 1', name: team.member1Name }] : []),
                  ...(team.member2Name ? [{ key: 'member2', label: 'Member 2', name: team.member2Name }] : []),
                  ...(team.member3Name ? [{ key: 'member3', label: 'Member 3', name: team.member3Name }] : []),
                ].map(m => (
                  <div key={m.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.05)' }}>
                    <div>
                      <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem' }}>{m.label}</span>
                      <p style={{ color: '#fff', fontSize: '0.88rem', fontWeight: 500, margin: 0 }}>{m.name}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => setMemberAtt(p => ({ ...p, [m.key]: 'present' }))}
                        style={{ padding: '4px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, background: memberAtt[m.key] === 'present' ? '#4ade80' : 'rgba(255,255,255,0.1)', color: memberAtt[m.key] === 'present' ? '#000' : 'rgba(255,255,255,0.5)' }}
                      >P</button>
                      <button
                        onClick={() => setMemberAtt(p => ({ ...p, [m.key]: 'absent' }))}
                        style={{ padding: '4px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, background: memberAtt[m.key] === 'absent' ? '#f87171' : 'rgba(255,255,255,0.1)', color: memberAtt[m.key] === 'absent' ? '#000' : 'rgba(255,255,255,0.5)' }}
                      >A</button>
                    </div>
                  </div>
                ))}
              </div>
              <button
                className="btn btn-success"
                onClick={handleConfirmMemberAttendance}
                disabled={markingAttendance}
                style={{ marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 8 }}
              >
                {markingAttendance ? <><i className="fas fa-spinner fa-spin"></i> Saving...</> : <><i className="fas fa-check-circle"></i> Confirm Attendance</>}
              </button>
            </div>

            {/* Edit Team */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginBottom: 8 }}>Edit Team Details</p>
              {!editing ? (
                <>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      if (canEdit) {
                        startEditing();
                      } else {
                        alert('Editing is currently disabled by the admin. Ask the admin to enable "Organisers Can Edit" from Admin Dashboard > Settings.');
                      }
                    }}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
                  >
                    <i className="fas fa-edit"></i> Edit Team
                  </button>
                  {!canEdit && (
                    <p style={{ color: '#f87171', fontSize: '0.8rem', marginTop: 8 }}>
                      <i className="fas fa-lock" style={{ marginRight: 6 }}></i>Editing disabled by admin
                    </p>
                  )}
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {['teamName', 'collegeName', 'leaderName', 'leaderPhone', 'leaderEmail', 'problemTitle', 'miniDescription'].map(field => (
                    <div key={field}>
                      <label style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', textTransform: 'capitalize' }}>{field.replace(/([A-Z])/g, ' $1')}</label>
                      <input
                        value={editForm[field] || ''}
                        onChange={e => setEditForm(f => ({ ...f, [field]: e.target.value }))}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.9rem', boxSizing: 'border-box' }}
                      />
                    </div>
                  ))}
                  <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                    <button className="btn btn-success" onClick={handleSaveEdit} disabled={savingEdit} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      {savingEdit ? <><i className="fas fa-spinner fa-spin"></i> Saving...</> : <><i className="fas fa-check"></i> Save</>}
                    </button>
                    <button className="btn btn-danger" onClick={() => setEditing(false)} disabled={savingEdit} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <i className="fas fa-times"></i> Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Add note */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginBottom: 8 }}>Add Note / Comment</p>
              <textarea
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                placeholder="Write a note about this team..."
                rows={3}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', resize: 'vertical', fontSize: '0.9rem', boxSizing: 'border-box' }}
              />
              <button className="btn btn-primary" onClick={handleAddNote} disabled={submittingNote || !noteText.trim()}
                style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                {submittingNote ? <><i className="fas fa-spinner fa-spin"></i> Saving...</> : <><i className="fas fa-plus"></i> Add Note</>}
              </button>
            </div>

            {/* Notes list */}
            {notes.length > 0 && (
              <div>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginBottom: 8 }}>Notes ({notes.length})</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {notes.map(n => (
                    <div key={n.id} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: '10px 14px', borderLeft: '3px solid #F5B301' }}>
                      <div style={{ color: '#fff', fontSize: '0.9rem', marginBottom: 6 }}>{n.note}</div>
                      <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem' }}>
                        - {n.commenterName || n.commenterEmail} . {new Date(n.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {notes.length === 0 && <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.8rem' }}>No notes yet.</p>}
          </div>
        )}

      </div>
    </section>
  );
}
