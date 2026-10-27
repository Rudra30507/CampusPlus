# 🎓 CampusPulse — Next-Gen College Event Management & Verification System

[![React 19](https://img.shields.io/badge/Frontend-React_19_+_Vite-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js_+_Express_MVC-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB_Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Security](https://img.shields.io/badge/Security-Council_Passkey_+_One--Time_QR-E53E3E?logo=auth0&logoColor=white)](https://jwt.io/)
[![Design](https://img.shields.io/badge/UI/UX-Glassmorphism_Dark_Design-8B5CF6)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> **A production-ready, full-stack campus event management ecosystem built strictly on the MVC (Model-View-Controller) architecture pattern.**  
> Features real-time seat locking, fraud-proof digital boarding passes with live camera QR gate verification, institutional roll/email validation, squad recruitment with captain approval, and council passkey authorization.

---

## 🔗 Project Links

* **📹 Video Demo**: [Watch 3-Minute Walkthrough on Google Drive](https://drive.google.com/file/d/1uvbG1ZvWf8ZLqWZCOBwyK6-A2pUhZeTA/view?usp=drivesdk)
* **💻 GitHub Repository**: [https://github.com/Rudra30507/CampusPlus](https://github.com/Rudra30507/CampusPlus)
* **🌐 Live Web Application**: [https://campus-plus-five-gamma.vercel.app](https://campus-plus-five-gamma.vercel.app) *(or deployed Render service)*

---

## 📑 Table of Contents
1. [Project Name](#-project-name)
2. [Problem Statement](#-1-problem-statement)
3. [Target Users](#-2-target-users)
4. [Solution](#-3-solution)
5. [Key Features](#-4-key-features)
6. [Tech Stack](#-5-tech-stack)
7. [Architecture](#-6-architecture)
8. [Local Setup](#-7-local-setup)
9. [Environment Variables](#-8-environment-variables)
10. [Deployment](#-9-deployment)

---

## 🏷️ Project Name
### **CampusPulse — College Event & Workshop Management Portal**
*Next-generation campus event discovery, ticket verification, and student squad collaboration platform.*

---

## 🛑 1. Problem Statement
### *What problem are we solving?*

In universities and colleges, managing campus events, workshops, cultural galas, and sports tournaments currently relies on fragmented tools like **Google Forms, WhatsApp group announcements, and manual spreadsheets**. This leads to severe operational and security breakdowns:

1. **Uncontrolled Seat Overbooking**:
   * Google Forms lack real-time capacity meters or concurrency locks. A 30-seat hands-on AI lab or a limited-seat hackathon often gets 200+ submissions, forcing organizers to manually reject students and causing disputes at the venue door.
2. **Proxy Entries & Ticket Duplication**:
   * Students frequently take screenshots of confirmation emails or forwarded WhatsApp passes to sneak unauthorized friends into exclusive events. Organizers have no way to verify if a pass has already been used.
3. **Fake / Impostor Organizers**:
   * Any student can create an unapproved form, post fake posters on campus groups, and collect student data or spam attendees without authorization from the college student council.
4. **Organizer Self-Registration Conflicts**:
   * Club leads and event hosts often book out slots in their own competitive tournaments or workshops for themselves, preventing deserving students from participating.
5. **Fragmented Teammate Discovery**:
   * Finding teammates for hackathons or competitive esports (BGMI, Free Fire) results in endless spamming across unofficial Discord servers with no role requirements, capacity limits, or captain screening.

---

## 👥 2. Target Users
### *Who is the application built for?*

CampusPulse is engineered specifically for collegiate institutions, clubs, and student bodies:

| Target User Group | Role in CampusPulse | How They Use the System |
|---|---|---|
| **College Students** | `student` | Discover events across Technical, Cultural, and Sports categories; book instant seats; access digital SVG QR boarding passes; create or request to join hackathon and esports squads. |
| **Club Leads & Event Organizers** | `organizer` | Publish verified campus events using preset high-definition banners; monitor real-time attendee rosters with roll numbers and timestamps; manage capacity. |
| **Student Council & Gatekeepers** | `organizer / admin` | Authenticate using a secret institutional passkey; operate the live **Gatekeeper QR Scanner** at venue entrances to check in attendees and block duplicate tickets. |
| **College Administration & Faculty** | `auditor` | Ensure transparent, fraud-free event records verified against official `@sst.scaler.com` institutional emails and batch roll numbers (`24BCS`, `25BCS`, `26BCS`). |

---

## 💡 3. Solution
### *How does our product solve the problem?*

CampusPulse provides a unified, full-stack digital pipeline that completely replaces manual forms and physical tickets:

```
[Student Discovery Feed] ➔ [Atomic Real-Time Seat Lock] ➔ [Cryptographic QR Boarding Pass]
                                                                     │
                                                                     ▼
[Gate Entry Scan] ➔ [One-Time State Transition: Attended] ➔ [Anti-Proxy Alert if Re-scanned]
```

### 🛡️ The 5-Layer Security & Anti-Fraud Architecture:
1. **Council Secret Passkey Gate (`COUNCIL_SECRET_PASSKEY`)**:
   * Nobody can register as an organizer without providing the institutional secret passkey (`SST_COUNCIL_2026`). Impostors are hard-blocked by the backend with HTTP `403 Forbidden`.
2. **Institutional Identity Regex Enforcement**:
   * Requires official college domain emails (`@sst.scaler.com`) and strictly formatted batch roll numbers (`24bcs...`, `25bcs...`, `26bcs...`). MongoDB unique indexes prevent duplicate burner accounts.
3. **Anti-Conflict-of-Interest Barrier**:
   * The backend strictly validates that event organizers cannot register as participants in their own hosted events.
4. **One-Time Cryptographic QR Verification**:
   * Each pass contains a unique Ticket ID (`TKT-...`). When scanned by the gatekeeper camera, status flips from `Registered` to `Attended`. Any subsequent scan immediately triggers a red warning: **"⚠️ PROXY DETECTED — TICKET ALREADY USED!"**.
5. **Captain-Only Squad Approval Gate**:
   * Squad creators select custom capacity (2 to 10 members) and required roles. Applicants submit a join request; **only the squad captain has the authority to approve or reject members**.

---

## ⚡ 4. Key Features
### *What can users actually do?*

### 🎓 Student Portal Capabilities
* **Dynamic Event Discovery**: Live feed of campus events with category filter pills (`Technical`, `Cultural`, `Sports/Esports`, `Workshop`) and real-time search.
* **Live Seat Availability Meter**: Real-time visual progress bar showing booked vs available capacity (e.g., `85% Filled`).
* **1-Click Instant RSVP**: Reserve a seat with atomic database updates that instantly deduct available seats.
* **Digital Boarding Pass Hub ("My Passes")**:
  * View confirmed passes styled as airline boarding passes with high-contrast scannable SVG QR codes.
  * Unique cryptographic Ticket ID hashes (e.g., `TKT-TF24-001`).
  * 1-Click **Cancel Reservation** button that automatically restores seat capacity to the public pool.
* **Teammate & Squad Hub**:
  * Create squad listings with customizable slots (2 to 10 members), target roles (e.g. `Entry Fragger`, `FastAPI Backend`), and batch preferences (`24BCS`, `25BCS`, `Any Batch`).
  * Send join requests to open squads like *Soul Assassins* (BGMI/Free Fire) or *Neural Pirates* (TinyFish AI Hackathon).

### 🏛️ Council & Organizer Portal Capabilities
* **1-Click Event Publishing**: Create events with venue, date, time, seat capacity, and **preset cinematic banners** (Esports BGMI/Free Fire, AI Hackathons, Runway Fashion Shows, Sports Tournaments) or custom URLs.
* **Live Attendee Roster Table**: View registered students with full names, institutional roll numbers, departments, ticket IDs, and check-in statuses.
* **Gatekeeper Live QR Scanner (`/verify-ticket`)**:
  * Integrated camera QR scanner (`html5-qrcode`) and manual Ticket ID lookup.
  * Instant green verification badge displaying student details upon valid entry.
  * Instant red alert upon detecting a used ticket or proxy scan attempt.
* **Event Lifecycle Management**: Delete or close events with cascading cleanup of associated student registrations.

---

## 🛠️ 5. Tech Stack
### *What technologies did you use?*

| Layer | Technologies Used | Purpose |
|---|---|---|
| **Frontend Framework** | **React 19** + **Vite** | Modern component-driven UI with lightning-fast HMR and bundle optimization. |
| **Styling & UI/UX** | **Vanilla CSS3** (Custom Design System) | Modern glassmorphism dark-mode aesthetics, custom CSS variables, and full mobile media query responsiveness. |
| **Icons & Visuals** | **Lucide React** + **Canvas-Confetti** | Crisp vector iconography and micro-animations upon ticket booking. |
| **QR Code Engine** | **html5-qrcode** + **SVG QR Generator** | Client-side scannable pass generation and live camera gate scanner. |
| **Backend Runtime** | **Node.js** + **Express.js** | Robust RESTful API server strictly organized in the **MVC Pattern**. |
| **Authentication** | **JWT (JSON Web Tokens)** + **Bcrypt.js** | Secure Bearer token authentication and 10-round salted password hashing. |
| **Database** | **MongoDB Atlas Cloud Cluster** + **Mongoose** | High-availability cloud NoSQL database with atomic increments and unique indexes. |
| **Version Control** | **Git** + **GitHub** | Version control with automated root build pipelines and secret safeguarding. |
| **Deployment** | **Vercel** & **Render** | Cloud hosting with static SPA CDN and serverless/Node web service support. |

---

## 🏗️ 6. Architecture
### *Explain the major components of your application*

The application is structured strictly according to the **Model-View-Controller (MVC)** architectural design pattern:

```
CampusPulse/
├── [VIEW LAYER] (Frontend - React 19 + Vite)
│   ├── Components: Navbar, HeroStats, EventCard, EventDetailModal, CreateEventModal, AttendeesModal, MyPassesModal, AuthModal
│   ├── State: Global AuthContext (persistent sessions) & Axios API interceptor with JWT tokens
│   └── Assets: Preset banners (BGMI/Free Fire Esports, Hackathon, Cultural)
│
├── [CONTROLLER LAYER] (Backend - Business Logic & Security)
│   ├── authController.js         ➔ User registration, login, council passkey gate
│   ├── eventController.js        ➔ Event CRUD, search, category filters, seat counters
│   ├── registrationController.js ➔ RSVP locking, cancellation, passes, QR gate verifier
│   └── teamController.js         ➔ Squad creation, join requests, captain approval logic
│
├── [MODEL LAYER] (Database - MongoDB Atlas via Mongoose)
│   ├── User.js                   ➔ Students & Organizers (bcrypt hash, roll regex)
│   ├── Event.js                  ➔ Title, description, category, capacity, count, banner
│   ├── Registration.js           ➔ Unique ticketId, event & student refs, status (Registered/Attended)
│   └── TeamRequest.js            ➔ Squad capacity (2-10), roles, pending requests, members
│
└── [INFRASTRUCTURE & MIDDLEWARE]
    ├── authMiddleware.js         ➔ JWT Bearer guard & Organizer role authorization
    ├── errorMiddleware.js        ➔ Centralized exception handling
    └── db.js                     ➔ Cached MongoDB Atlas connection for serverless/cloud
```

### 🔄 End-to-End System Workflow Diagram:
```
[User Browser]
      │
      ▼  (HTTP Requests with JWT Bearer Token)
[Express Routing Layer] (/api/auth, /api/events, /api/registrations, /api/teams)
      │
      ▼  (Role & Token Guards)
[authMiddleware.js] ➔ Rejects unauthenticated or unauthorized requests (401/403)
      │
      ▼
[Controller Layer] ➔ Executes business rules (Atomic seat checks, passkey match, captain approvals)
      │
      ▼
[Mongoose ODM] ➔ Validates Schemas & Unique Indexes
      │
      ▼
[MongoDB Atlas Cloud] ➔ Persists atomic transaction state
```

---

## 💻 7. Local Setup
### *Provide clear instructions for running the application*

### Prerequisites
* [Node.js (v18 or higher)](https://nodejs.org/)
* [Git](https://git-scm.com/)
* Active MongoDB Atlas cluster or local MongoDB instance

### Step 1: Clone the Repository
```bash
git clone https://github.com/Rudra30507/CampusPlus.git
cd CampusPlus
```

### Step 2: Configure Environment Variables
Inside `backend/`, copy `.env.example` to create your local `.env`:
```bash
cp backend/.env.example backend/.env
```
Ensure your `backend/.env` contains:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/college_events?retryWrites=true&w=majority
JWT_SECRET=super_secret_jwt_key_2026
CLIENT_URL=http://localhost:5180
NODE_ENV=development
COUNCIL_SECRET=SST_COUNCIL_2026
```

### Step 3: Install Dependencies & Seed Database
```bash
# Seed demo accounts and realistic campus events (including BGMI & Free Fire)
cd backend
npm install
npm run seed
```

### Step 4: Run the Application
**Terminal 1 (Backend Server - Port 5000):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend Client - Port 5180):**
```bash
cd frontend
npm install
npm run dev
```

Open your browser and navigate to: **`http://localhost:5180`**

---

### 🔑 Verified Test & Evaluation Accounts (From `npm run seed`)
Use these pre-populated SST credentials for evaluation:

| Account Type | Institutional Email | Roll Number | Password | Capabilities |
|---|---|---|---|---|
| **Student (Batch 2024)** | `rudra.24bcs10042@sst.scaler.com` | `24bcs10042` | `password123` | Browse, RSVP, view QR passes, lead *Soul Assassins* squad |
| **Student (Batch 2025)** | `aarav.25bcs10018@sst.scaler.com` | `25bcs10018` | `password123` | Browse, RSVP, view QR passes, lead *Cricket* squad |
| **Student (Batch 2026)** | `priya.26bcs10091@sst.scaler.com` | `26bcs10091` | `password123` | Browse, RSVP, view Fashion Show pass |
| **Council / Admin** | `events@sst.scaler.com` | `ADMIN-01` | `password123` | Create events, delete events, inspect attendee roster, scan QR codes |

> 🛡️ **Council Secret Passkey**: `SST_COUNCIL_2026`  
> *(Required when signing up as a new Club / Event Lead).*

---

## 🔐 8. Environment Variables
### *Document required configuration without exposing secrets*

All sensitive keys are abstracted into environment variables. A template is maintained in [`backend/.env.example`](file:///c:/Users/rudi3/OneDrive/Desktop/emg/backend/.env.example):

| Variable Name | Required | Default Example | Description |
|---|---|---|---|
| `PORT` | Optional | `5000` | Port for Express backend server. |
| `MONGO_URI` | **Required** | `mongodb+srv://<user>:<pwd>@cluster...` | MongoDB Atlas cloud cluster connection URI. |
| `JWT_SECRET` | **Required** | `your_super_secret_jwt_key` | Secret key used to sign and verify JSON Web Tokens. |
| `COUNCIL_SECRET` | **Required** | `SST_COUNCIL_2026` | Secret passkey required to register new organizer accounts. |
| `NODE_ENV` | **Required** | `development` / `production` | Node runtime environment mode. |
| `CLIENT_URL` | Optional | `http://localhost:5180` | Client origin URL for CORS policy. |
| `VITE_API_URL` | Optional (Frontend) | `/api` | Base API endpoint URL for frontend Axios client. |

> ⚠️ **Security Notice**: Actual `.env` files are strictly excluded from version control via `.gitignore` to prevent credential exposure.

---

## 🚀 9. Deployment
### *Provide links or instructions for accessing the final application*

### 🌐 Live Deployment Links
* **Live Web Application**: [https://campus-plus-five-gamma.vercel.app](https://campus-plus-five-gamma.vercel.app) *(or your deployed Render service URL)*
* **Video Walkthrough Demo**: [Google Drive Video Link](https://drive.google.com/file/d/1uvbG1ZvWf8ZLqWZCOBwyK6-A2pUhZeTA/view?usp=drivesdk)
* **GitHub Repository**: [https://github.com/Rudra30507/CampusPlus](https://github.com/Rudra30507/CampusPlus)

---

### Cloud Deployment Instructions

#### Option A: 1-Click Full-Stack Deployment on Render (Recommended)
CampusPulse includes a root build script that compiles the Vite frontend and serves it directly from the Express backend on a single unified URL:
1. In [Render Dashboard](https://dashboard.render.com), create a **New Web Service** and select `Rudra30507/CampusPlus`.
2. Leave **Root Directory** blank.
3. Set **Build Command**: `npm run build`
4. Set **Start Command**: `node backend/server.js`
5. Under **Environment Variables**, add:
   * `NODE_ENV` = `production`
   * `MONGO_URI` = `your_mongodb_atlas_uri`
   * `JWT_SECRET` = `your_jwt_secret`
   * `COUNCIL_SECRET` = `SST_COUNCIL_2026`
6. Click **Deploy Web Service**.

#### Option B: Frontend on Vercel
1. In [Vercel Dashboard](https://vercel.com), import `Rudra30507/CampusPlus`.
2. Under **Root Directory**, select **`frontend`**.
3. Framework Preset will auto-detect as **Vite**.
4. Set Environment Variable: `VITE_API_URL` = `https://your-backend-service.onrender.com/api`.
5. Click **Deploy**. SPA rewrites are pre-configured in `frontend/vercel.json`.

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).  
Built with ❤️ for student communities, campus club councils, and event organizers.
