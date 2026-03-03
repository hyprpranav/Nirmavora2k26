/**
 * Email Service – calls Python SMTP microservice on Render
 * Replaces EmailJS with instant Gmail SMTP delivery.
 */

const EMAIL_API = import.meta.env.VITE_EMAIL_API_URL || 'http://localhost:5000';
const API_SECRET = 'nirmavora_2026_secret_key'; // Must match email-service .env

async function post(endpoint, body) {
  const res = await fetch(`${EMAIL_API}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Secret': API_SECRET,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Email API error ${res.status}`);
  }
  return res.json();
}

export async function sendOTP(email, otp, name) {
  return post('/api/send-otp', {
    to_email: email,
    name: name || 'Participant',
    otp_code: otp,
  });
}

export async function sendShortlistConfirmation(email, name, teamName, teamId, eventType) {
  return post('/api/send-shortlist', {
    to_email: email,
    name: name || 'Participant',
    team_name: teamName,
    team_id: teamId,
    event_type: eventType,
  });
}

export async function sendPaymentConfirmation(email, name, teamName, amount) {
  return post('/api/send-payment', {
    to_email: email,
    name: name || 'Participant',
    team_name: teamName,
    amount: amount,
  });
}

export async function sendWaitlistMessage(email, name, teamName) {
  return post('/api/send-waitlist', {
    to_email: email,
    name: name || 'Participant',
    team_name: teamName,
  });
}

export async function sendNotification(email, name, subject, message) {
  return post('/api/send-notification', {
    to_email: email,
    name: name || 'Participant',
    subject,
    message,
  });
}
