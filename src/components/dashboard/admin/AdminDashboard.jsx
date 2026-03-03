import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import {
  getAllTeams,
  updateTeamStatus,
  markAttendance,
  getSettings,
  updateSettings,
} from '../../../services/teamService';
import { verifyPayment, rejectPayment } from '../../../services/paymentService';
import { generateTeamId } from '../../../utils/teamIdGenerator';
import { generateTeamQR } from '../../../services/qrService';
import {
  exportMasterLogCSV,
  exportTeamSummaryCSV,
  exportCertificateCSV,
  exportTeamIdCSV,
} from '../../../services/exportService';
import { TEAM_STATUS, PAYMENT_STATUS, ROLES } from '../../../config/constants';
import { sendTestEmail, sendNotification, wakeUpEmailService } from '../../../config/emailjs';
import '../../../styles/dashboard.css';

const TABS = ['Analytics', 'Teams', 'Payments', 'Attendance', 'Export', 'Settings'];

export default function AdminDashboard() {
  const { updateRole } = useAuth();
  const [tab, setTab] = useState('Analytics');
  const [teams, setTeams] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  /* Promote organiser form */
  const [promoteUid, setPromoteUid] = useState('');

  /* Test email */
  const [testEmail, setTestEmail] = useState('');
  const [testEmailStatus, setTestEmailStatus] = useState('');

  /* Broadcast notification */
  const [notifEmail, setNotifEmail] = useState('');
  const [notifSubject, setNotifSubject] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifStatus, setNotifStatus] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [t, s] = await Promise.all([getAllTeams(), getSettings()]);
    setTeams(t);
    setSettings(s);
    setLoading(false);
  }

  /* Analytics computed */
  const total = teams.length;
  const approved = teams.filter((t) => t.status === TEAM_STATUS.APPROVED).length;
  const pending = teams.filter((t) => t.status === TEAM_STATUS.PENDING).length;
  const waitlisted = teams.filter((t) => t.status === TEAM_STATUS.WAITLISTED).length;
  const paidVerified = teams.filter((t) => t.paymentStatus === PAYMENT_STATUS.VERIFIED).length;
  const designathon = teams.filter((t) => t.eventType === 'designathon').length;
  const hackathon = teams.filter((t) => t.eventType === 'hackathon').length;
  const attended = teams.filter((t) => t.attendance).length;

  async function handleVerifyPayment(teamId) {
    await verifyPayment(teamId);
    loadData();
  }

  async function handleRejectPayment(teamId) {
    await rejectPayment(teamId);
    loadData();
  }

  async function handlePromote() {
    if (!promoteUid.trim()) return;
    await updateRole(promoteUid.trim(), ROLES.ORGANISER);
    setPromoteUid('');
    alert('User promoted to Organiser.');
  }

  async function toggleSetting(key) {
    const newVal = !settings[key];
    await updateSettings({ [key]: newVal });
    setSettings((s) => ({ ...s, [key]: newVal }));
  }

  async function handleTestEmail() {
    if (!testEmail.includes('@')) return setTestEmailStatus('Enter a valid email.');
    setTestEmailStatus('Sending…');
    try {
      await wakeUpEmailService();
      await sendTestEmail(testEmail);
      setTestEmailStatus('✅ Test email sent! Check your inbox.');
    } catch (err) {
      setTestEmailStatus(`❌ Failed: ${err.message}`);
    }
  }

  async function handleSendNotification() {
    if (!notifEmail.includes('@')) return setNotifStatus('Enter a valid email.');
    if (!notifMessage.trim()) return setNotifStatus('Enter a message.');
    setNotifStatus('Sending…');
    try {
      await sendNotification(notifEmail, '', notifSubject || 'NIRMAVORA Update', notifMessage);
      setNotifStatus('✅ Notification sent!');
      setNotifEmail(''); setNotifSubject(''); setNotifMessage('');
    } catch (err) {
      setNotifStatus(`❌ Failed: ${err.message}`);
    }
  }

  return (
    <section className="dashboard-page admin-dashboard">
      <div className="container">
        <h2 className="dash-title">Master Admin Dashboard</h2>

        <div className="dash-tabs">
          {TABS.map((t) => (
            <button key={t} className={`dash-tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
              {t}
            </button>
          ))}
        </div>

        <div className="dash-content">
          {loading && <p className="loader">Loading…</p>}

          {/* ─── Analytics ─── */}
          {tab === 'Analytics' && !loading && (
            <div className="analytics-grid">
              <div className="analytics-card"><h3>{total}</h3><p>Total Teams</p></div>
              <div className="analytics-card"><h3>{approved}</h3><p>Approved</p></div>
              <div className="analytics-card"><h3>{pending}</h3><p>Pending</p></div>
              <div className="analytics-card"><h3>{waitlisted}</h3><p>Waitlisted</p></div>
              <div className="analytics-card"><h3>{paidVerified}</h3><p>Payments Verified</p></div>
              <div className="analytics-card"><h3>{designathon}</h3><p>Designathon</p></div>
              <div className="analytics-card"><h3>{hackathon}</h3><p>Hackathon</p></div>
              <div className="analytics-card"><h3>{attended}</h3><p>Attended</p></div>
            </div>
          )}

          {/* ─── Teams (same as organiser but master view) ─── */}
          {tab === 'Teams' && !loading && (
            <div className="teams-table-wrap">
              <table className="teams-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Team</th>
                    <th>Event</th>
                    <th>College</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Attendance</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((t) => (
                    <tr key={t.id}>
                      <td>{t.teamId || '—'}</td>
                      <td>{t.teamName}</td>
                      <td>{t.eventType}</td>
                      <td>{t.collegeName}</td>
                      <td><span className={`status-badge st-${t.status}`}>{t.status}</span></td>
                      <td>{t.paymentStatus || 'not_paid'}</td>
                      <td>{t.attendance ? '✓' : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ─── Payments ─── */}
          {tab === 'Payments' && !loading && (
            <div className="teams-table-wrap">
              <table className="teams-table">
                <thead>
                  <tr>
                    <th>Team ID</th>
                    <th>Team</th>
                    <th>TXN ID</th>
                    <th>Screenshot</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teams
                    .filter((t) => t.paymentStatus && t.paymentStatus !== PAYMENT_STATUS.NOT_PAID)
                    .map((t) => (
                      <tr key={t.id}>
                        <td>{t.teamId}</td>
                        <td>{t.teamName}</td>
                        <td>{t.paymentTxnId || '—'}</td>
                        <td>
                          {t.paymentScreenshotLink ? (
                            <a href={t.paymentScreenshotLink} target="_blank" rel="noopener noreferrer">
                              View
                            </a>
                          ) : '—'}
                        </td>
                        <td><span className={`status-badge st-${t.paymentStatus}`}>{t.paymentStatus}</span></td>
                        <td>
                          {t.paymentStatus === PAYMENT_STATUS.UPLOADED && (
                            <>
                              <button className="btn-sm approve" onClick={() => handleVerifyPayment(t.id)}>Verify</button>
                              <button className="btn-sm cancel" onClick={() => handleRejectPayment(t.id)}>Reject</button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ─── Attendance ─── */}
          {tab === 'Attendance' && !loading && (
            <div className="teams-table-wrap">
              <table className="teams-table">
                <thead>
                  <tr>
                    <th>Team ID</th>
                    <th>Team</th>
                    <th>Present</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {teams
                    .filter((t) => t.status === TEAM_STATUS.APPROVED)
                    .map((t) => (
                      <tr key={t.id}>
                        <td>{t.teamId}</td>
                        <td>{t.teamName}</td>
                        <td>{t.attendance ? '✓' : '—'}</td>
                        <td>
                          <button
                            className={`btn-sm ${t.attendance ? 'cancel' : 'approve'}`}
                            onClick={() => markAttendance(t.id, !t.attendance).then(loadData)}
                          >
                            {t.attendance ? 'Unmark' : 'Mark Present'}
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ─── Export ─── */}
          {tab === 'Export' && !loading && (
            <div className="export-section">
              <h3>Export Data</h3>
              <div className="export-buttons">
                <button className="btn btn-secondary" onClick={() => exportMasterLogCSV(teams)}>
                  <i className="fas fa-file-csv"></i> Master Log CSV
                </button>
                <button className="btn btn-secondary" onClick={() => exportTeamSummaryCSV(teams)}>
                  <i className="fas fa-file-csv"></i> Team Summary CSV
                </button>
                <button className="btn btn-secondary" onClick={() => exportCertificateCSV(teams)}>
                  <i className="fas fa-file-csv"></i> Certificate CSV
                </button>
                <button className="btn btn-secondary" onClick={() => exportTeamIdCSV(teams)}>
                  <i className="fas fa-file-csv"></i> TeamID + TeamName CSV
                </button>
              </div>
            </div>
          )}

          {/* ─── Settings ─── */}
          {tab === 'Settings' && !loading && (
            <div className="settings-section">
              <h3>Platform Settings</h3>
              <div className="setting-row">
                <label>Registration Open</label>
                <button className={`toggle-btn${settings.registrationOpen ? ' on' : ''}`} onClick={() => toggleSetting('registrationOpen')}>
                  {settings.registrationOpen ? 'ON' : 'OFF'}
                </button>
              </div>
              <div className="setting-row">
                <label>Feedback Enabled</label>
                <button className={`toggle-btn${settings.feedbackEnabled ? ' on' : ''}`} onClick={() => toggleSetting('feedbackEnabled')}>
                  {settings.feedbackEnabled ? 'ON' : 'OFF'}
                </button>
              </div>
              <div className="setting-row">
                <label>Attendance Enabled</label>
                <button className={`toggle-btn${settings.attendanceEnabled ? ' on' : ''}`} onClick={() => toggleSetting('attendanceEnabled')}>
                  {settings.attendanceEnabled ? 'ON' : 'OFF'}
                </button>
              </div>

              <hr />
              <h4>Promote User to Organiser</h4>
              <div className="form-row">
                <input
                  placeholder="Firebase UID of user"
                  value={promoteUid}
                  onChange={(e) => setPromoteUid(e.target.value)}
                />
                <button className="btn btn-primary" onClick={handlePromote}>Promote</button>
              </div>

              <hr />
              <h4>🔧 Test Email Configuration</h4>
              <p style={{ color: '#999', fontSize: '0.85rem', marginBottom: '10px' }}>
                Send a test email to verify the email service is working correctly.
              </p>
              <div className="form-row">
                <input
                  type="email"
                  placeholder="your-email@gmail.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                />
                <button className="btn btn-primary" onClick={handleTestEmail}>Send Test</button>
              </div>
              {testEmailStatus && <p style={{ marginTop: '8px', fontSize: '0.85rem' }}>{testEmailStatus}</p>}

              <hr />
              <h4>📧 Send Notification Email</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input
                  type="email"
                  placeholder="Recipient email"
                  value={notifEmail}
                  onChange={(e) => setNotifEmail(e.target.value)}
                  style={{ padding: '10px 14px', background: 'var(--dark-base)', border: '1px solid var(--medium-gray)', borderRadius: '6px', color: 'var(--soft-white)', fontFamily: 'var(--font-primary)' }}
                />
                <input
                  placeholder="Subject (optional)"
                  value={notifSubject}
                  onChange={(e) => setNotifSubject(e.target.value)}
                  style={{ padding: '10px 14px', background: 'var(--dark-base)', border: '1px solid var(--medium-gray)', borderRadius: '6px', color: 'var(--soft-white)', fontFamily: 'var(--font-primary)' }}
                />
                <textarea
                  placeholder="Message body"
                  value={notifMessage}
                  onChange={(e) => setNotifMessage(e.target.value)}
                  rows={3}
                  style={{ padding: '10px 14px', background: 'var(--dark-base)', border: '1px solid var(--medium-gray)', borderRadius: '6px', color: 'var(--soft-white)', fontFamily: 'var(--font-primary)', resize: 'vertical' }}
                />
                <button className="btn btn-primary" onClick={handleSendNotification}>Send Notification</button>
              </div>
              {notifStatus && <p style={{ marginTop: '8px', fontSize: '0.85rem' }}>{notifStatus}</p>}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
