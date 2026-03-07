import { useEffect, useState } from 'react';
import { getAllTeams } from '../services/teamService';

export default function PublicDashboard() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    getAllTeams().then(t => {
      setTeams(t);
      setLoading(false);
    });
  }, []);

  const approved = teams.filter(t => t.status === 'approved');
  const visible = filter === 'all' ? teams : teams.filter(t => t.status === filter);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0f',
      color: '#fff',
      fontFamily: 'sans-serif',
      padding: '32px 16px',
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: '1.1rem', color: '#F5B301', letterSpacing: 4, marginBottom: 6, textTransform: 'uppercase' }}>
          NIRMAVORA 2K26
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>
          Registered Teams
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: 6, fontSize: '0.9rem' }}>
          Live registration tracker — read only
        </p>
      </div>

      {/* Stats */}
      <div style={{
        display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 32,
      }}>
        {[
          { label: 'Total Registered', value: teams.length, color: '#a5b4fc' },
          { label: 'Approved', value: teams.filter(t => t.status === 'approved').length, color: '#22c55e' },
          { label: 'Pending', value: teams.filter(t => t.status === 'pending').length, color: '#F5B301' },
          { label: 'Hackathon', value: teams.filter(t => t.eventType === 'hackathon').length, color: '#f472b6' },
          { label: 'Designathon', value: teams.filter(t => t.eventType === 'designathon').length, color: '#fb923c' },
        ].map(s => (
          <div key={s.label} style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12,
            padding: '16px 24px',
            textAlign: 'center',
            minWidth: 120,
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 24 }}>
        {['all', 'approved', 'pending', 'waitlisted', 'cancelled'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              background: filter === f ? '#F5B301' : 'rgba(255,255,255,0.07)',
              color: filter === f ? '#000' : '#fff',
              border: 'none',
              borderRadius: 20,
              padding: '6px 18px',
              cursor: 'pointer',
              fontSize: '0.82rem',
              fontWeight: filter === f ? 700 : 400,
              textTransform: 'capitalize',
            }}
          >
            {f === 'all' ? `All (${teams.length})` : `${f.charAt(0).toUpperCase() + f.slice(1)} (${teams.filter(t => t.status === f).length})`}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>Loading…</p>
      ) : (
        <div style={{ overflowX: 'auto', maxWidth: 900, margin: '0 auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)' }}>
                <th style={th}>#</th>
                <th style={th}>Team</th>
                <th style={th}>Team Leader</th>
                <th style={th}>Event</th>
                <th style={th}>College</th>
                <th style={th}>Members</th>
                <th style={th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((t, i) => (
                <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <td style={td}>{i + 1}</td>
                  <td style={td}>
                    <div style={{ fontWeight: 600 }}>{t.teamName}</div>
                    {t.teamId && <div style={{ fontSize: '0.72rem', color: '#F5B301' }}>{t.teamId}</div>}
                  </td>
                  <td style={td}>{t.leaderName}</td>
                  <td style={{ ...td, textTransform: 'capitalize' }}>
                    <span style={{
                      background: t.eventType === 'hackathon' ? 'rgba(244,114,182,0.15)' : 'rgba(251,146,60,0.15)',
                      color: t.eventType === 'hackathon' ? '#f472b6' : '#fb923c',
                      padding: '2px 8px', borderRadius: 10, fontSize: '0.75rem',
                    }}>
                      {t.eventType}
                    </span>
                  </td>
                  <td style={td}>{t.collegeName}</td>
                  <td style={td}>{t.memberCount || '—'}</td>
                  <td style={td}>
                    <span style={{
                      background: statusColor(t.status).bg,
                      color: statusColor(t.status).text,
                      padding: '2px 10px', borderRadius: 10, fontSize: '0.75rem', textTransform: 'capitalize',
                    }}>
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', padding: 24 }}>
                    No teams found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem', marginTop: 40 }}>
        NIRMAVORA 2K26 · Read-only public view · Data updates live
      </p>
    </div>
  );
}

const th = {
  padding: '10px 12px', textAlign: 'left', fontWeight: 600, fontSize: '0.78rem', whiteSpace: 'nowrap',
};
const td = {
  padding: '10px 12px', color: 'rgba(255,255,255,0.8)',
};

function statusColor(status) {
  switch (status) {
    case 'approved': return { bg: 'rgba(34,197,94,0.15)', text: '#22c55e' };
    case 'pending': return { bg: 'rgba(245,179,1,0.15)', text: '#F5B301' };
    case 'waitlisted': return { bg: 'rgba(99,102,241,0.15)', text: '#a5b4fc' };
    case 'cancelled': return { bg: 'rgba(239,68,68,0.15)', text: '#f87171' };
    default: return { bg: 'rgba(255,255,255,0.07)', text: '#fff' };
  }
}
