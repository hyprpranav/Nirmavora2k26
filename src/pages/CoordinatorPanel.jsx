import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import CCLayout from '../components/command-center/CCLayout';
import CCDashboard from '../components/command-center/sections/CCDashboard';
import CCTeams from '../components/command-center/sections/CCTeams';
import CCAttendance from '../components/command-center/sections/CCAttendance';
import CCExport from '../components/command-center/sections/CCExport';
import {
  getAllTeams,
  updateTeamStatus,
  updateTeamDetails,
  markAttendance,
  confirmMemberAttendance,
} from '../services/teamService';
import { generateTeamId } from '../utils/teamIdGenerator';
import { sendShortlistConfirmation, sendWaitlistMessage } from '../config/emailjs';
import { TEAM_STATUS, PAYMENT_STATUS } from '../config/constants';

const SECTION_TITLES = {
  dashboard: 'Dashboard',
  teams: 'Teams',
  attendance: 'Attendance',
  export: 'Export Data',
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
    const teamId = await generateTeamId(team.eventType, team.memberCount || 3);
    await updateTeamStatus(team.id, TEAM_STATUS.APPROVED, teamId);
    await sendShortlistConfirmation(team.leaderEmail, team.leaderName, team.teamName, teamId, team.eventType);
    loadTeams();
  }
  async function handleWaitlist(team) {
    await updateTeamStatus(team.id, TEAM_STATUS.WAITLISTED);
    await sendWaitlistMessage(team.leaderEmail, team.leaderName, team.teamName);
    loadTeams();
  }
  async function handleCancel(team) {
    await updateTeamStatus(team.id, TEAM_STATUS.CANCELLED);
    loadTeams();
  }
  async function handleEdit(docId, data) {
    await updateTeamDetails(docId, data);
    loadTeams();
  }
  async function handleMarkAttendance(docId, present) {
    await markAttendance(docId, present);
    loadTeams();
  }
  async function handleConfirmAttendance(docId, memberAtt, status) {
    await confirmMemberAttendance(docId, memberAtt, status);
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
    </CCLayout>
  );
}
