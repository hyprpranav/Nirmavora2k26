/**
 * Email Service – uses EmailJS (browser-based HTTP email, no backend needed)
 *
 * Uses a SINGLE template for ALL email types (free plan allows only 2 templates).
 * The template should have these variables:
 *   {{to_email}}    – recipient email
 *   {{to_name}}     – recipient name
 *   {{subject}}     – email subject line
 *   {{message}}     – email body (HTML supported)
 *   {{event_name}}  – always "NIRMAVORA FEST 2026"
 *
 * Setup (one-time):
 * 1. Go to https://www.emailjs.com/ and sign up
 * 2. Add Gmail as a service → get SERVICE_ID
 * 3. Create ONE email template with the variables above
 * 4. Get your PUBLIC_KEY from Account → General
 * 5. Set VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_PUBLIC_KEY, VITE_EMAILJS_TEMPLATE_ID on Vercel
 */

import emailjs from '@emailjs/browser';

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';

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
 * Core send function — all emails go through the single template
 */
async function sendEmail(subject, toEmail, toName, messageBody) {
  if (!SERVICE_ID || !PUBLIC_KEY || !TEMPLATE_ID) {
    console.error('[EmailJS] Missing config:', {
      SERVICE_ID: !!SERVICE_ID,
      PUBLIC_KEY: !!PUBLIC_KEY,
      TEMPLATE_ID: !!TEMPLATE_ID,
    });
    throw new Error('Email service not configured. Please set up EmailJS.');
  }

  const templateParams = {
    to_email: toEmail,
    to_name: toName || 'Participant',
    subject,
    message: messageBody,
    event_name: 'NIRMAVORA FEST 2026',
  };

  console.log(`[EmailJS] Sending email: "${subject}" to ${toEmail}`);
  try {
    const result = await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams);
    console.log('[EmailJS] Email sent successfully:', result.status, result.text);
    return { success: true, message: 'Email sent' };
  } catch (err) {
    console.error('[EmailJS] Send failed:', err);
    throw new Error(err?.text || err?.message || 'Failed to send email');
  }
}

function getTeamRecipients(team) {
  const recipients = [
    { email: team?.leaderEmail, name: team?.leaderName || 'Team Leader' },
    { email: team?.member1Email, name: team?.member1Name || 'Team Member' },
    { email: team?.member2Email, name: team?.member2Name || 'Team Member' },
    { email: team?.member3Email, name: team?.member3Name || 'Team Member' },
  ];

  const seen = new Set();
  return recipients.filter((recipient) => {
    const email = (recipient.email || '').trim().toLowerCase();
    if (!email || seen.has(email)) return false;
    seen.add(email);
    return true;
  });
}

async function sendEmailToTeam(team, builder) {
  const recipients = getTeamRecipients(team);
  if (recipients.length === 0) {
    throw new Error('No team email addresses found for notification.');
  }

  const results = await Promise.allSettled(
    recipients.map((recipient) => {
      const content = builder(recipient);
      return sendEmail(content.subject, recipient.email, recipient.name, content.message);
    })
  );

  const delivered = results.filter((result) => result.status === 'fulfilled').length;
  if (delivered === 0) {
    const firstFailure = results.find((result) => result.status === 'rejected');
    throw firstFailure?.reason || new Error('Failed to send team notification.');
  }

  return {
    success: true,
    delivered,
    attempted: recipients.length,
  };
}

/** Send shortlist confirmation */
export async function sendShortlistConfirmation(email, name, teamName, teamId, eventType) {
  const subject = `🎉 Congratulations! Your team is shortlisted — NIRMAVORA FEST 2026`;
  const message = `Hi ${name},\n\nGreat news! Your team "${teamName}" (ID: ${teamId}) has been shortlisted for the ${eventType} at NIRMAVORA FEST 2026!\n\nPlease complete your payment to confirm your spot.\n\n— Team NIRMAVORA`;
  return sendEmail(subject, email, name, message);
}

export async function sendShortlistConfirmationToTeam(team, teamId) {
  return sendEmailToTeam(team, (recipient) => ({
    subject: `🎉 Congratulations! Your team is shortlisted — NIRMAVORA FEST 2026`,
    message: `Hi ${recipient.name},\n\nGreat news! Your team "${team.teamName}" (ID: ${teamId}) has been shortlisted for the ${team.eventType} at NIRMAVORA FEST 2026!\n\nPlease complete your payment to confirm your spot.\n\n— Team NIRMAVORA`,
  }));
}

/** Send waitlist promotion confirmation */
export async function sendWaitlistPromotionMessage(email, name, teamName, teamId, eventType) {
  const subject = `🎉 Update: Your waitlisted team is now shortlisted — NIRMAVORA FEST 2026`;
  const message = `Hi ${name},\n\nExcellent news. Your team "${teamName}" (ID: ${teamId}) has now been moved from the waitlist to the shortlisted teams for the ${eventType} at NIRMAVORA FEST 2026.\n\nPlease complete your payment to confirm your spot. We are excited to have your team with us.\n\n— Team NIRMAVORA`;
  return sendEmail(subject, email, name, message);
}

export async function sendWaitlistPromotionMessageToTeam(team, teamId) {
  return sendEmailToTeam(team, (recipient) => ({
    subject: `🎉 Update: Your waitlisted team is now shortlisted — NIRMAVORA FEST 2026`,
    message: `Hi ${recipient.name},\n\nExcellent news. Your team "${team.teamName}" (ID: ${teamId}) has now been moved from the waitlist to the shortlisted teams for the ${team.eventType} at NIRMAVORA FEST 2026.\n\nPlease complete your payment to confirm your spot. We are excited to have your team with us.\n\n— Team NIRMAVORA`,
  }));
}

/** Send payment confirmation */
export async function sendPaymentConfirmation(email, name, teamName, amount) {
  const subject = `✅ Payment Confirmed — NIRMAVORA FEST 2026`;
  const message = `Hi ${name},\n\nYour payment of ₹${amount} for team "${teamName}" has been verified.\n\nYour registration is now complete. See you at the fest!\n\n— Team NIRMAVORA`;
  return sendEmail(subject, email, name, message);
}

/** Send waitlist message */
export async function sendWaitlistMessage(email, name, teamName) {
  const subject = `⏳ You're on the Waitlist — NIRMAVORA FEST 2026`;
  const message = `Hi ${name},\n\nYour team "${teamName}" has been placed on the waitlist for NIRMAVORA FEST 2026. Your idea is genuinely strong, and there is a very high chance of getting shortlisted if slots open in the next review.\n\nPlease stay ready and wait for our next update. We will notify you immediately if your team is moved forward.\n\n— Team NIRMAVORA`;
  return sendEmail(subject, email, name, message);
}

export async function sendWaitlistMessageToTeam(team) {
  return sendEmailToTeam(team, (recipient) => ({
    subject: `⏳ You're on the Waitlist — NIRMAVORA FEST 2026`,
    message: `Hi ${recipient.name},\n\nYour team "${team.teamName}" has been placed on the waitlist for NIRMAVORA FEST 2026. Your idea is genuinely strong, and there is a very high chance of getting shortlisted if slots open in the next review.\n\nPlease stay ready and wait for our next update. We will notify you immediately if your team is moved forward.\n\n— Team NIRMAVORA`,
  }));
}

/** Send cancellation update */
export async function sendCancellationMessage(email, name, teamName) {
  const subject = `Important update for your team — NIRMAVORA FEST 2026`;
  const message = `Hi ${name},\n\nThis is an update regarding your team "${teamName}". At the moment, the registration for this team has been cancelled due to current slot constraints or review requirements.\n\nIf you need more details, please contact the organisers.\n\n— Team NIRMAVORA`;
  return sendEmail(subject, email, name, message);
}

export async function sendCancellationMessageToTeam(team) {
  return sendEmailToTeam(team, (recipient) => ({
    subject: `Important update for your team — NIRMAVORA FEST 2026`,
    message: `Hi ${recipient.name},\n\nThis is an update regarding your team "${team.teamName}". At the moment, the registration for this team has been cancelled due to current slot constraints or review requirements.\n\nIf you need more details, please contact the organisers.\n\n— Team NIRMAVORA`,
  }));
}

/** Send custom notification */
export async function sendNotification(email, name, subject, messageBody) {
  return sendEmail(
    subject || 'NIRMAVORA FEST 2026 — Update',
    email,
    name,
    messageBody
  );
}

/** Send test email */
export async function sendTestEmail(email) {
  return sendEmail(
    'NIRMAVORA FEST 2026 — Test Email ✅',
    email,
    'Admin',
    'If you are reading this, email sending is working correctly!\n\n— NIRMAVORA Email System'
  );
}
