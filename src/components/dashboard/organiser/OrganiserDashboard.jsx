import { useState, useEffect } from 'react';
import { getAllTeams, updateTeamStatus, markAttendance, updateTeamDetails } from '../../../services/teamService';
import { exportTeamsCSV } from '../../../services/exportService';
import { sendCancellationMessageToTeam, sendShortlistConfirmationToTeam, sendWaitlistMessageToTeam, sendWaitlistPromotionMessageToTeam } from '../../../config/emailjs';
import { generateTeamId } from '../../../utils/teamIdGenerator';
import { TEAM_STATUS } from '../../../config/constants';
import '../../../styles/dashboard.css';

const TABS = ['Teams', 'Attendance'];

export default function OrganiserDashboard() {
  const [tab, setTab] = useState('Teams');
  const [teams, setTeams] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    loadTeams();
  }, []);

  async function loadTeams() {
    setLoading(true);
    const data = await getAllTeams();
    setTeams(data);
    setLoading(false);
  }

  const filtered = filter === 'all' ? teams : teams.filter((t) => t.status === filter);

  async function handleApprove(team) {
    const teamId = team.teamId || await generateTeamId(team.eventType, team.memberCount || 3);
    await updateTeamStatus(team.id, TEAM_STATUS.APPROVED, teamId);
    if (team.status === TEAM_STATUS.WAITLISTED) {
      await sendWaitlistPromotionMessageToTeam(team, teamId);
    } else {
      await sendShortlistConfirmationToTeam(team, teamId);
    }
    loadTeams();
  }

  async function handleWaitlist(team) {
    await updateTeamStatus(team.id, TEAM_STATUS.WAITLISTED);
    await sendWaitlistMessageToTeam(team);
    loadTeams();
  }

  async function handleCancel(team) {
    await updateTeamStatus(team.id, TEAM_STATUS.CANCELLED);
    await sendCancellationMessageToTeam(team);
    loadTeams();
  }

  async function handleAttendance(teamId, present) {
    await markAttendance(teamId, present);
    loadTeams();
  }

  function startEdit(team) {
    setEditId(team.id);
    setEditForm({
      teamName: team.teamName,
      collegeName: team.collegeName,
      leaderName: team.leaderName,
      leaderPhone: team.leaderPhone,
    });
  }

  async function saveEdit() {
    await updateTeamDetails(editId, editForm);
    setEditId(null);
    loadTeams();
  }

  return (
    <section className="dashboard-page">
      <div className="container">
        <h2 className="dash-title">Organiser Dashboard</h2>

        <div className="dash-tabs">
          {TABS.map((t) => (
            <button key={t} className={`dash-tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
              {t}
            </button>
          ))}
        </div>

        {tab === 'Teams' && (
          <div className="dash-content">
            <div className="dash-toolbar">
              <div className="filter-row">
                {['all', 'pending', 'approved', 'waitlisted', 'cancelled'].map((f) => (
                  <button key={f} className={`filter-btn${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
                    {f.charAt(0).toUpperCase() + f.slice(1)} ({f === 'all' ? teams.length : teams.filter((t) => t.status === f).length})
                  </button>
                ))}
              </div>
              <button className="btn btn-secondary" onClick={() => exportTeamsCSV(teams)}>
                <i className="fas fa-download"></i> Export CSV
              </button>
            </div>

            {loading ? (
              <p className="loader">Loading teams…</p>
            ) : filtered.length === 0 ? (
              <p className="empty-state">No teams found.</p>
            ) : (
              <div className="teams-table-wrap">
                <table className="teams-table">
                  <thead>
                    <tr>
                      <th>Team ID</th>
                      <th>Team Name</th>
                      <th>Event</th>
                      <th>College</th>
                      <th>Leader</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((team) => (
                      <tr key={team.id}>
                        <td>{team.teamId || '—'}</td>
                        <td>
                          {editId === team.id ? (
                            <input value={editForm.teamName} onChange={(e) => setEditForm({ ...editForm, teamName: e.target.value })} />
                          ) : (
                            team.teamName
                          )}
                        </td>
                        <td>{team.eventType}</td>
                        <td>
                          {editId === team.id ? (
                            <input value={editForm.collegeName} onChange={(e) => setEditForm({ ...editForm, collegeName: e.target.value })} />
                          ) : (
                            team.collegeName
                          )}
                        </td>
                        <td>{team.leaderName}</td>
                        <td><span className={`status-badge st-${team.status}`}>{team.status}</span></td>
                        <td className="actions-cell">
                          {editId === team.id ? (
                            <>
                              <button className="btn-sm save" onClick={saveEdit}>Save</button>
                              <button className="btn-sm" onClick={() => setEditId(null)}>Cancel</button>
                            </>
                          ) : (
                            <>
                              {(team.status === 'pending' || team.status === 'waitlisted') && (
                                <>
                                  <button className="btn-sm approve" onClick={() => handleApprove(team)}>Approve</button>
                                  {team.status === 'pending' && <button className="btn-sm waitlist" onClick={() => handleWaitlist(team)}>Waitlist</button>}
                                </>
                              )}
                              {team.status !== 'cancelled' && (
                                <button className="btn-sm cancel" onClick={() => handleCancel(team)}>Cancel</button>
                              )}
                              <button className="btn-sm edit" onClick={() => startEdit(team)}>Edit</button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === 'Attendance' && (
          <div className="dash-content">
            <h3>Mark Attendance</h3>
            {loading ? (
              <p className="loader">Loading…</p>
            ) : (
              <div className="teams-table-wrap">
                <table className="teams-table">
                  <thead>
                    <tr>
                      <th>Team ID</th>
                      <th>Team Name</th>
                      <th>Present</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teams
                      .filter((t) => t.status === 'approved')
                      .map((team) => (
                        <tr key={team.id}>
                          <td>{team.teamId}</td>
                          <td>{team.teamName}</td>
                          <td>{team.attendance ? '✓' : '—'}</td>
                          <td>
                            {!team.attendance ? (
                              <button className="btn-sm approve" onClick={() => handleAttendance(team.id, true)}>
                                Mark Present
                              </button>
                            ) : (
                              <button className="btn-sm cancel" onClick={() => handleAttendance(team.id, false)}>
                                Undo
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
