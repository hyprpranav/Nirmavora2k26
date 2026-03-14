import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import CCLayout from '../components/command-center/CCLayout';
import CCDashboard from '../components/command-center/sections/CCDashboard';
import CCTeams from '../components/command-center/sections/CCTeams';
import CCAttendance from '../components/command-center/sections/CCAttendance';
import CCExport from '../components/command-center/sections/CCExport';
import CCQR from '../components/command-center/sections/CCQR';
import {
  getAllTeams,
  updateTeamStatus,
  updateTeamDetails,
  markAttendance,
  confirmMemberAttendance,
  registerTeamByCoordinator,
} from '../services/teamService';
import { createParticipantUserByStaff } from '../services/userService';
import { generateTeamId } from '../utils/teamIdGenerator';
import { sendCancellationMessage, sendShortlistConfirmation, sendWaitlistMessage, sendWaitlistPromotionMessage } from '../config/emailjs';
import { TEAM_STATUS, PAYMENT_STATUS, DEVELOPER } from '../config/constants';

const SECTION_TITLES = {
  dashboard: 'Dashboard',
  teams: 'Teams',
  attendance: 'Attendance',
  export: 'Export Data',
  qr: 'QR Codes',
  contact: 'Contact Developer',
};

export default function CoordinatorPanel() {
  const { user, profile, signOut } = useAuth();
  const { settings: globalSettings } = useSettings();
  const navigate = useNavigate();
  const [section, setSection] = useState('dashboard');
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile && !['organiser', 'admin'].includes(profile.role)) {
      navigate('/');
      return;
    }
    loadTeams();
  }, [profile]);

  async function loadTeams() {
    setLoading(true);
    const data = await getAllTeams();
    setTeams(data);
    setLoading(false);
  }

  async function handleApprove(team) {
    const teamId = team.teamId || await generateTeamId(team.eventType, team.memberCount || 3);
    await updateTeamStatus(team.id, TEAM_STATUS.APPROVED, teamId);
    if (team.status === TEAM_STATUS.WAITLISTED) {
      await sendWaitlistPromotionMessage(team.leaderEmail, team.leaderName, team.teamName, teamId, team.eventType);
    } else {
      await sendShortlistConfirmation(team.leaderEmail, team.leaderName, team.teamName, teamId, team.eventType);
    }
    loadTeams();
  }
  async function handleWaitlist(team) {
    await updateTeamStatus(team.id, TEAM_STATUS.WAITLISTED);
    await sendWaitlistMessage(team.leaderEmail, team.leaderName, team.teamName);
    loadTeams();
  }
  async function handleCancel(team) {
    await updateTeamStatus(team.id, TEAM_STATUS.CANCELLED);
    await sendCancellationMessage(team.leaderEmail, team.leaderName, team.teamName);
    loadTeams();
  }
  async function handleEdit(docId, data) {
    await updateTeamDetails(docId, {
      ...data,
      lastEditedBy: user?.email || 'coordinator',
      lastEditedAt: new Date().toISOString(),
    });
    loadTeams();
  }
  async function handleMarkAttendance(docId, present) {
    await markAttendance(docId, present);
    loadTeams();
  }
  async function handleConfirmAttendance(docId, memberAtt, status) {
    await confirmMemberAttendance(docId, memberAtt, status, user?.email || 'coordinator');
    loadTeams();
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

    await registerTeamByCoordinator({
      ...teamData,
      userId: account.uid,
      userEmail: account.email,
      leaderEmail: teamData.leaderEmail || account.email,
    }, user?.email);
    loadTeams();
  }

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  if (!profile || !['organiser', 'admin'].includes(profile.role)) return null;

  const canEdit = !!globalSettings.organisersCanEdit;
  const attendanceClosed = !globalSettings.attendanceEnabled;

  return (
    <CCLayout
      section={section}
      onNavigate={setSection}
      role="coordinator"
      user={user}
      onSignOut={handleSignOut}
      title={SECTION_TITLES[section] || 'Dashboard'}
    >
      {loading && <p style={{ color: 'rgba(255,255,255,0.4)' }}>Loading data…</p>}

      {/* Coordinator note */}
      {!loading && (section === 'teams' || section === 'attendance') && (
        <div className="cc-note cc-note-info">
          <i className="fas fa-info-circle"></i>
          <span>
            {!canEdit && section === 'teams' && 'Editing is currently disabled by the admin. You can view team details by clicking on a row.'}
            {canEdit && section === 'teams' && 'Editing is enabled. Click a team to open details and edit. Download a backup before making changes.'}
            {attendanceClosed && section === 'attendance' && 'Attendance marking is currently disabled by the admin.'}
            {!attendanceClosed && section === 'attendance' && 'Click a team to open the attendance card and mark each member.'}
          </span>
        </div>
      )}

      {!loading && section === 'dashboard' && (
        <CCDashboard teams={teams} TEAM_STATUS={TEAM_STATUS} PAYMENT_STATUS={PAYMENT_STATUS} />
      )}

      {!loading && section === 'teams' && (
        <CCTeams
          teams={teams}
          onApprove={handleApprove}
          onWaitlist={handleWaitlist}
          onCancel={handleCancel}
          onEdit={handleEdit}
          TEAM_STATUS={TEAM_STATUS}
          showPayments={false}
          canEdit={canEdit}
          canAttendance={!attendanceClosed}
          onConfirmAttendance={handleConfirmAttendance}
          onAddTeam={handleAddTeam}
        />
      )}

      {!loading && section === 'attendance' && (
        <CCAttendance
          teams={teams}
          onConfirmAttendance={handleConfirmAttendance}
          attendanceClosed={attendanceClosed}
          canEdit={canEdit}
        />
      )}

      {!loading && section === 'export' && (
        <CCExport teams={teams} />
      )}

      {!loading && section === 'qr' && (
        <CCQR teams={teams} />
      )}

      {section === 'contact' && (
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(245,179,1,0.25)', borderRadius: 14, padding: 28, textAlign: 'center' }}>
            <i className="fas fa-headset" style={{ fontSize: '2.5rem', color: '#F5B301', marginBottom: 16 }}></i>
            <h3 style={{ color: '#fff', marginBottom: 4 }}>Technical Support</h3>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: 20 }}>For any issues with the platform, contact the developer</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
              <p style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 600 }}>{DEVELOPER.name}</p>
              <a href={`mailto:${DEVELOPER.email}`} style={{ color: '#a5b4fc', display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', fontSize: '0.95rem' }}>
                <i className="fas fa-envelope"></i> {DEVELOPER.email}
              </a>
              <a href={`tel:+91${DEVELOPER.phoneRaw}`} style={{ color: '#4ade80', display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', fontSize: '0.95rem' }}>
                <i className="fas fa-phone"></i> {DEVELOPER.phone}
              </a>
              <a href={`https://wa.me/91${DEVELOPER.phoneRaw}`} target="_blank" rel="noopener noreferrer" style={{ color: '#22c55e', display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', fontSize: '0.95rem', marginTop: 4 }}>
                <i className="fab fa-whatsapp"></i> WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </CCLayout>
  );
}
