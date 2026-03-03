import { collection, getDocs, deleteDoc, doc, orderBy, query, setDoc } from 'firebase/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';
import { db, auth } from '../config/firebase';

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
