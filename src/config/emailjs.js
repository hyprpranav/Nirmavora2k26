/**
 * Email Service – uses EmailJS (browser-based HTTP email, no backend needed)
 *
 * EmailJS sends emails directly from the browser via their HTTP API.
 * This works on ALL hosting (Vercel, Netlify, etc.) without SMTP restrictions.
 *
 * Setup required (one-time):
 * 1. Go to https://www.emailjs.com/ and sign up free
 * 2. Add Gmail as a service → get SERVICE_ID
 * 3. Create email templates for OTP, Shortlist, Payment, Waitlist, Notification
 * 4. Get your PUBLIC_KEY from Account → General
 * 5. Set the env vars on Vercel
 */

import emailjs from '@emailjs/browser';

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';

// Template IDs
const TEMPLATE_OTP = import.meta.env.VITE_EMAILJS_TEMPLATE_OTP || '';
const TEMPLATE_SHORTLIST = import.meta.env.VITE_EMAILJS_TEMPLATE_SHORTLIST || '';
const TEMPLATE_PAYMENT = import.meta.env.VITE_EMAILJS_TEMPLATE_PAYMENT || '';
const TEMPLATE_WAITLIST = import.meta.env.VITE_EMAILJS_TEMPLATE_WAITLIST || '';
const TEMPLATE_NOTIFICATION = import.meta.env.VITE_EMAILJS_TEMPLATE_NOTIFICATION || '';

// Initialize EmailJS
if (PUBLIC_KEY) {
  emailjs.init(PUBLIC_KEY);
  console.log('[EmailJS] Initialized with public key');
} else {
  console.warn('[EmailJS] No public key set — emails will not be sent');
}

/** No-op wake-up (kept for backward compat — EmailJS needs no wake-up) */
export async function wakeUpEmailService() {
  console.log('[EmailJS] Email service ready (browser-based, no wake-up needed)');
  return { status: 'ok', service: 'emailjs-browser' };
}

/**
 * Send an email via EmailJS
 */
async function sendEmail(templateId, templateParams) {
  if (!SERVICE_ID || !PUBLIC_KEY || !templateId) {
    console.error('[EmailJS] Missing config:', {
      SERVICE_ID: !!SERVICE_ID,
      PUBLIC_KEY: !!PUBLIC_KEY,
      templateId: !!templateId,
    });
    throw new Error('Email service not configured. Please set up EmailJS.');
  }

  console.log(`[EmailJS] Sending email with template ${templateId}`, templateParams);
  try {
    const result = await emailjs.send(SERVICE_ID, templateId, templateParams);
    console.log('[EmailJS] Email sent successfully:', result.status, result.text);
    return { success: true, message: 'Email sent' };
  } catch (err) {
    console.error('[EmailJS] Send failed:', err);
    throw new Error(err?.text || err?.message || 'Failed to send email');
  }
}

/** Send OTP verification email */
export async function sendOTP(email, otp, name) {
  return sendEmail(TEMPLATE_OTP, {
    to_email: email,
    to_name: name || 'Participant',
    otp_code: otp,
    event_name: 'NIRMAVORA FEST 2026',
  });
}

/** Send shortlist confirmation */
export async function sendShortlistConfirmation(email, name, teamName, teamId, eventType) {
  return sendEmail(TEMPLATE_SHORTLIST, {
    to_email: email,
    to_name: name || 'Participant',
    team_name: teamName,
    team_id: teamId,
    event_type: eventType,
    event_name: 'NIRMAVORA FEST 2026',
  });
}

/** Send payment confirmation */
export async function sendPaymentConfirmation(email, name, teamName, amount) {
  return sendEmail(TEMPLATE_PAYMENT, {
    to_email: email,
    to_name: name || 'Participant',
    team_name: teamName,
    amount: amount,
    event_name: 'NIRMAVORA FEST 2026',
  });
}

/** Send waitlist message */
export async function sendWaitlistMessage(email, name, teamName) {
  return sendEmail(TEMPLATE_WAITLIST, {
    to_email: email,
    to_name: name || 'Participant',
    team_name: teamName,
    event_name: 'NIRMAVORA FEST 2026',
  });
}

/** Send custom notification */
export async function sendNotification(email, name, subject, message) {
  return sendEmail(TEMPLATE_NOTIFICATION, {
    to_email: email,
    to_name: name || 'Participant',
    subject: subject,
    message: message,
    event_name: 'NIRMAVORA FEST 2026',
  });
}

/** Send test email (uses notification template) */
export async function sendTestEmail(email) {
  return sendEmail(TEMPLATE_NOTIFICATION, {
    to_email: email,
    to_name: 'Admin',
    subject: 'NIRMAVORA FEST 2026 – Test Email',
    message: 'If you are reading this, email sending is working correctly!',
    event_name: 'NIRMAVORA FEST 2026',
  });
}
