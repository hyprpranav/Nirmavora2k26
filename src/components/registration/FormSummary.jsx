import { SDG_GOALS } from '../../config/constants';

export default function FormSummary({ data, eventType, onBack, onConfirm, submitting, error }) {
  const sdg = SDG_GOALS.find((s) => s.value === data.sdgGoal);

  const members = [];
  if (data.member1Name) members.push({ name: data.member1Name, phone: data.member1Phone, email: data.member1Email });
  if (data.member2Name) members.push({ name: data.member2Name, phone: data.member2Phone, email: data.member2Email });
  if (data.member3Name) members.push({ name: data.member3Name, phone: data.member3Phone, email: data.member3Email });

  return (
    <div className="form-summary">
      <h3>Review Your Registration</h3>

      <table className="summary-table">
        <tbody>
          <tr><td>Event</td><td>{eventType === 'designathon' ? 'Designathon' : 'Hackathon'}</td></tr>
          <tr><td>College</td><td>{data.collegeName}</td></tr>
          <tr><td>Team Name</td><td>{data.teamName}</td></tr>
          <tr><td>SDG Goal</td><td>{sdg?.label || data.sdgGoal}</td></tr>
          <tr><td>Problem Title</td><td>{data.problemTitle}</td></tr>
          {data.miniDescription && <tr><td>Description</td><td>{data.miniDescription}</td></tr>}
          <tr><td>Department</td><td>{data.department}</td></tr>
          <tr><td>Year</td><td>{data.year}</td></tr>
          <tr><td>Abstract Link</td><td><a href={data.abstractLink} target="_blank" rel="noopener noreferrer">Open Link</a></td></tr>
        </tbody>
      </table>

      <h4>Team Leader</h4>
      <p>{data.leaderName} · {data.leaderPhone} · {data.leaderEmail}</p>

      <h4>Team Members</h4>
      {members.map((m, i) => (
        <p key={i}>
          Member {i + 1}: {m.name} {m.phone && `· ${m.phone}`} {m.email && `· ${m.email}`}
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
