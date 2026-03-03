import { doc, getDoc, setDoc, runTransaction } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Team ID Format:
 *   Designathon: DT + teamSize + sequence  (e.g., DT4001)
 *   Hackathon:   HT + teamSize + sequence  (e.g., HT3005)
 *
 * Separate counters per event type.
 * Sequence increments only upon approval.
 */
export async function generateTeamId(eventType, teamSize = 3) {
  const prefix = eventType === 'designathon' ? 'DT' : 'HT';
  const counterRef = doc(db, 'counters', `teamId_${eventType}`);

  const newSeq = await runTransaction(db, async (tx) => {
    const snap = await tx.get(counterRef);
    const current = snap.exists() ? snap.data().seq : 0;
    const next = current + 1;
    tx.set(counterRef, { seq: next });
    return next;
  });

  const seqStr = String(newSeq).padStart(3, '0');
  return `${prefix}${teamSize}${seqStr}`;
}
