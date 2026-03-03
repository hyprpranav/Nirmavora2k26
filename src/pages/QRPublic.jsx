import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getTeamByTeamId } from '../services/teamService';
import '../styles/qr-public.css';

export default function QRPublic() {
  const { teamId } = useParams();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTeamByTeamId(teamId).then((t) => {
      setTeam(t);
      setLoading(false);
    });
  }, [teamId]);

  if (loading) return <div className="loader">Loading…</div>;
  if (!team) return <div className="qr-public"><p>Team not found.</p></div>;

  const members = [
    team.member1Name,
    team.member2Name,
    team.member3Name,
  ].filter(Boolean);

  return (
    <section className="qr-public">
      <div className="qr-public-card">
        <div className="qr-header">
          <h2>NIRMAVORA FEST 2026</h2>
          <span className="qr-event-badge">
            {team.eventType === 'designathon' ? 'Designathon' : 'Hackathon'}
          </span>
        </div>

        <div className="qr-body">
          <h3>{team.teamName}</h3>
          <p className="qr-team-id">ID: {team.teamId}</p>
          <p><strong>Problem:</strong> {team.problemTitle}</p>
          <p><strong>College:</strong> {team.collegeName}</p>

          <div className="qr-members">
            <h4>Team Members</h4>
            <ol>
              <li><strong>{team.leaderName}</strong> (Leader)</li>
              {members.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
