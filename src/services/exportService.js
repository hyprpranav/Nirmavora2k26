import Papa from 'papaparse';

function downloadCSV(filename, csvString) {
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/* ─── Master Log CSV ─── */
export function exportMasterLogCSV(teams) {
  const rows = teams.map((t) => ({
    TeamID: t.teamId || '',
    TeamName: t.teamName,
    EventType: t.eventType,
    College: t.collegeName,
    Department: t.department,
    Year: t.year,
    LeaderName: t.leaderName,
    LeaderEmail: t.leaderEmail,
    LeaderPhone: t.leaderPhone,
    Member1: t.member1Name || '',
    Member2: t.member2Name || '',
    Member3: t.member3Name || '',
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
    AddedBy: t.addedBy === 'admin' ? 'Admin (Manual)' : 'Self-registered',
    AddedByEmail: t.addedByEmail || '',
    LastEditedBy: t.lastEditedBy || '',
    LastEditedAt: t.lastEditedAt || '',
    AttendanceMarkedBy: t.attendanceMarkedBy || '',
    AttendanceMarkedAt: t.attendanceMarkedAt || '',
    RegisteredAt: t.createdAt,
  }));
  downloadCSV('nirmavora_master_log.csv', Papa.unparse(rows));
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

/* ─── Certificate CSV ─── */
export function exportCertificateCSV(teams) {
  const rows = [];
  teams
    .filter((t) => t.attendance)
    .forEach((t) => {
      const members = [
        { name: t.leaderName, role: 'Leader' },
        t.member1Name ? { name: t.member1Name, role: 'Member' } : null,
        t.member2Name ? { name: t.member2Name, role: 'Member' } : null,
        t.member3Name ? { name: t.member3Name, role: 'Member' } : null,
      ].filter(Boolean);

      members.forEach((m) => {
        rows.push({
          Name: m.name,
          Role: m.role,
          TeamID: t.teamId,
          TeamName: t.teamName,
          College: t.collegeName,
          EventType: t.eventType,
          ProblemTitle: t.problemTitle,
        });
      });
    });
  downloadCSV('nirmavora_certificates.csv', Papa.unparse(rows));
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
