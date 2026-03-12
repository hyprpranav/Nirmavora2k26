import { SDG_GOALS } from '../../config/constants';

export default function FormSummary({ data, eventType, onBack, onConfirm, submitting, error }) {
  // Support both array (sdgGoals) and legacy string (sdgGoal)
  const selectedGoals = data.sdgGoals && data.sdgGoals.length > 0
    ? data.sdgGoals.map(v => SDG_GOALS.find(s => s.value === v)?.label || `SDG ${v}`)
    : data.sdgGoal
      ? [SDG_GOALS.find(s => s.value === data.sdgGoal)?.label || data.sdgGoal]
      : [];

  const members = [];
  if (data.member1Name) members.push({ name: data.member1Name, phone: data.member1Phone, email: data.member1Email, department: data.member1Department });
  if (data.member2Name) members.push({ name: data.member2Name, phone: data.member2Phone, email: data.member2Email, department: data.member2Department });
  if (data.member3Name) members.push({ name: data.member3Name, phone: data.member3Phone, email: data.member3Email, department: data.member3Department });

  return (
    <div className="form-summary">
      <h3>Review Your Registration</h3>

      <table className="summary-table">
        <tbody>
          <tr><td>Event</td><td>{eventType === 'designathon' ? 'Designathon' : 'Hackathon'}</td></tr>
          <tr><td>College</td><td>{data.collegeName}</td></tr>
          <tr><td>Team Name</td><td>{data.teamName}</td></tr>
          <tr><td>SDG Goals</td><td>{selectedGoals.length > 0 ? selectedGoals.join(', ') : '—'}</td></tr>
          <tr><td>Problem Title</td><td>{data.problemTitle}</td></tr>
          {data.miniDescription && <tr><td>Description</td><td>{data.miniDescription}</td></tr>}
          <tr><td>Department</td><td>{data.leaderDepartment || data.department || '—'}</td></tr>
          <tr><td>Year</td><td>{data.year}</td></tr>
          <tr><td>Abstract</td><td>{data.abstractFile ? (<><i className="fas fa-file"></i> {data.abstractFile.name} ({(data.abstractFile.size / 1024).toFixed(1)} KB)</>) : '—'}</td></tr>
        </tbody>
      </table>

      <h4>Team Leader</h4>
      <p>{data.leaderName} · {data.leaderPhone} · {data.leaderEmail}{data.leaderDepartment ? ` · ${data.leaderDepartment}` : ''}</p>

      <h4>Team Members</h4>
      {members.map((m, i) => (
        <p key={i}>
          Member {i + 1}: {m.name} {m.phone && `· ${m.phone}`} {m.email && `· ${m.email}`}{m.department ? ` · ${m.department}` : ''}
        </p>
      ))}

      {error && <p className="auth-error">{error}</p>}

      <div className="form-actions">
        <button className="btn btn-secondary" onClick={onBack} disabled={submitting}>
          <i className="fas fa-arrow-left"></i> Edit
        </button>
        <button className="btn btn-primary btn-large" onClick={onConfirm} disabled={submitting}>
          {submitting ? 'Submitting…' : (<><i className="fas fa-paper-plane"></i> Confirm &amp; Submit</>)}
        </button>
      </div>
    </div>
  );
}
