import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  setDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { TEAM_STATUS, PAYMENT_STATUS } from '../config/constants';

const TEAMS = 'teams';
const SETTINGS = 'settings';
const FEEDBACK = 'feedback';

/* ─── Registration ─── */
export async function registerTeam(data) {
  const teamData = {
    ...data,
    status: TEAM_STATUS.PENDING,
    paymentStatus: PAYMENT_STATUS.NOT_PAID,
    teamId: null,
    attendance: false,
    createdAt: new Date().toISOString(),
    memberCount: countMembers(data),
    addedBy: 'self',
  };
  const ref = await addDoc(collection(db, TEAMS), teamData);
  return ref.id;
}

/* ─── Admin Manual Add ─── */
export async function registerTeamManually(data, adminEmail) {
  const teamData = {
    ...data,
    status: TEAM_STATUS.PENDING,
    paymentStatus: PAYMENT_STATUS.NOT_PAID,
    teamId: null,
    attendance: false,
    createdAt: new Date().toISOString(),
    memberCount: countMembers(data),
    addedBy: 'admin',
    addedByEmail: adminEmail || 'admin',
    addedAt: new Date().toISOString(),
    userId: data.userId || null,
    userEmail: data.userEmail || data.leaderEmail || '',
  };
  const ref = await addDoc(collection(db, TEAMS), teamData);
  return ref.id;
}

function countMembers(data) {
  let count = 1; // leader
  if (data.member1Name) count++;
  if (data.member2Name) count++;
  if (data.member3Name) count++;
  return count;
}

/* ─── Queries ─── */
export async function getTeamsByUser(userId, userEmail) {
  // Query by userId (no orderBy to avoid composite index requirement)
  const q = query(collection(db, TEAMS), where('userId', '==', userId));
  const snap = await getDocs(q);
  let teams = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

  // Fallback: also search by leaderEmail in case team was added manually by admin
  if (teams.length === 0 && userEmail) {
    const q2 = query(collection(db, TEAMS), where('leaderEmail', '==', userEmail));
    const snap2 = await getDocs(q2);
    teams = snap2.docs.map((d) => ({ id: d.id, ...d.data() }));
  }

  // Sort client-side by createdAt descending
  return teams.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}

export async function getAllTeams() {
  const q = query(collection(db, TEAMS), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getTeamById(docId) {
  const snap = await getDoc(doc(db, TEAMS, docId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function getTeamByTeamId(teamId) {
  const q = query(collection(db, TEAMS), where('teamId', '==', teamId));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() };
}

/* ─── Status Updates ─── */
export async function updateTeamStatus(docId, status, teamId = null) {
  const update = { status };
  if (teamId) update.teamId = teamId;
  await updateDoc(doc(db, TEAMS, docId), update);
}

export async function updateTeamDetails(docId, partial) {
  await updateDoc(doc(db, TEAMS, docId), partial);
}

/* ─── Attendance ─── */
export async function markAttendance(docId, present) {
  await updateDoc(doc(db, TEAMS, docId), {
    attendance: present,
    attendanceAt: present ? new Date().toISOString() : null,
  });
}

/* Per-member attendance */
export async function confirmMemberAttendance(docId, memberAttendance, attendanceStatus, markedBy) {
  await updateDoc(doc(db, TEAMS, docId), {
    memberAttendance,
    attendanceStatus,
    attendanceConfirmed: true,
    attendance: attendanceStatus === 'present',
    attendanceAt: new Date().toISOString(),
    attendanceMarkedBy: markedBy || 'unknown',
    attendanceMarkedAt: new Date().toISOString(),
  });
}

/* ─── Settings ─── */
export async function getSettings() {
  const snap = await getDoc(doc(db, SETTINGS, 'global'));
  if (snap.exists()) return snap.data();
  const defaults = { registrationOpen: true, feedbackEnabled: false, attendanceEnabled: false, organisersCanEdit: false };
  await setDoc(doc(db, SETTINGS, 'global'), defaults);
  return defaults;
}

export async function updateSettings(partial) {
  await setDoc(doc(db, SETTINGS, 'global'), partial, { merge: true });
}

/* ─── Bulk Delete ─── */
export async function deleteAllTeams() {
  const snap = await getDocs(collection(db, TEAMS));
  const promises = snap.docs.map(d => deleteDoc(doc(db, TEAMS, d.id)));
  await Promise.all(promises);
  return snap.size;
}

/* ─── Feedback ─── */
export async function submitFeedback(userId, data) {
  await addDoc(collection(db, FEEDBACK), {
    userId,
    ...data,
    createdAt: new Date().toISOString(),
  });
}
