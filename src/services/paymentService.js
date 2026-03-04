import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { PAYMENT_STATUS } from '../config/constants';
import { sendPaymentConfirmation } from '../config/emailjs';
import { getTeamById } from './teamService';

export async function updatePayment(docId, { txnId, screenshotUrl, screenshotFileName }) {
  await updateDoc(doc(db, 'teams', docId), {
    paymentStatus: PAYMENT_STATUS.UPLOADED,
    paymentTxnId: txnId,
    paymentScreenshotUrl: screenshotUrl || '',
    paymentScreenshotFileName: screenshotFileName || '',
    paymentScreenshotLink: screenshotUrl || '', // backward compat
    paymentUploadedAt: new Date().toISOString(),
  });
}

export async function verifyPayment(docId) {
  await updateDoc(doc(db, 'teams', docId), {
    paymentStatus: PAYMENT_STATUS.VERIFIED,
    paymentVerifiedAt: new Date().toISOString(),
  });
  /* Send confirmation email */
  const team = await getTeamById(docId);
  if (team) {
    await sendPaymentConfirmation(
      team.leaderEmail,
      team.leaderName,
      team.teamName,
      `₹${350 * (team.memberCount || 3)}`
    );
  }
}

export async function rejectPayment(docId) {
  await updateDoc(doc(db, 'teams', docId), {
    paymentStatus: PAYMENT_STATUS.REJECTED,
  });
}
