import Papa from 'papaparse';

function getAddedByLabel(addedBy) {
  if (addedBy === 'admin') return 'Admin (Manual)';
  if (addedBy === 'coordinator') return 'Coordinator';
  return 'Self-registered';
}

function toTitle(value) {
  if (!value) return 'Not Marked';
  if (value === 'not_marked') return 'Not Marked';
  return String(value)
    .split('_')
    .map((v) => v.charAt(0).toUpperCase() + v.slice(1))
    .join(' ');
}

function buildMembers(team) {
  const members = [
    { key: 'leader', name: team.leaderName || '', email: team.leaderEmail || '', phone: team.leaderPhone || '', role: 'Leader', department: team.leaderDepartment || team.department || '' },
  ];
  if (team.member1Name) members.push({ key: 'member1', name: team.member1Name, email: team.member1Email || '', phone: team.member1Phone || '', role: 'Member', department: team.member1Department || team.department || '' });
  if (team.member2Name) members.push({ key: 'member2', name: team.member2Name, email: team.member2Email || '', phone: team.member2Phone || '', role: 'Member', department: team.member2Department || team.department || '' });
  if (team.member3Name) members.push({ key: 'member3', name: team.member3Name, email: team.member3Email || '', phone: team.member3Phone || '', role: 'Member', department: team.member3Department || team.department || '' });
  return members;
}

function getMemberAttendanceStatus(team, memberKey) {
  const direct = team.memberAttendance && team.memberAttendance[memberKey];
  if (direct) return toTitle(direct);
  if (team.attendanceStatus === 'present') return 'Present';
  if (team.attendanceStatus === 'absent') return 'Absent';
  if (team.attendanceStatus === 'partial') return 'Partial';
  return 'Not Marked';
}

function downloadCSV(filename, csvString) {
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function normalizeCollegeKey(name) {
  return String(name || '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

/* ─── Master Log CSV ─── */
export function exportMasterLogCSV(teams) {
  const rows = teams.map((t) => ({
    TeamID: t.teamId || '',
    TeamName: t.teamName,
    EventType: t.eventType,
    College: t.collegeName,
    Department: t.department || '',
    Year: t.year,
    LeaderName: t.leaderName,
    LeaderEmail: t.leaderEmail,
    LeaderPhone: t.leaderPhone,
    LeaderDepartment: t.leaderDepartment || t.department || '',
    Member1: t.member1Name || '',
    Member1Department: t.member1Department || t.department || '',
    Member2: t.member2Name || '',
    Member2Department: t.member2Department || t.department || '',
    Member3: t.member3Name || '',
    Member3Department: t.member3Department || t.department || '',
    MemberCount: t.memberCount || '',
    ProblemTitle: t.problemTitle,
    SDG: Array.isArray(t.sdgGoals) ? t.sdgGoals.join(', ') : (t.sdgGoal || ''),
    AbstractFile: t.abstractFileName || t.abstractLink || '',
    AbstractURL: t.abstractFileUrl || t.abstractLink || '',
    Status: t.status,
    PaymentStatus: t.paymentStatus || 'not_paid',
    PaymentTxn: t.paymentTxnId || '',
    PaymentAmount: t.paymentStatus === 'verified' ? `₹${(t.memberCount || 3) * 350}` : '',
    PaymentScreenshot: t.paymentScreenshotUrl || t.paymentScreenshotLink || '',
    Attendance: t.attendance ? 'Yes' : 'No',
    AttendanceStatus: t.attendanceStatus || '',
    AddedBy: getAddedByLabel(t.addedBy),
    AddedByEmail: t.addedByEmail || '',
    LastEditedBy: t.lastEditedBy || '',
    LastEditedAt: t.lastEditedAt || '',
    AttendanceMarkedBy: t.attendanceMarkedBy || '',
    AttendanceMarkedAt: t.attendanceMarkedAt || '',
    RegisteredAt: t.createdAt,
  }));
  downloadCSV('nirmavora_master_log.csv', Papa.unparse(rows));
}

/* ─── College Attendance Summary CSV ─── */
export function exportCollegeAttendanceSummaryCSV(teams) {
  const map = teams.reduce((acc, t) => {
    const rawName = (t.collegeName || '').trim();
    if (!rawName) return acc;

    const key = normalizeCollegeKey(rawName);
    if (!acc[key]) {
      acc[key] = {
        name: rawName,
        count: 0,
        events: new Set(),
      };
    }

    acc[key].count += 1;
    if (t.eventType) acc[key].events.add(String(t.eventType).toLowerCase());

    // Prefer a more readable variant if current one is all caps/lowercase.
    if (
      acc[key].name === acc[key].name.toUpperCase() ||
      acc[key].name === acc[key].name.toLowerCase()
    ) {
      acc[key].name = rawName;
    }

    return acc;
  }, {});

  const rows = Object.values(map)
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .map((item, index) => {
      const hasHackathon = item.events.has('hackathon');
      const hasDesignathon = item.events.has('designathon');

      let eventRegistered = 'Other';
      if (hasHackathon && hasDesignathon) eventRegistered = 'Both';
      else if (hasHackathon) eventRegistered = 'Hackathon';
      else if (hasDesignathon) eventRegistered = 'Designathon';
      else if (item.events.size > 0) eventRegistered = Array.from(item.events).join(', ');

      return {
        'S.No': index + 1,
        'DTE College Name': item.name,
        'Number of Teams': item.count,
        'Registered Event(s)': eventRegistered,
      };
    });

  downloadCSV('nirmavora_college_attendance_summary.csv', Papa.unparse(rows));
}

/* ─── Event-specific Master Logs ─── */
export function exportHackathonMasterLogCSV(teams) {
  const rows = teams.filter((t) => t.eventType === 'hackathon');
  exportMasterLogCSVWithFilename(rows, 'nirmavora_hackathon_master_log.csv');
}

export function exportDesignathonMasterLogCSV(teams) {
  const rows = teams.filter((t) => t.eventType === 'designathon');
  exportMasterLogCSVWithFilename(rows, 'nirmavora_designathon_master_log.csv');
}

function exportMasterLogCSVWithFilename(teams, filename) {
  const rows = teams.map((t) => ({
    TeamID: t.teamId || '',
    TeamName: t.teamName,
    EventType: t.eventType,
    College: t.collegeName,
    Department: t.department || '',
    Year: t.year,
    LeaderName: t.leaderName,
    LeaderEmail: t.leaderEmail,
    LeaderPhone: t.leaderPhone,
    LeaderDepartment: t.leaderDepartment || t.department || '',
    Member1: t.member1Name || '',
    Member1Department: t.member1Department || t.department || '',
    Member2: t.member2Name || '',
    Member2Department: t.member2Department || t.department || '',
    Member3: t.member3Name || '',
    Member3Department: t.member3Department || t.department || '',
    MemberCount: t.memberCount || '',
    ProblemTitle: t.problemTitle,
    SDG: Array.isArray(t.sdgGoals) ? t.sdgGoals.join(', ') : (t.sdgGoal || ''),
    AbstractFile: t.abstractFileName || t.abstractLink || '',
    AbstractURL: t.abstractFileUrl || t.abstractLink || '',
    Status: t.status,
    PaymentStatus: t.paymentStatus || 'not_paid',
    PaymentTxn: t.paymentTxnId || '',
    PaymentAmount: t.paymentStatus === 'verified' ? `₹${(t.memberCount || 3) * 350}` : '',
    PaymentScreenshot: t.paymentScreenshotUrl || t.paymentScreenshotLink || '',
    Attendance: t.attendance ? 'Yes' : 'No',
    AttendanceStatus: t.attendanceStatus || '',
    AddedBy: getAddedByLabel(t.addedBy),
    AddedByEmail: t.addedByEmail || '',
    LastEditedBy: t.lastEditedBy || '',
    LastEditedAt: t.lastEditedAt || '',
    AttendanceMarkedBy: t.attendanceMarkedBy || '',
    AttendanceMarkedAt: t.attendanceMarkedAt || '',
    RegisteredAt: t.createdAt,
  }));
  downloadCSV(filename, Papa.unparse(rows));
}

/* ─── Team Summary CSV ─── */
export function exportTeamSummaryCSV(teams) {
  const rows = teams.map((t) => ({
    TeamID: t.teamId || '',
    TeamName: t.teamName,
    EventType: t.eventType,
    College: t.collegeName,
    Status: t.status,
    MemberCount: t.memberCount || '',
  }));
  downloadCSV('nirmavora_team_summary.csv', Papa.unparse(rows));
}

/* ─── Certificate CSV (Marked Teams Only) ─── */
export function exportCertificateCSV(teams) {
  const markedTeams = teams.filter((team) => {
    const status = (team.attendanceStatus || '').toLowerCase();
    return status === 'present' || status === 'partial' || status === 'absent' || !!team.attendanceConfirmed;
  });

  const rows = buildCertificateRows(markedTeams);
  downloadCSV('nirmavora_certificate_data.csv', Papa.unparse(rows));
}

/* ─── Certificate CSV (All Teams) ─── */
export function exportCertificateAllTeamsCSV(teams) {
  const rows = buildCertificateRows(teams);
  downloadCSV('nirmavora_certificate_data_all_teams.csv', Papa.unparse(rows));
}

function buildCertificateRows(teams) {
  const rows = [];
  let serial = 1;

  teams.forEach((team) => {
    const members = buildMembers(team);
    const isMarked = team.attendanceMarkedAt || team.attendanceConfirmed;
    const markedAt = isMarked && team.attendanceMarkedAt
      ? new Date(team.attendanceMarkedAt).toLocaleString()
      : 'Not Marked Yet';
    const markedBy = isMarked && team.attendanceMarkedBy
      ? team.attendanceMarkedBy
      : 'No Coordinator Marked Yet';
    members.forEach((member) => {
      rows.push({
        'S.No': serial,
        'Team Name & ID': `${team.teamName || ''} (${team.teamId || 'Pending'})`,
        'Members': member.name,
        'College Name': team.collegeName || '',
        'Status': getMemberAttendanceStatus(team, member.key),
        'Attendance Marked At': markedAt,
        'Attendance Marked By': markedBy,
      });
    });
    serial += 1;
  });

  return rows;
}

/* ─── Signature / Audition Sheet CSV ─── */
export function exportSignatureSheetCSV(teams) {
  const rows = [];
  let serial = 1;

  teams.forEach((team) => {
    const members = buildMembers(team);
    members.forEach((member) => {
      rows.push({
        'S.No': serial,
        'Team Name & ID': `${team.teamName || ''} (${team.teamId || 'Pending'})`,
        'Members': member.name,
        'College Name': team.collegeName || '',
        'Signature': '',
      });
    });
    serial += 1;
  });

  downloadCSV('nirmavora_signature_sheet.csv', Papa.unparse(rows));
}

/* ─── TeamID + TeamName CSV ─── */
export function exportTeamIdCSV(teams) {
  const rows = teams
    .filter((t) => t.teamId)
    .map((t) => ({ TeamID: t.teamId, TeamName: t.teamName }));
  downloadCSV('nirmavora_teamids.csv', Papa.unparse(rows));
}

/* ─── Alias for Organiser Dashboard ─── */
export const exportTeamsCSV = exportMasterLogCSV;

/* ─── Team Contact Sheet (row-per-member) ─── */
export function exportTeamContactSheetCSV(teams) {
  const rows = [];
  let serial = 1;
  teams.forEach((team) => {
    const members = buildMembers(team);
    members.forEach((member) => {
      rows.push({
        'S.No': serial,
        'Team Name & ID': `${team.teamName || ''} (${team.teamId || 'Pending'})`,
        'Member Name': member.name,
        'Role': member.role,
        'Department': member.department,
        'Phone': member.phone,
        'Email': member.email,
        'College Name': team.collegeName || '',
        'Event': toTitle(team.eventType),
        'Project Title': team.problemTitle || '',
        'Registered At': team.createdAt || '',
        'Member Attendance Status': getMemberAttendanceStatus(team, member.key),
        'Team Status': toTitle(team.status),
      });
    });
    serial += 1;
  });
  downloadCSV('nirmavora_team_contact_sheet.csv', Papa.unparse(rows));
}

/* ─── All Users Log CSV ─── */
export function exportAllUsersCSV(users) {
  const rows = users.map((u, i) => ({
    'S.No': i + 1,
    'Name': u.displayName || u.name || '',
    'Email': u.email || '',
    'Role': u.role || 'participant',
    'Registered At': u.createdAt || '',
  }));
  downloadCSV('nirmavora_all_users.csv', Papa.unparse(rows));
}

/* ─── Participants Only CSV ─── */
export function exportParticipantUsersCSV(users) {
  const participants = users.filter(u => (u.role || 'participant') === 'participant');
  const rows = participants.map((u, i) => ({
    'S.No': i + 1,
    'Name': u.displayName || u.name || '',
    'Email': u.email || '',
    'Registered At': u.createdAt || '',
  }));
  downloadCSV('nirmavora_participant_users.csv', Papa.unparse(rows));
}
