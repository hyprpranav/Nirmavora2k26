/**
 * Google Sheets backup sync.
 * Appends a team row to a Google Sheet via the Sheets API (v4).
 * This runs client-side using a restricted API key.
 */

const SHEETS_API_KEY = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY;
const SHEET_ID = import.meta.env.VITE_GOOGLE_SHEET_ID;

export async function syncTeamToSheets(team) {
  if (!SHEETS_API_KEY || !SHEET_ID) {
    console.warn('Google Sheets API not configured – skipping sync.');
    return;
  }

  const row = [
    team.teamId || '',
    team.teamName,
    team.eventType,
    team.collegeName,
    team.leaderName,
    team.leaderEmail,
    team.leaderPhone,
    team.member1Name || '',
    team.member2Name || '',
    team.member3Name || '',
    team.problemTitle,
    team.sdgGoal,
    team.abstractLink,
    team.status,
    team.paymentStatus || 'not_paid',
    team.createdAt,
  ];

  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Sheet1!A:P:append?valueInputOption=RAW&key=${SHEETS_API_KEY}`;
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ values: [row] }),
    });
  } catch (err) {
    console.error('Sheets sync failed:', err);
  }
}
