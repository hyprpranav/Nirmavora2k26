/**
 * Google Drive Upload Service
 * 
 * Uses a Google Apps Script Web App as a proxy to upload files
 * directly to Google Drive folders. The Apps Script URL is set via
 * the VITE_DRIVE_SCRIPT_URL environment variable.
 * 
 * Flow:
 * 1. Frontend reads file as base64
 * 2. Sends it to the Apps Script web app via POST
 * 3. Apps Script saves the file to the specified Drive folder
 * 4. Returns the shareable Drive link
 * 5. Link is stored in Firebase (not the file itself)
 */

const DRIVE_SCRIPT_URL = import.meta.env.VITE_DRIVE_SCRIPT_URL || '';

// Drive folder IDs
const ABSTRACT_FOLDER_ID = '1NaWxbzBazzVvIjN8YZMs2mEgZL9RqMzV';
const PAYMENT_FOLDER_ID = '1adj2XwlskDCx9xYq8OhOQoKmA0FBBsZj';

/**
 * Convert a File object to a base64 string
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // reader.result is "data:mime;base64,XXXXX", we need just the base64 part
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Upload a file to Google Drive via the Apps Script proxy.
 * @param {File} file - The file to upload
 * @param {string} fileName - The desired file name on Drive
 * @param {string} folderId - The Drive folder ID to upload into
 * @returns {Object} { fileId, fileUrl, fileName }
 */
export async function uploadToDrive(file, fileName, folderId) {
  if (!DRIVE_SCRIPT_URL) {
    throw new Error('Google Drive upload not configured. Please set VITE_DRIVE_SCRIPT_URL.');
  }

  const base64Data = await fileToBase64(file);

  const payload = {
    fileName,
    mimeType: file.type || 'application/octet-stream',
    base64Data,
    folderId,
  };

  const response = await fetch(DRIVE_SCRIPT_URL, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  // Google Apps Script returns a redirect, fetch follows it automatically
  if (!response.ok) {
    throw new Error(`Drive upload failed: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Drive upload failed');
  }

  return {
    fileId: result.fileId,
    fileUrl: result.fileUrl,
    fileName: result.fileName,
  };
}

/**
 * Upload an abstract file to the Abstracts Drive folder.
 * @param {File} file - Abstract file (PDF/PNG/JPG/DOCX)
 * @param {string} fileName - Auto-generated name like "Abstract #1 - TeamName.pdf"
 * @returns {Object} { fileId, fileUrl, fileName }
 */
export async function uploadAbstractToDrive(file, fileName) {
  return uploadToDrive(file, fileName, ABSTRACT_FOLDER_ID);
}

/**
 * Upload a payment screenshot to the Payments Drive folder.
 * @param {File} file - Screenshot file (PNG/JPG)
 * @param {string} fileName - Auto-generated name
 * @returns {Object} { fileId, fileUrl, fileName }
 */
export async function uploadPaymentToDrive(file, fileName) {
  return uploadToDrive(file, fileName, PAYMENT_FOLDER_ID);
}
