# NIRMAVORA FEST 2026 – Architecture Document

## Tech Stack (Confirmed)

| Layer | Technology |
|-------|-----------|
| Build Tool | Vite 5 |
| UI | React 18 (lightweight – dashboards & logic only) |
| Styling | Plain CSS + CSS Variables (no UI libraries) |
| 3D Background | Three.js (hero particles only) |
| Auth | Firebase Authentication (Google Sign-In) |
| Database | Firebase Firestore (primary) |
| Backup | Google Sheets API v4 |
| File Storage | Google Drive (abstract links, payment screenshots) |
| Email/OTP | EmailJS |
| QR | `qrcode` (plain JS library) |
| CSV Export | PapaParse |
| Hosting | Vercel |
| Backend | **None** – everything runs on Firebase SDK client-side |

---

## Folder Structure

```
nirmavora-fest/
├── public/                     # Static assets
├── src/
│   ├── main.jsx                # React entry point
│   ├── App.jsx                 # Router & layout
│   │
│   ├── config/
│   │   ├── firebase.js         # Firebase init
│   │   ├── emailjs.js          # EmailJS templates
│   │   └── constants.js        # All event data, enums, themes
│   │
│   ├── contexts/
│   │   └── AuthContext.jsx     # Global auth state
│   │
│   ├── pages/
│   │   ├── Landing.jsx         # Landing page (all sections)
│   │   ├── AuthPage.jsx        # Sign-in + OTP verification
│   │   ├── EventSelect.jsx     # Choose Designathon / Hackathon
│   │   ├── RegisterPage.jsx    # Registration form + summary
│   │   └── QRPublic.jsx        # Public QR scan view
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── ThreeBackground.jsx
│   │   │
│   │   ├── landing/
│   │   │   ├── Hero.jsx
│   │   │   ├── About.jsx
│   │   │   ├── Designathon.jsx
│   │   │   ├── Hackathon.jsx
│   │   │   ├── Timeline.jsx
│   │   │   ├── Fees.jsx
│   │   │   ├── HowToReach.jsx
│   │   │   └── Contact.jsx
│   │   │
│   │   ├── auth/
│   │   │   ├── GoogleSignIn.jsx
│   │   │   └── OTPVerify.jsx
│   │   │
│   │   ├── registration/
│   │   │   ├── RegistrationForm.jsx
│   │   │   └── FormSummary.jsx
│   │   │
│   │   └── dashboard/
│   │       ├── participant/
│   │       │   ├── ParticipantDashboard.jsx
│   │       │   ├── TeamStatus.jsx
│   │       │   ├── PaymentUpload.jsx
│   │       │   ├── QRDownload.jsx
│   │       │   └── FeedbackForm.jsx
│   │       ├── organiser/
│   │       │   └── OrganiserDashboard.jsx
│   │       └── admin/
│   │           └── AdminDashboard.jsx
│   │
│   ├── services/
│   │   ├── teamService.js      # Firestore CRUD for teams
│   │   ├── registrationService.js
│   │   ├── paymentService.js
│   │   ├── qrService.js        # QR generation
│   │   ├── exportService.js    # CSV export
│   │   └── sheetsSync.js       # Google Sheets backup
│   │
│   ├── utils/
│   │   └── teamIdGenerator.js  # Team ID algorithm
│   │
│   └── styles/
│       ├── variables.css
│       ├── global.css
│       ├── navbar.css
│       ├── landing.css
│       ├── auth.css
│       ├── events.css
│       ├── forms.css
│       ├── dashboard.css
│       └── qr-public.css
│
├── index.html
├── vite.config.js
├── package.json
├── vercel.json
├── .env.example
└── .gitignore
```

---

## Firestore Schema

### Collection: `users`
```
users/{uid}
├── uid: string
├── email: string
├── displayName: string
├── photoURL: string
├── role: "participant" | "organiser" | "admin"
├── otpVerified: boolean
└── createdAt: ISO string
```

### Collection: `teams`
```
teams/{auto-id}
├── userId: string              # Firebase UID of registrant
├── userEmail: string
├── eventType: "designathon" | "hackathon"
├── status: "pending" | "approved" | "waitlisted" | "cancelled"
├── teamId: string | null       # Generated on approval (DT4001, HT3005)
├── teamName: string
├── collegeName: string
├── department: string
├── year: string
├── sdgGoal: string
├── problemTitle: string
├── miniDescription: string
├── abstractLink: string        # Google Drive URL
├── leaderName: string
├── leaderPhone: string
├── leaderEmail: string
├── member1Name: string
├── member1Phone: string
├── member1Email: string
├── member2Name: string
├── member2Phone: string
├── member2Email: string
├── member3Name: string         # Optional
├── member3Phone: string
├── member3Email: string
├── memberCount: number
├── paymentStatus: "not_paid" | "uploaded" | "verified" | "rejected"
├── paymentTxnId: string
├── paymentScreenshotLink: string
├── paymentUploadedAt: ISO string
├── paymentVerifiedAt: ISO string
├── attendance: boolean
├── attendanceAt: ISO string
└── createdAt: ISO string
```

### Collection: `counters`
```
counters/teamId_designathon
├── seq: number                 # Auto-increment for DT IDs

counters/teamId_hackathon
├── seq: number                 # Auto-increment for HT IDs
```

### Collection: `settings`
```
settings/global
├── registrationOpen: boolean
├── feedbackEnabled: boolean
└── attendanceEnabled: boolean
```

### Collection: `feedback`
```
feedback/{auto-id}
├── userId: string
├── message: string
├── rating: number (1-5)
└── createdAt: ISO string
```

---

## Auth Flow

```
User clicks "Register Now"
  → Google Sign-In popup (Firebase Auth)
  → On success: 6-digit OTP generated
  → OTP sent via EmailJS to user's email
  → User enters OTP (3 retries, 60s resend cooldown)
  → On verify: otpVerified = true in Firestore
  → Redirect to Event Selection page
```

---

## Team ID Algorithm

```
Prefix:
  Designathon → "DT"
  Hackathon   → "HT"

Format: {PREFIX}{teamSize}{sequence}
  teamSize: 3 or 4
  sequence: zero-padded 3-digit counter (001, 002…)

Example:
  DT4001 → Designathon, 4 members, 1st approved team
  HT3005 → Hackathon, 3 members, 5th approved team

Implementation:
  Uses Firestore transactions on counters/{eventType}
  Sequence increments ONLY upon approval (not registration)
  Separate counters for designathon and hackathon
```

---

## QR Logic

```
QR Content: URL → {origin}/qr/{teamId}

Public Scan:
  → Renders team name, ID, members, problem title, college

Admin Scan:
  → Same page, but logged-in admin sees attendance button + notes

Download:
  → Generates PNG via qrcode library
  → Filename: {teamId}_QR.png
```

---

## Attendance Logic

```
1. Admin/Organiser opens Attendance tab
2. Lists all approved teams
3. Click "Mark Present" → sets attendance: true, attendanceAt: timestamp
4. Undo available
5. QR scan can also trigger attendance marking (admin view)
6. Admin can override any attendance record
7. Attendance can be enabled/disabled globally from Settings
```

---

## Export Logic

| Export | Contents |
|--------|---------|
| Master Log CSV | All fields for all teams |
| Team Summary CSV | TeamID, name, event, college, status, member count |
| Certificate CSV | Individual member rows for attended teams |
| TeamID + TeamName CSV | Simple ID-name mapping |

All exports use PapaParse for CSV generation and trigger browser download.

---

## Payment Flow

```
1. Team gets APPROVED status
2. Dashboard shows UPI ID + QR
3. User pays via UPI
4. User uploads:
   - UPI Transaction ID
   - Screenshot Google Drive link
5. paymentStatus → "uploaded"
6. Admin reviews in Payments tab
7. Admin clicks "Verify" → paymentStatus = "verified"
   - Confirmation email sent via EmailJS
   - Dashboard updates
8. If rejected → paymentStatus = "rejected"
   - User can re-upload
```

---

## Deployment Steps (Vercel)

```bash
# 1. Navigate to project
cd nirmavora-fest

# 2. Install dependencies
npm install

# 3. Create .env file from example
cp .env.example .env
# Fill in all Firebase, EmailJS, Google API keys

# 4. Test locally
npm run dev

# 5. Build for production
npm run build

# 6. Deploy to Vercel
npx vercel

# Or connect GitHub repo to Vercel for auto-deploy

# 7. Set environment variables in Vercel dashboard:
#    - All VITE_* variables from .env
#    - Vercel → Settings → Environment Variables
```

### Firebase Setup Required:
1. Create Firebase project at https://console.firebase.google.com
2. Enable **Google Sign-In** under Authentication → Sign-in methods
3. Create Firestore database (start in test mode, secure later)
4. Add your domain to **Authorized domains** in Firebase Auth settings
5. Copy Firebase config values to `.env`

### EmailJS Setup Required:
1. Create account at https://www.emailjs.com
2. Create email service (Gmail recommended)
3. Create templates for: OTP, Shortlist, Payment, Waitlist, Notification
4. Copy service ID, template IDs, and public key to `.env`

### Firestore Security Rules (Production):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
      allow read: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['organiser', 'admin'];
    }

    // Teams: participants create, admins/organisers manage
    match /teams/{teamId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null;
      allow update: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['organiser', 'admin']
                    || (request.auth.uid == resource.data.userId && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['paymentStatus', 'paymentTxnId', 'paymentScreenshotLink', 'paymentUploadedAt']));
    }

    // Counters: only admin/organiser
    match /counters/{doc} {
      allow read, write: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['organiser', 'admin'];
    }

    // Settings: only admin
    match /settings/{doc} {
      allow read: if request.auth != null;
      allow write: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Feedback: anyone can create, admins read
    match /feedback/{doc} {
      allow create: if request.auth != null;
      allow read: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

---

## Performance Checklist

- [x] No heavy UI libraries (no Material UI, no Bootstrap)
- [x] No backend server (pure Firebase SDK)
- [x] Vite code-splitting: firebase, three.js, vendor chunks
- [x] Three.js limited to hero background only
- [x] Minimal animations (CSS transitions only)
- [x] Lazy-loaded images not used (no image-heavy content)
- [x] All dashboards are clean table-based layouts
- [x] QR generation is client-side (no API calls)
- [x] CSV exports happen in browser (no server processing)
