import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
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

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  if (!profile || !['organiser', 'admin'].includes(profile.role)) return null;

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
        />
      )}

      {!loading && section === 'attendance' && (
        <CCAttendance teams={teams} onMarkAttendance={handleMarkAttendance} />
      )}

      {!loading && section === 'export' && (
        <CCExport teams={teams} />
      )}
    </CCLayout>
  );
}
