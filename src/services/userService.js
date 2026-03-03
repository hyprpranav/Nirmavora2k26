import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../config/firebase';

const USERS = 'users';

/* Get all signed-up users */
export async function getAllUsers() {
  const q = query(collection(db, USERS), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
