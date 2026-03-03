/**
 * Email Service – calls Python SMTP microservice on Render
 * Includes wake-up ping for Render free tier cold starts + retry logic.
 */

const EMAIL_API = import.meta.env.VITE_EMAIL_API_URL || 'http://localhost:5000';
const API_SECRET = 'nirmavora_2026_secret_key';

/** Ping the service to wake it up from Render free-tier sleep */
export async function wakeUpEmailService() {
  try {
    await fetch(`${EMAIL_API}/health`, { method: 'GET', signal: AbortSignal.timeout(60000) });
  } catch {
    // ignore – just waking up
  }
}

async function post(endpoint, body, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(`${EMAIL_API}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Secret': API_SECRET,
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(60000), // 60s timeout for cold start
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Email API error ${res.status}`);
      }
      return res.json();
    } catch (err) {
      if (attempt === retries) throw err;
      // Wait 3s before retry
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
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
