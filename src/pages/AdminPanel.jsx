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
import CCQR from '../components/command-center/sections/CCQR';
import {
  getAllTeams,
  updateTeamStatus,
  updateTeamDetails,
  markAttendance,
  confirmMemberAttendance,
  resetTeamAttendance,
  resetAllAttendance,
  deleteAllTeams,
  deleteTeam,
  getSettings,
  updateSettings,
  registerTeamManually,
} from '../services/teamService';
import { verifyPayment, rejectPayment } from '../services/paymentService';
import { getAllUsers, deleteUserProfile, changeUserRole, sendPasswordReset, deleteAllOrganisers, deleteAllParticipants, createParticipantUserByStaff } from '../services/userService';
import { generateTeamId } from '../utils/teamIdGenerator';
import { sendCancellationMessageToTeam, sendShortlistConfirmationToTeam, sendWaitlistMessageToTeam, sendWaitlistPromotionMessageToTeam } from '../config/emailjs';
import { TEAM_STATUS, PAYMENT_STATUS, ROLES } from '../config/constants';

const SECTION_TITLES = {
  dashboard: 'Dashboard',
  teams: 'Teams & Payments',
  users: 'Users',
  attendance: 'Attendance',
  export: 'Export Data',
  email: 'Email & Notifications',
  qr: 'QR Codes',
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
    const teamId = team.teamId || await generateTeamId(team.eventType, team.memberCount || 3);
    await updateTeamStatus(team.id, TEAM_STATUS.APPROVED, teamId);
    if (team.status === TEAM_STATUS.WAITLISTED) {
      await sendWaitlistPromotionMessageToTeam(team, teamId);
    } else {
      await sendShortlistConfirmationToTeam(team, teamId);
    }
    loadAll();
  }
  async function handleWaitlist(team) {
    await updateTeamStatus(team.id, TEAM_STATUS.WAITLISTED);
    await sendWaitlistMessageToTeam(team);
    loadAll();
  }
  async function handleCancel(team) {
    await updateTeamStatus(team.id, TEAM_STATUS.CANCELLED);
    await sendCancellationMessageToTeam(team);
    loadAll();
  }
  async function handleEdit(docId, data) {
    await updateTeamDetails(docId, {
      ...data,
      lastEditedBy: user?.email || 'admin',
      lastEditedAt: new Date().toISOString(),
    });
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
  async function handleConfirmAttendance(docId, memberAtt, status) {
    await confirmMemberAttendance(docId, memberAtt, status, user?.email || 'admin');
    loadAll();
  }
  async function handleResetSingleAttendance(team) {
    await resetTeamAttendance(team.id, user?.email || 'admin');
    loadAll();
  }
  async function handleResetAllAttendance() {
    await resetAllAttendance(user?.email || 'admin');
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
  async function handleDeleteUser(uid) {
    await deleteUserProfile(uid);
    loadAll();
  }
  async function handleDemoteUser(uid) {
    await changeUserRole(uid, ROLES.PARTICIPANT);
    loadAll();
  }
  async function handleResetPassword(email) {
    await sendPasswordReset(email);
    alert(`Password reset email sent to ${email}`);
  }

  async function handleCreateUser(data) {
    await createParticipantUserByStaff({
      name: data.name,
      email: data.email,
      password: data.password,
      createdByEmail: user?.email,
    });
    loadAll();
  }

  async function handleAddTeam(data) {
    const {
      accountName,
      accountEmail,
      accountPassword,
      ...teamData
    } = data;

    const account = await createParticipantUserByStaff({
      name: accountName || teamData.leaderName,
      email: accountEmail,
      password: accountPassword,
      createdByEmail: user?.email,
    });

    await registerTeamManually({
      ...teamData,
      userId: account.uid,
      userEmail: account.email,
      leaderEmail: teamData.leaderEmail || account.email,
    }, user?.email);
    loadAll();
  }
  async function handleDeleteTeam(team) {
    if (!window.confirm(`Permanently DELETE "${team.teamName}" (${team.teamId || 'no ID'})? This cannot be undone.`)) return;
    await deleteTeam(team.id);
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

      {/* Admin edit note */}
      {!loading && (section === 'teams' || section === 'attendance') && (
        <div className="cc-note cc-note-info">
          <i className="fas fa-info-circle"></i>
          <span>As <strong style={{ color: '#F5B301' }}>Master Admin</strong>, you can edit teams and mark attendance regardless of toggle settings. Download a backup before making changes.</span>
        </div>
      )}

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
          canEdit={true}
          canAttendance={true}
          onConfirmAttendance={handleConfirmAttendance}
          onResetAttendance={handleResetSingleAttendance}
          onAddTeam={handleAddTeam}
          onDelete={handleDeleteTeam}
          isAdmin={true}
        />
      )}

      {!loading && section === 'users' && (
        <CCUsers
          users={users}
          orgRequests={orgRequests}
          onApproveRequest={handleApproveRequest}
          onRejectRequest={handleRejectRequest}
          onPromote={handlePromote}
          onDeleteUser={handleDeleteUser}
          onDemoteUser={handleDemoteUser}
          onResetPassword={handleResetPassword}
          onCreateUser={handleCreateUser}
          loading={usersLoading}
        />
      )}

      {!loading && section === 'attendance' && (
        <CCAttendance
          teams={teams}
          onConfirmAttendance={handleConfirmAttendance}
          onResetTeamAttendance={handleResetSingleAttendance}
          onResetAllAttendance={handleResetAllAttendance}
          isAdmin={true}
          attendanceClosed={false}
          canEdit={true}
        />
      )}

      {!loading && section === 'export' && (
        <CCExport teams={teams} users={users} />
      )}

      {!loading && section === 'email' && (
        <CCEmail />
      )}

      {!loading && section === 'qr' && (
        <CCQR teams={teams} />
      )}

      {!loading && section === 'settings' && (
        <CCSettings
          settings={settings}
          onToggle={handleToggleSetting}
          onDeleteParticipants={async () => { await deleteAllTeams(); await deleteAllParticipants(); loadAll(); }}
          onDeleteOrganisers={async () => { await deleteAllOrganisers(); loadAll(); }}
          onDeleteAll={async () => { await deleteAllTeams(); await deleteAllParticipants(); await deleteAllOrganisers(); loadAll(); }}
        />
      )}
    </CCLayout>
  );
}
