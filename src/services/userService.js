import { collection, getDocs, deleteDoc, doc, orderBy, query, setDoc, where } from 'firebase/firestore';
import { createUserWithEmailAndPassword, getAuth, sendPasswordResetEmail, signOut } from 'firebase/auth';
import { getApps, initializeApp } from 'firebase/app';
import { db, auth, firebaseConfig } from '../config/firebase';
import { ROLES } from '../config/constants';

const USERS = 'users';

/* Get all signed-up users */
export async function getAllUsers() {
  const q = query(collection(db, USERS), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/* Delete a user from Firestore (removes their profile; Firebase Auth account stays but they can't access anything) */
export async function deleteUserProfile(uid) {
  await deleteDoc(doc(db, USERS, uid));
}

/* Change a user's role */
export async function changeUserRole(uid, role) {
  await setDoc(doc(db, USERS, uid), { role }, { merge: true });
}

/* Send password reset email */
export async function sendPasswordReset(email) {
  await sendPasswordResetEmail(auth, email);
}

/* Create participant auth + profile from admin/coordinator panel without affecting current session */
export async function createParticipantUserByStaff({ name, email, password, createdByEmail }) {
  if (!name?.trim()) throw new Error('Account name is required.');
  if (!email?.trim()) throw new Error('Account email is required.');
  if (!password || password.length < 8) throw new Error('Default password must be at least 8 characters.');

  const secondaryAppName = 'staff-provisioner-app';
  const secondaryApp = getApps().find((a) => a.name === secondaryAppName)
    || initializeApp(firebaseConfig, secondaryAppName);
  const secondaryAuth = getAuth(secondaryApp);

  try {
    const result = await createUserWithEmailAndPassword(secondaryAuth, email.trim(), password);
    const uid = result.user.uid;
    await setDoc(doc(db, USERS, uid), {
      uid,
      email: email.trim(),
      displayName: name.trim(),
      photoURL: null,
      role: ROLES.PARTICIPANT,
      verificationBypass: true,
      staffCreated: true,
      createdByStaffEmail: createdByEmail || 'staff',
      createdAt: new Date().toISOString(),
    }, { merge: true });
    await signOut(secondaryAuth);
    return { uid, email: email.trim() };
  } catch (err) {
    if (err.code === 'auth/email-already-in-use') {
      throw new Error('Account email already exists. Use another email or reset the existing account password.');
    }
    throw err;
  }
}

/* Delete all organisers (role=organiser) from Firestore */
export async function deleteAllOrganisers() {
  const q = query(collection(db, USERS), where('role', '==', 'organiser'));
  const snap = await getDocs(q);
  const promises = snap.docs.map(d => deleteDoc(doc(db, USERS, d.id)));
  await Promise.all(promises);
  return snap.size;
}

/* Delete all participant users from Firestore */
export async function deleteAllParticipants() {
  const q = query(collection(db, USERS), where('role', '==', 'participant'));
  const snap = await getDocs(q);
  const promises = snap.docs.map(d => deleteDoc(doc(db, USERS, d.id)));
  await Promise.all(promises);
  return snap.size;
}
