import { doc, runTransaction } from 'firebase/firestore';
import { db } from '../config/firebase';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

/**
 * Upload a file to Cloudinary using an unsigned upload preset.
 * Returns { fileUrl, fileName }
 */
async function uploadToCloudinary(file, folder, publicId) {
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', folder);
  formData.append('public_id', publicId);

  const res = await fetch(url, { method: 'POST', body: formData });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Upload failed. Please try again.');
  }
  const data = await res.json();
  return { fileUrl: data.secure_url, fileName: publicId };
}

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
 * Upload an abstract file to Cloudinary.
 * Auto-names as "Abstract #N - TeamName.ext"
 * Accepts PDF, PNG, JPG, DOCX.
 * Max size: 5 MB.
 * Returns { abstractFileUrl, abstractFileName, abstractNumber }
 */
export async function uploadAbstract(file, teamName) {
  const ext = file.name.split('.').pop().toLowerCase();
  const allowed = ['pdf', 'png', 'jpg', 'jpeg', 'doc', 'docx'];
  if (!allowed.includes(ext)) {
    throw new Error('Invalid file type. Allowed: PDF, PNG, JPG, DOCX');
  }

  const maxSize = 5 * 1024 * 1024; // 5 MB
  if (file.size > maxSize) {
    throw new Error('Abstract file too large. Maximum allowed size is 5 MB.');
  }

  const num = await getNextAbstractNumber();
  const safeName = teamName.replace(/[^a-zA-Z0-9_\- ]/g, '').trim();
  const publicId = `Abstract No.${num} - ${safeName}`;

  const { fileUrl, fileName } = await uploadToCloudinary(file, 'abstracts', publicId);

  return {
    abstractFileUrl: fileUrl,
    abstractFileName: `${fileName}.${ext}`,
    abstractNumber: num,
  };
}

/**
 * Upload a payment screenshot to Cloudinary.
 * Only accepts image formats (PNG, JPG, JPEG).
 * Max size: 5 MB.
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
  const publicId = `Payment - ${safeName} - ${timestamp}`;

  const { fileUrl, fileName } = await uploadToCloudinary(file, 'payments', publicId);

  return {
    paymentScreenshotUrl: fileUrl,
    paymentScreenshotFileName: `${fileName}.${ext}`,
  };
}
