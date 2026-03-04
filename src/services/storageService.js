import { collection, doc, getDoc, setDoc, runTransaction } from 'firebase/firestore';
import { db } from '../config/firebase';
import { uploadAbstractToDrive, uploadPaymentToDrive } from './driveService';

/**
 * Get the next abstract number using a Firestore counter.
 * Uses a transaction to ensure uniqueness.
 */
async function getNextAbstractNumber() {
  const counterRef = doc(db, 'counters', 'abstracts');
  const newCount = await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(counterRef);
    const current = snap.exists() ? snap.data().count : 0;
    const next = current + 1;
    transaction.set(counterRef, { count: next });
    return next;
  });
  return newCount;
}

/**
 * Upload an abstract file to Google Drive.
 * Auto-names as "Abstract #N - TeamName.ext"
 * Accepts PDF, PNG, JPG, DOCX.
 * Returns { abstractFileUrl, abstractFileName, abstractNumber }
 */
export async function uploadAbstract(file, teamName) {
  const ext = file.name.split('.').pop().toLowerCase();
  const allowed = ['pdf', 'png', 'jpg', 'jpeg', 'doc', 'docx'];
  if (!allowed.includes(ext)) {
    throw new Error('Invalid file type. Allowed: PDF, PNG, JPG, DOCX');
  }

  const maxSize = 10 * 1024 * 1024; // 10 MB
  if (file.size > maxSize) {
    throw new Error('File too large. Maximum size is 10 MB.');
  }

  const num = await getNextAbstractNumber();
  const safeName = teamName.replace(/[^a-zA-Z0-9_\- ]/g, '').trim();
  const fileName = `Abstract #${num} - ${safeName}.${ext}`;

  const result = await uploadAbstractToDrive(file, fileName);

  return {
    abstractFileUrl: result.fileUrl,
    abstractFileName: result.fileName,
    abstractNumber: num,
    abstractDriveId: result.fileId,
  };
}

/**
 * Upload a payment screenshot to Google Drive.
 * Only accepts image formats (PNG, JPG, JPEG).
 * Returns { paymentScreenshotUrl, paymentScreenshotFileName }
 */
export async function uploadPaymentScreenshot(file, teamName) {
  const ext = file.name.split('.').pop().toLowerCase();
  const allowed = ['png', 'jpg', 'jpeg'];
  if (!allowed.includes(ext)) {
    throw new Error('Invalid file type. Only PNG and JPG screenshots are allowed.');
  }

  const maxSize = 5 * 1024 * 1024; // 5 MB
  if (file.size > maxSize) {
    throw new Error('File too large. Maximum size is 5 MB.');
  }

  const safeName = teamName.replace(/[^a-zA-Z0-9_\- ]/g, '').trim();
  const timestamp = Date.now();
  const fileName = `Payment - ${safeName} - ${timestamp}.${ext}`;

  const result = await uploadPaymentToDrive(file, fileName);

  return {
    paymentScreenshotUrl: result.fileUrl,
    paymentScreenshotFileName: result.fileName,
  };
}
