# 🎓 CampusPulse — Next-Gen College Event Management & Verification System

[![React 19](https://img.shields.io/badge/Frontend-React_19_+_Vite-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js_+_Express_MVC-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB_Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Security](https://img.shields.io/badge/Security-JWT_+_Council_Passkey_+_One--Time_QR-E53E3E?logo=auth0&logoColor=white)](https://jwt.io/)
[![Design](https://img.shields.io/badge/UI/UX-Glassmorphism_Dark_Design-8B5CF6)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> **A production-ready, full-stack campus event ecosystem built strictly on the MVC pattern.**  
> Features real-time seat locking, fraud-proof digital boarding passes with live camera QR gate verification, institutional roll/email validation, squad recruitment with captain approval, and council passkey authorization.

---

## 📑 Table of Contents
1. [The Real-World Problem](#-the-real-world-problem-statement)
2. [The Solution: CampusPulse](#-the-solution-campuspulse)
3. [Security & Anti-Fraud Architecture](#-security--anti-fraud-architecture-deep-dive)
4. [Dual-Portal Architecture](#-dual-portal-architecture)
   - [Student Experience](#1-student-portal)
   - [Council & Organizer Portal](#2-council--organizer-portal)
5. [System Architecture & MVC Structure](#-system-architecture--mvc-structure)
6. [Database Schema Design](#-database-schema-design)
7. [RESTful API Specification](#-restful-api-specification)
8. [Production Deployment Guide](#-production-deployment-guide)
9. [Local Development & Quickstart](#-local-development--quickstart)
10. [Test & Evaluation Credentials](#-test--evaluation-credentials)

---

## 🛑 The Real-World Problem Statement

In colleges and universities, organizing events, workshops, hackathons, and esports tournaments is notoriously disorganized:

| Traditional College Event Chaos | How CampusPulse Solves It |
|---|---|
| **Google Forms Overbooking**: No live seat counters. Popular workshops (e.g. AI hackathons, 30-seat computer labs) get 200+ responses, leading to awkward cancellations and on-spot disputes. | **Real-Time Atomic Seat Locking**: Seat count decreases dynamically in the database upon RSVP. Capacity bars notify students when an event is almost full (e.g. `85% Filled`). |
| **Proxy Entries & Ticket Duplication**: Students share screenshots of confirmation emails or WhatsApp messages with friends to sneak them into high-demand events. | **Cryptographic One-Time QR Passes**: Each pass has a unique Ticket ID (`TKT-...`) with a live Gatekeeper Scanner (`/verify-ticket`). Once scanned, its state flips from `Registered` to `Attended`. Any repeat scan is immediately rejected with a **"PROXY DETECTED / TICKET ALREADY USED"** alert. |
| **Impostor Organizers & Fake Events**: Random students pose as club leads, creating misleading posters, spam events, or collecting unapproved RSVPs. | **Council Secret Passkey Authorization**: Organizer signups require an institutional cryptographic passkey (`COUNCIL_SECRET_PASSKEY`). Students without the verified key cannot publish events or inspect student rosters. |
| **Organizer Conflict of Interest**: Organizers and hosts reserve seats in their own exclusive events or tournaments for themselves and their friends. | **Host Participation Guard**: Organizers are hard-coded prohibited from booking tickets to their own hosted events. |
| **Fragmented Teammate Discovery**: WhatsApp & Discord group spamming for hackathon teammates or esports squads (BGMI, Free Fire) with no structured roles or approval mechanisms. | **Integrated Squad & Teammate Hub**: Squad captains specify required roles, custom squad capacity (2 to 10 slots), and batch preferences. Teammates must send a request; **only the squad captain has the authority to approve or reject members**. |

---

## 💡 The Solution: CampusPulse

**CampusPulse** provides an institutional-grade, unified web platform engineered specifically for collegiate institutions (SST / Scaler School of Technology and similar universities). It replaces disjointed forms, manual spreadsheets, and physical paper tickets with an end-to-end digital pipeline:

```
[Student Discovery] ➔ [Dynamic Seat Lock] ➔ [Digital QR Pass Generated]
                                                    │
                                                    ▼
[Gatekeeper QR Scan] ➔ [State: Attended] ➔ [Live Entry Verification]
```

---

## 🛡️ Security & Anti-Fraud Architecture (Deep-Dive)

CampusPulse enforces a **5-Layer Security Shield** across both the backend and frontend:

```
                  ┌────────────────────────────────────────────────────────┐
                  │              CAMPUSPULSE 5-LAYER SECURITY              │
                  └────────────────────────────────────────────────────────┘
                                              │
    ┌──────────────────┬──────────────────────┼─────────────────────┬──────────────────┐
    ▼                  ▼                      ▼                     ▼                  ▼
[Layer 1]          [Layer 2]              [Layer 3]             [Layer 4]          [Layer 5]
Council Secret     Institutional Roll     Anti-Conflict-of-     One-Time QR Pass   Captain-Only
Passkey Gate       & Email Validation     Interest Guard        & Gatekeeper Scan  Squad Approval
```

### 1. Council Secret Passkey Gate (`COUNCIL_SECRET_PASSKEY`)
* **Problem**: Anyone could register as an "Organizer" and gain admin powers to delete campus events or post fake announcements.
* **Mechanism**: During account creation, selecting the `Club / Event Lead (Organizer)` role activates a mandatory **Council Authorization Passkey** field.
* **Backend Validation**: `authController.js` cryptographically compares the input with the server-side environment variable `COUNCIL_SECRET`. If mismatched, the request is rejected with HTTP `403 Forbidden` (`Invalid Council Authorization Passkey`).

### 2. Institutional Email & Batch Roll Regex Enforcing
* **Problem**: Students registering multiple fake burner accounts (e.g. `test1@gmail.com`, `random@yahoo.com`) to hoard seats.
* **Mechanism**: Accounts require official institutional emails (e.g., `@sst.scaler.com`). Roll numbers are validated against strict regex patterns (e.g., `24bcs...`, `25bcs...`, `26bcs...`).
* **Uniqueness Constraints**: MongoDB unique indexes on both `email` and `rollNumber` guarantee zero duplicate identities.

### 3. Anti-Conflict-of-Interest Barrier
* **Problem**: Organizers taking up limited workshop or sports tournament slots in events they themselves host.
* **Mechanism**: In `registrationController.js`, before an RSVP is committed, the server validates:
  ```javascript
  if (event.organizer.toString() === req.user._id.toString()) {
    return res.status(400).json({ message: 'Organizers cannot register as participants for their own event.' });
  }
  ```

### 4. Cryptographic One-Time Ticket Passes & Gatekeeper Verification
* **Problem**: Screenshots of tickets being forwarded to friends to gain free entry.
* **Mechanism**:
  1. Each registration creates a unique `ticketId` (e.g. `TKT-BR26-981A`).
  2. The ticket is rendered as a scannable SVG QR code embedding the ticket code and student roll number.
  3. Organizers access the **Live QR Scanner & Gate Verifier** (`/verify-ticket`).
  4. Upon scanning, the database checks the ticket status:
     * If `status === 'Registered'`: Updates to `status = 'Attended'`, logs `verifiedAt: new Date()`, and returns a green verified badge with the student's name, roll number, and event title.
     * If `status === 'Attended'`: Immediately triggers a high-priority red alert: **`⚠️ TICKET ALREADY USED! (Scanned at [timestamp]) - Proxy Entry Detected!`**

### 5. Captain-Only Squad Approval & Dynamic Capacity
* **Problem**: Unwanted members auto-joining competitive hackathon or esports teams (BGMI, Free Fire) without consent.
* **Mechanism**:
  * Team captains set team capacity between **2 to 10 members**, declare target roles (e.g., `Assaulter`, `DMR Support`, `FastAPI Dev`), and specify batch preferences (`24BCS`, `25BCS`, `Any Batch`).
  * Joining a squad creates a `Pending` join request.
  * Only the authenticated squad creator can view the applicant's roll number and click **Approve** or **Reject**.
  * The squad automatically seals when the capacity limit is reached.

---

## 🖥️ Dual-Portal Architecture

### 1. Student Portal
* **Live Discovery Feed**: Responsive grid of upcoming events displaying category badges (`Technical`, `Cultural`, `Sports/Esports`, `Workshop`), event date, venue, and live capacity meters.
* **Instant Category Filtering & Search**: Client-side and server-side debounced search for titles, descriptions, and venue keywords.
* **Digital Boarding Pass ("My Passes")**:
  * Instant access to all confirmed reservations.
  * Displays high-contrast SVG QR codes, formatted dates, venue instructions, and boarding pass aesthetics.
  * Real-time **Cancel Reservation** button that automatically restores seat capacity to the event.
* **Teammate & Squad Recruitment Hub**:
  * Browse active squads for hackathons and gaming tournaments (e.g. *Soul Assassins* for BGMI & Free Fire, *Neural Pirates* for TinyFish AI Hackathon).
  * Post a new squad listing or request to join an existing squad with 1 click.

### 2. Council & Organizer Portal
* **Rapid Event Creation**:
  * Rich creation modal with capacity controls, date & time pickers, and category tags.
  * **Built-In Preset Banners**: Pre-configured high-definition posters for Esports (BGMI & Free Fire), Hackathons, Cultural Runways, and Sports Arenas.
* **Live Attendee Roster**:
  * Real-time roster table displaying Student Name, Institutional Roll Number, Department, Ticket ID, and Check-In Status.
* **Integrated Gatekeeper QR Verifier**:
  * Live camera stream using `html5-qrcode` to scan digital passes at entry gates.
  * Manual Ticket ID input fallback with keyboard shortcuts.
* **Event Lifecycle Control**:
  * Delete or close events with cascading cleanup of associated student registrations.

---

## 🏛️ System Architecture & MVC Structure

```
emg/
├── .gitignore                    # Comprehensive secrets & build artifact ignore file
├── package.json                  # Root deployment & unified build automation
├── README.md                     # Comprehensive project documentation
│
├── backend/                      # MODEL-VIEW-CONTROLLER (MVC) BACKEND
│   ├── config/
│   │   └── db.js                 # MongoDB Atlas connection with retry handling
│   ├── models/                   # [M] MONGOOSE DATA MODELS
│   │   ├── User.js               # User model (Bcrypt hashing, roll regex, role enum)
│   │   ├── Event.js              # Event model (Capacity, category, banner, timestamps)
│   │   ├── Registration.js       # RSVP model (TicketId, status: Registered/Attended)
│   │   └── TeamRequest.js        # Squad model (Capacity, members, pending requests)
│   ├── controllers/              # [C] BUSINESS LOGIC CONTROLLERS
│   │   ├── authController.js     # Auth, JWT generation, Council passkey enforcement
│   │   ├── eventController.js    # Event CRUD, category filters, seat counters
│   │   ├── registrationController.js # RSVPs, ticket generation, QR gate verification
│   │   └── teamController.js     # Squad creation, join requests, captain approvals
│   ├── routes/                   # EXPRESS ROUTING INTERFACES
│   │   ├── authRoutes.js         # /api/auth/*
│   │   ├── eventRoutes.js        # /api/events/*
│   │   ├── registrationRoutes.js # /api/registrations/*
│   │   └── teamRoutes.js         # /api/teams/*
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT Bearer verification & Organizer role guard
│   │   └── errorMiddleware.js    # Centralized 404 & exception handler
│   ├── seed.js                   # 1-Click institutional database seeder
│   ├── server.js                 # Express server + production SPA static serving
│   ├── .env.example              # Environment variables template
│   └── package.json
│
└── frontend/                     # [V] MODERN REACT 19 VIEW LAYER
    ├── public/
    │   └── bgmi_freefire_banner.jpg # Esports tournament banner asset
    ├── src/
    │   ├── api/
    │   │   └── axios.js          # Axios instance with automatic JWT Authorization interceptor
    │   ├── context/
    │   │   └── AuthContext.jsx   # Global auth state & persistent session management
    │   ├── components/
    │   │   ├── Navbar.jsx        # Glassmorphic navbar, role badge, quick actions
    │   │   ├── HeroStats.jsx     # Live metrics counter & interactive category pill filters
    │   │   ├── EventCard.jsx     # Card component with live capacity bar & RSVP trigger
    │   │   ├── EventDetailModal.jsx # Detailed event inspection & Squad Hub tab
    │   │   ├── CreateEventModal.jsx # Council event creation form with preset posters
    │   │   ├── AttendeesModal.jsx# Live student attendee roster & QR gate verifier
    │   │   ├── MyPassesModal.jsx # Digital boarding passes with SVG QR codes
    │   │   └── AuthModal.jsx     # Clean modal for Student & Council authentication
    │   ├── App.jsx               # Application root, toast providers, modal coordinators
    │   ├── index.css             # Vanilla CSS design system (Glassmorphism, mobile queries)
    │   └── main.jsx
    └── package.json
```

---

## 🗄️ Database Schema Design

### 1. `User` Schema
```javascript
{
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true }, // Bcrypt hashed (10 salt rounds)
  role: { type: String, enum: ['student', 'organizer'], default: 'student' },
  rollNumber: { type: String, required: true, unique: true }, // e.g. 24bcs10042
  department: { type: String, default: 'Computer Science & Engineering' },
  createdAt: { type: Date, default: Date.now }
}
```

### 2. `Event` Schema
```javascript
{
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, enum: ['Technical', 'Cultural', 'Sports', 'Workshop'], required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  venue: { type: String, required: true },
  capacity: { type: Number, required: true },
  registeredCount: { type: Number, default: 0 },
  banner: { type: String, default: '...' },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  organizerName: { type: String, required: true },
  status: { type: String, enum: ['Upcoming', 'Ongoing', 'Completed'], default: 'Upcoming' }
}
```

### 3. `Registration` (RSVP / Ticket) Schema
```javascript
{
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ticketId: { type: String, required: true, unique: true }, // e.g. TKT-TF24-001
  status: { type: String, enum: ['Registered', 'Attended', 'Cancelled'], default: 'Registered' },
  registeredAt: { type: Date, default: Date.now },
  verifiedAt: { type: Date } // Populated upon gate QR scan
}
```

### 4. `TeamRequest` (Squad Hub) Schema
```javascript
{
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  teamName: { type: String, required: true },
  description: { type: String, required: true },
  rolesNeeded: [{ type: String }],
  batchPreference: { type: String, default: 'Any Batch' },
  slotsTotal: { type: Number, default: 4, min: 2, max: 10 },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  pendingRequests: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String },
    requestedAt: { type: Date, default: Date.now }
  }],
  status: { type: String, enum: ['Open', 'Full', 'Closed'], default: 'Open' }
}
```

---

## 📡 RESTful API Specification

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register Student or Council Member (Requires `councilSecret` if role is organizer) |
| `POST` | `/api/auth/login` | Public | Authenticate user & return signed JWT Bearer token |
| `GET` | `/api/auth/me` | Protected | Fetch currently authenticated user profile |

### 📅 Events (`/api/events`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/events` | Public | Get all events (Supports `?category=Sports` & `?search=bgmi`) |
| `GET` | `/api/events/:id` | Public | Retrieve single event details |
| `GET` | `/api/events/stats/summary`| Public | Fetch total counts of active events and registrations |
| `POST` | `/api/events` | Organizer | Create a new campus event |
| `DELETE` | `/api/events/:id` | Organizer | Delete event & cascade delete student registrations |

### 🎟️ Registrations & QR Gate Verification (`/api/registrations`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/registrations/:eventId` | Student | RSVP / Reserve seat (Generates unique `ticketId`) |
| `GET` | `/api/registrations/my-passes` | Student | Fetch logged-in student's active boarding passes |
| `DELETE` | `/api/registrations/:id` | Student | Cancel ticket & restore seat capacity |
| `GET` | `/api/registrations/event/:id/attendees` | Organizer | Fetch attendee roster table with roll numbers |
| `POST` | `/api/registrations/verify-ticket` | Organizer | **Gatekeeper QR Verifier**: Validates ticket and flips status to `Attended` |

### 👥 Squads & Teammate Hub (`/api/teams`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/teams/event/:eventId` | Public | Fetch all open squads for a tournament/hackathon |
| `POST` | `/api/teams` | Student | Create a squad listing with custom capacity & roles |
| `POST` | `/api/teams/:id/request` | Student | Submit a join request to a squad |
| `PUT` | `/api/teams/:id/requests/:userId` | Captain | **Captain Only**: Approve or Reject a pending request |

---

## 🚀 Production Deployment Guide

CampusPulse is production-ready and can be deployed in under 5 minutes.

### Option 1: Unified Single-Service Deployment (Render / Railway / Heroku) — *Recommended*

The backend's Express server is already configured to automatically serve the compiled React Vite frontend when `NODE_ENV=production`.

1. **Push your code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "feat: complete CampusPulse event portal"
   git branch -M main
   git remote add origin https://github.com/Rudra30507/CampusPlus.git
   git push -u origin main
   ```

2. **Create a New Web Service on Render / Railway**:
   * **Root Directory**: Leave blank (root).
   * **Build Command**:
     ```bash
     npm run build
     ```
     *(Runs root `package.json` script: installs backend + installs frontend + builds Vite dist).*
   * **Start Command**:
     ```bash
     npm start
     ```
     *(Runs `node backend/server.js`).*

3. **Configure Environment Variables**:
   Add the following in your deployment platform's Environment Settings:
   ```env
   NODE_ENV=production
   PORT=5000
   MONGO_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/college_events?retryWrites=true&w=majority
   JWT_SECRET=your_super_strong_jwt_production_secret
   COUNCIL_SECRET=SST_COUNCIL_2026
   CLIENT_URL=https://<your-deployed-app-url>.onrender.com
   ```

4. **Whitelist Network in MongoDB Atlas**:
   * In MongoDB Atlas ➔ **Network Access** ➔ Click **Add IP Address** ➔ Choose **Allow Access from Anywhere (`0.0.0.0/0`)** so your cloud server can connect.

---

### Option 2: Split Deployment (Frontend on Vercel + Backend on Render)

If you prefer hosting the frontend independently on Vercel:

1. **Deploy Backend on Render**:
   * Set Root Directory to `backend`.
   * Build Command: `npm install`
   * Start Command: `node server.js`
   * Set environment variables as listed above.
2. **Deploy Frontend on Vercel**:
   * Set Root Directory to `frontend`.
   * Framework Preset: `Vite`.
   * In `frontend/src/api/axios.js`, set `baseURL` to your deployed backend URL:
     ```javascript
     baseURL: import.meta.env.VITE_API_URL || 'https://your-backend.onrender.com/api'
     ```
   * Add environment variable in Vercel: `VITE_API_URL=https://your-backend.onrender.com/api`.

---

## 💻 Local Development & Quickstart

### Prerequisites
* [Node.js (v18+)](https://nodejs.org/)
* [Git](https://git-scm.com/)
* Active MongoDB Atlas cluster or local MongoDB instance

### 1. Clone & Configure
```bash
git clone https://github.com/Rudra30507/CampusPlus.git
cd CampusPlus
```

Create `backend/.env` (using `backend/.env.example` as a template):
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/college_events?retryWrites=true&w=majority
JWT_SECRET=super_secret_jwt_key_2026
CLIENT_URL=http://localhost:5180
NODE_ENV=development
COUNCIL_SECRET=SST_COUNCIL_2026
```

### 2. Install & Seed Database
```bash
# Seed demo accounts and realistic campus events (including BGMI & Free Fire)
cd backend
npm install
npm run seed
```

### 3. Run Locally
**Terminal 1 (Backend - Port 5000):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend - Port 5180):**
```bash
cd frontend
npm install
npm run dev
```

Visit **`http://localhost:5180`** in your browser.

---

## 🔑 Test & Evaluation Credentials

Use these verified credentials populated by `npm run seed`:

| Account Type | Institutional Email | Roll Number | Password | Capabilities |
|---|---|---|---|---|
| **Student (Batch 2024)** | `rudra.24bcs10042@sst.scaler.com` | `24bcs10042` | `password123` | Browse, RSVP, view QR passes, lead *Soul Assassins* squad |
| **Student (Batch 2025)** | `aarav.25bcs10018@sst.scaler.com` | `25bcs10018` | `password123` | Browse, RSVP, view QR passes, lead *Cricket* squad |
| **Student (Batch 2026)** | `priya.26bcs10091@sst.scaler.com` | `26bcs10091` | `password123` | Browse, RSVP, view Fashion Show pass |
| **Event Council / Admin** | `events@sst.scaler.com` | `ADMIN-01` | `password123` | Publish events, delete events, inspect attendee roster, scan QR codes |

> 🛡️ **Council Authorization Passkey**: `SST_COUNCIL_2026`  
> *(Enter this passkey when signing up a new organizer account).*

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
Built with ❤️ for collegiate student communities and event organizers.
