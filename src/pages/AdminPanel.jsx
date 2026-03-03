import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import CCLayout from '../components/command-center/CCLayout';
import CCDashboard from '../components/command-center/sections/CCDashboard';
import CCTeams from '../components/command-center/sections/CCTeams';
import CCUsers from '../components/command-center/sections/CCUsers';
import CCAttendance from '../components/command-center/sections/CCAttendance';
import CCExport from '../components/command-center/sections/CCExport';
import CCEmail from '../components/command-center/sections/CCEmail';
import CCSettings from '../components/command-center/sections/CCSettings';
import {
  getAllTeams,
  updateTeamStatus,
  updateTeamDetails,
  markAttendance,
  getSettings,
  updateSettings,
} from '../services/teamService';
import { verifyPayment, rejectPayment } from '../services/paymentService';
import { getAllUsers } from '../services/userService';
import { generateTeamId } from '../utils/teamIdGenerator';
import { sendShortlistConfirmation, sendWaitlistMessage } from '../config/emailjs';
import { TEAM_STATUS, PAYMENT_STATUS, ROLES } from '../config/constants';

const SECTION_TITLES = {
  dashboard: 'Dashboard',
  teams: 'Teams & Payments',
  users: 'Users',
  attendance: 'Attendance',
  export: 'Export Data',
  email: 'Email & Notifications',
  settings: 'Settings',
};

export default function AdminPanel() {
  const { user, profile, signOut, updateRole, getOrganiserRequests, handleOrganiserRequest } = useAuth();
  const navigate = useNavigate();
  const [section, setSection] = useState('dashboard');
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [settings, setSettings] = useState({});
  const [orgRequests, setOrgRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);

  useEffect(() => {
    /* Redirect non-admin */
    if (profile && profile.role !== 'admin') {
      navigate('/');
      return;
    }
    loadAll();
  }, [profile]);

  async function loadAll() {
    setLoading(true);
    setUsersLoading(true);
    const [t, s] = await Promise.all([getAllTeams(), getSettings()]);
    setTeams(t);
    setSettings(s);
    setLoading(false);

    try {
      const [u, r] = await Promise.all([getAllUsers(), getOrganiserRequests()]);
      setUsers(u);
      setOrgRequests(r);
    } catch (err) {
      console.error('Failed to load users/requests:', err);
    }
    setUsersLoading(false);
  }

  /* ─── Handlers ─── */
  async function handleApprove(team) {
    const teamId = await generateTeamId(team.eventType, team.memberCount || 3);
    await updateTeamStatus(team.id, TEAM_STATUS.APPROVED, teamId);
    await sendShortlistConfirmation(team.leaderEmail, team.leaderName, team.teamName, teamId, team.eventType);
    loadAll();
  }
  async function handleWaitlist(team) {
    await updateTeamStatus(team.id, TEAM_STATUS.WAITLISTED);
    await sendWaitlistMessage(team.leaderEmail, team.leaderName, team.teamName);
    loadAll();
  }
  async function handleCancel(team) {
    await updateTeamStatus(team.id, TEAM_STATUS.CANCELLED);
    loadAll();
  }
  async function handleEdit(docId, data) {
    await updateTeamDetails(docId, data);
    loadAll();
  }
  async function handleVerifyPayment(docId) {
    await verifyPayment(docId);
    loadAll();
  }
  async function handleRejectPayment(docId) {
    await rejectPayment(docId);
    loadAll();
  }
  async function handleMarkAttendance(docId, present) {
    await markAttendance(docId, present);
    loadAll();
  }
  async function handleToggleSetting(key) {
    const newVal = !settings[key];
    await updateSettings({ [key]: newVal });
    setSettings(s => ({ ...s, [key]: newVal }));
  }
  async function handleApproveRequest(reqId, uid) {
    await handleOrganiserRequest(reqId, uid, true);
    const r = await getOrganiserRequests();
    setOrgRequests(r);
  }
  async function handleRejectRequest(reqId, uid) {
    await handleOrganiserRequest(reqId, uid, false);
    const r = await getOrganiserRequests();
    setOrgRequests(r);
  }
  async function handlePromote(uid) {
    await updateRole(uid, ROLES.ORGANISER);
    alert('User promoted to Coordinator.');
    loadAll();
  }

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  if (!profile || profile.role !== 'admin') return null;

  return (
    <CCLayout
      section={section}
      onNavigate={setSection}
      role="admin"
      user={user}
      onSignOut={handleSignOut}
      title={SECTION_TITLES[section] || 'Dashboard'}
    >
      {loading && <p style={{ color: 'rgba(255,255,255,0.4)' }}>Loading data…</p>}

      {!loading && section === 'dashboard' && (
        <CCDashboard teams={teams} users={users} TEAM_STATUS={TEAM_STATUS} PAYMENT_STATUS={PAYMENT_STATUS} />
      )}

      {!loading && section === 'teams' && (
        <CCTeams
          teams={teams}
          onApprove={handleApprove}
          onWaitlist={handleWaitlist}
          onCancel={handleCancel}
          onEdit={handleEdit}
          TEAM_STATUS={TEAM_STATUS}
          showPayments={true}
          onVerifyPayment={handleVerifyPayment}
          onRejectPayment={handleRejectPayment}
          PAYMENT_STATUS={PAYMENT_STATUS}
        />
      )}

      {!loading && section === 'users' && (
        <CCUsers
          users={users}
          orgRequests={orgRequests}
          onApproveRequest={handleApproveRequest}
          onRejectRequest={handleRejectRequest}
          onPromote={handlePromote}
          loading={usersLoading}
        />
      )}

      {!loading && section === 'attendance' && (
        <CCAttendance teams={teams} onMarkAttendance={handleMarkAttendance} />
      )}

      {!loading && section === 'export' && (
        <CCExport teams={teams} />
      )}

      {!loading && section === 'email' && (
        <CCEmail />
      )}

      {!loading && section === 'settings' && (
        <CCSettings settings={settings} onToggle={handleToggleSetting} />
      )}
    </CCLayout>
  );
}
