import os
import sys
import smtplib
import traceback
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# CORS – explicitly allow Content-Type and X-API-Secret headers
CORS(app, resources={r"/*": {
    "origins": "*",
    "allow_headers": ["Content-Type", "X-API-Secret", "Authorization"],
    "methods": ["GET", "POST", "OPTIONS"],
    "max_age": 3600,
}})

EMAIL_ADDRESS = os.getenv("EMAIL_ADDRESS")
EMAIL_APP_PASSWORD = os.getenv("EMAIL_APP_PASSWORD")
API_SECRET = os.getenv("API_SECRET", "nirmavora_2026_secret_key")

EVENT_NAME = "NIRMAVORA FEST 2026"

# Force flush print so logs show in Render immediately
def log(msg):
    print(f"[NIRMAVORA] {msg}", flush=True)


@app.before_request
def log_request():
    log(f"{request.method} {request.path} from {request.headers.get('Origin', 'unknown')}")
    if request.method == 'POST':
        log(f"  Headers: Content-Type={request.content_type}, X-API-Secret={'present' if request.headers.get('X-API-Secret') else 'MISSING'}")


@app.after_request
def add_cors_headers(response):
    # Belt-and-suspenders: always set CORS headers
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, X-API-Secret, Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    return response


# ── Email Templates ────────────────────────────────────────────

def otp_html(name, otp_code):
    return f"""
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:520px;margin:auto;background:#121212;border:1px solid #B11226;border-radius:12px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#B11226,#F05A28);padding:28px;text-align:center">
        <h1 style="margin:0;color:#fff;font-size:22px">{EVENT_NAME}</h1>
        <p style="margin:6px 0 0;color:#ffffffcc;font-size:13px">Email Verification</p>
      </div>
      <div style="padding:32px;color:#e0e0e0">
        <p style="margin:0 0 12px">Hi <strong>{name}</strong>,</p>
        <p style="margin:0 0 24px">Your verification code is:</p>
        <div style="background:#1e1e1e;border:2px solid #F5B301;border-radius:8px;padding:20px;text-align:center;margin:0 0 24px">
          <span style="font-size:36px;letter-spacing:12px;font-weight:700;color:#F5B301">{otp_code}</span>
        </div>
        <p style="margin:0;color:#999;font-size:13px">This code expires in 10 minutes. Do not share it with anyone.</p>
      </div>
      <div style="background:#0a0a0a;padding:16px;text-align:center;color:#666;font-size:11px">
        &copy; 2026 {EVENT_NAME} &bull; K.S.R. College of Engineering
      </div>
    </div>
    """


def shortlist_html(name, team_name, team_id, event_type):
    return f"""
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:520px;margin:auto;background:#121212;border:1px solid #B11226;border-radius:12px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#B11226,#F05A28);padding:28px;text-align:center">
        <h1 style="margin:0;color:#fff;font-size:22px">{EVENT_NAME}</h1>
        <p style="margin:6px 0 0;color:#ffffffcc;font-size:13px">Team Shortlisted! 🎉</p>
      </div>
      <div style="padding:32px;color:#e0e0e0">
        <p>Hi <strong>{name}</strong>,</p>
        <p>Congratulations! Your team <strong style="color:#F5B301">"{team_name}"</strong> (<code>{team_id}</code>) 
        has been <span style="color:#4CAF50;font-weight:700">shortlisted</span> for <strong>{event_type}</strong>.</p>
        <div style="background:#1e1e1e;border-left:4px solid #F5B301;padding:16px;border-radius:4px;margin:20px 0">
          <p style="margin:0 0 8px;font-weight:600;color:#F5B301">Next Step: Payment</p>
          <p style="margin:0;color:#ccc">Complete your payment of <strong>₹350/head</strong> via UPI and upload the proof on your dashboard.</p>
        </div>
        <p style="color:#999;font-size:13px">Log in to your participant dashboard to proceed.</p>
      </div>
      <div style="background:#0a0a0a;padding:16px;text-align:center;color:#666;font-size:11px">
        &copy; 2026 {EVENT_NAME} &bull; K.S.R. College of Engineering
      </div>
    </div>
    """


def payment_html(name, team_name, amount):
    return f"""
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:520px;margin:auto;background:#121212;border:1px solid #B11226;border-radius:12px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#B11226,#F05A28);padding:28px;text-align:center">
        <h1 style="margin:0;color:#fff;font-size:22px">{EVENT_NAME}</h1>
        <p style="margin:6px 0 0;color:#ffffffcc;font-size:13px">Payment Verified ✅</p>
      </div>
      <div style="padding:32px;color:#e0e0e0">
        <p>Hi <strong>{name}</strong>,</p>
        <p>Payment of <strong style="color:#4CAF50">{amount}</strong> for team <strong style="color:#F5B301">"{team_name}"</strong> 
        has been <span style="color:#4CAF50;font-weight:700">verified</span>.</p>
        <p>Your QR code is now available on your dashboard. Download it before the event!</p>
        <p style="color:#999;font-size:13px;margin-top:20px">See you at the fest! 🚀</p>
      </div>
      <div style="background:#0a0a0a;padding:16px;text-align:center;color:#666;font-size:11px">
        &copy; 2026 {EVENT_NAME} &bull; K.S.R. College of Engineering
      </div>
    </div>
    """


def waitlist_html(name, team_name):
    return f"""
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:520px;margin:auto;background:#121212;border:1px solid #B11226;border-radius:12px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#B11226,#F05A28);padding:28px;text-align:center">
        <h1 style="margin:0;color:#fff;font-size:22px">{EVENT_NAME}</h1>
        <p style="margin:6px 0 0;color:#ffffffcc;font-size:13px">Waitlist Update</p>
      </div>
      <div style="padding:32px;color:#e0e0e0">
        <p>Hi <strong>{name}</strong>,</p>
        <p>Your team <strong style="color:#F5B301">"{team_name}"</strong> has been placed on the <span style="color:#FF9800;font-weight:700">waitlist</span>.</p>
        <p>We'll notify you immediately if a spot opens up. Stay tuned!</p>
        <p style="color:#999;font-size:13px;margin-top:20px">Thank you for your interest in {EVENT_NAME}.</p>
      </div>
      <div style="background:#0a0a0a;padding:16px;text-align:center;color:#666;font-size:11px">
        &copy; 2026 {EVENT_NAME} &bull; K.S.R. College of Engineering
      </div>
    </div>
    """


def notification_html(name, subject, message):
    return f"""
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:520px;margin:auto;background:#121212;border:1px solid #B11226;border-radius:12px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#B11226,#F05A28);padding:28px;text-align:center">
        <h1 style="margin:0;color:#fff;font-size:22px">{EVENT_NAME}</h1>
        <p style="margin:6px 0 0;color:#ffffffcc;font-size:13px">{subject}</p>
      </div>
      <div style="padding:32px;color:#e0e0e0">
        <p>Hi <strong>{name}</strong>,</p>
        <p>{message}</p>
      </div>
      <div style="background:#0a0a0a;padding:16px;text-align:center;color:#666;font-size:11px">
        &copy; 2026 {EVENT_NAME} &bull; K.S.R. College of Engineering
      </div>
    </div>
    """


# ── Send email via Gmail SMTP ─────────────────────────────────

def send_email(to_email, subject, html_body):
    log(f"  send_email → to={to_email}, subject={subject[:40]}")
    log(f"  EMAIL_ADDRESS={EMAIL_ADDRESS}, APP_PASSWORD={'set' if EMAIL_APP_PASSWORD else 'NOT SET'}")
    msg = MIMEMultipart("alternative")
    msg["From"] = f"{EVENT_NAME} <{EMAIL_ADDRESS}>"
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(html_body, "html"))

    # Port 587 + STARTTLS is more reliable on cloud platforms than SSL port 465
    log("  Connecting to smtp.gmail.com:587 ...")
    with smtplib.SMTP("smtp.gmail.com", 587, timeout=30) as server:
        server.ehlo()
        server.starttls()
        server.ehlo()
        log("  STARTTLS handshake done, logging in...")
        server.login(EMAIL_ADDRESS, EMAIL_APP_PASSWORD)
        log("  Login OK, sending...")
        server.sendmail(EMAIL_ADDRESS, to_email, msg.as_string())
        log("  ✅ Email sent successfully!")


# ── Middleware: verify API secret ──────────────────────────────

def verify_secret():
    secret = request.headers.get("X-API-Secret", "")
    if secret != API_SECRET:
        return False
    return True


# ── Routes ─────────────────────────────────────────────────────

@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "service": "nirmavora-email",
        "email_configured": bool(EMAIL_ADDRESS and EMAIL_APP_PASSWORD),
    })


@app.route("/api/send-otp", methods=["POST"])
def send_otp():
    log("send-otp endpoint hit")
    if not verify_secret():
        log("  ❌ Unauthorized – bad API secret")
        return jsonify({"error": "Unauthorized"}), 401

    data = request.json or {}
    to_email = data.get("to_email")
    name = data.get("name", "Participant")
    otp_code = data.get("otp_code")
    log(f"  to_email={to_email}, name={name}, otp_code={otp_code}")

    if not to_email or not otp_code:
        log("  ❌ Missing to_email or otp_code")
        return jsonify({"error": "to_email and otp_code are required"}), 400

    try:
        html = otp_html(name, otp_code)
        send_email(to_email, f"Your {EVENT_NAME} Verification Code: {otp_code}", html)
        log("  ✅ OTP email sent successfully")
        return jsonify({"success": True, "message": "OTP sent"})
    except Exception as e:
        log(f"  ❌ Error sending OTP: {e}")
        log(traceback.format_exc())
        return jsonify({"error": str(e)}), 500


@app.route("/api/test-email", methods=["POST"])
def test_email():
    """Send a test email – used from admin dashboard to verify email config."""
    log("test-email endpoint hit")
    if not verify_secret():
        return jsonify({"error": "Unauthorized"}), 401

    data = request.json or {}
    to_email = data.get("to_email")
    if not to_email:
        return jsonify({"error": "to_email is required"}), 400

    try:
        html = f"""
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;background:#121212;border:1px solid #B11226;border-radius:12px;overflow:hidden">
          <div style="background:linear-gradient(135deg,#B11226,#F05A28);padding:28px;text-align:center">
            <h1 style="margin:0;color:#fff;font-size:22px">{EVENT_NAME}</h1>
            <p style="margin:6px 0 0;color:#ffffffcc;font-size:13px">Test Email ✅</p>
          </div>
          <div style="padding:32px;color:#e0e0e0">
            <p>If you're reading this, <strong>email sending is working correctly!</strong></p>
            <p style="color:#4CAF50;font-weight:700">SMTP connection to Gmail is healthy.</p>
            <p style="color:#999;font-size:13px">Sent from Render email microservice.</p>
          </div>
        </div>
        """
        send_email(to_email, f"{EVENT_NAME} – Test Email", html)
        log(f"  ✅ Test email sent to {to_email}")
        return jsonify({"success": True, "message": f"Test email sent to {to_email}"})
    except Exception as e:
        log(f"  ❌ Test email failed: {e}")
        log(traceback.format_exc())
        return jsonify({"error": str(e)}), 500


@app.route("/api/send-shortlist", methods=["POST"])
def send_shortlist():
    if not verify_secret():
        return jsonify({"error": "Unauthorized"}), 401

    data = request.json
    to_email = data.get("to_email")
    name = data.get("name", "Participant")
    team_name = data.get("team_name")
    team_id = data.get("team_id")
    event_type = data.get("event_type")

    if not all([to_email, team_name, team_id, event_type]):
        return jsonify({"error": "Missing required fields"}), 400

    try:
        html = shortlist_html(name, team_name, team_id, event_type)
        send_email(to_email, f"Team {team_name} Shortlisted – {EVENT_NAME}", html)
        return jsonify({"success": True, "message": "Shortlist email sent"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/send-payment", methods=["POST"])
def send_payment():
    if not verify_secret():
        return jsonify({"error": "Unauthorized"}), 401

    data = request.json
    to_email = data.get("to_email")
    name = data.get("name", "Participant")
    team_name = data.get("team_name")
    amount = data.get("amount")

    if not all([to_email, team_name, amount]):
        return jsonify({"error": "Missing required fields"}), 400

    try:
        html = payment_html(name, team_name, amount)
        send_email(to_email, f"Payment Verified – Team {team_name}", html)
        return jsonify({"success": True, "message": "Payment email sent"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/send-waitlist", methods=["POST"])
def send_waitlist():
    if not verify_secret():
        return jsonify({"error": "Unauthorized"}), 401

    data = request.json
    to_email = data.get("to_email")
    name = data.get("name", "Participant")
    team_name = data.get("team_name")

    if not all([to_email, team_name]):
        return jsonify({"error": "Missing required fields"}), 400

    try:
        html = waitlist_html(name, team_name)
        send_email(to_email, f"Team {team_name} – Waitlisted", html)
        return jsonify({"success": True, "message": "Waitlist email sent"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/send-notification", methods=["POST"])
def send_notification():
    if not verify_secret():
        return jsonify({"error": "Unauthorized"}), 401

    data = request.json
    to_email = data.get("to_email")
    name = data.get("name", "Participant")
    subject = data.get("subject", f"{EVENT_NAME} Update")
    message = data.get("message")

    if not all([to_email, message]):
        return jsonify({"error": "Missing required fields"}), 400

    try:
        html = notification_html(name, subject, message)
        send_email(to_email, subject, html)
        return jsonify({"success": True, "message": "Notification sent"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── Run ────────────────────────────────────────────────────────

if __name__ == "__main__":
    app.run(debug=True, port=5000)
