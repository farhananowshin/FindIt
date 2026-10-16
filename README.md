# 🔍 FindIt — Explainable Multimodal Lost and Found Matching System

FindIt is an intelligent, explainable matching system designed for university campuses. It pairs lost item reports with found items using multimodal artificial intelligence (Visual Similarity via CLIP + Semantic Text Similarity via Sentence Transformers) combined with spatiotemporal and attribute matching.

---

## 🏛️ System Architecture

```
FindIt/
├── frontend/             # Next.js 16 (TypeScript, Tailwind CSS v4, Lucide Icons)
│   ├── src/
│   │   ├── app/
│   │   │   ├── admin/page.tsx    # Admin Verification Dashboard (Human-in-the-Loop)
│   │   │   ├── my-claims/page.tsx# Student My Claims status tracker
│   │   │   └── page.tsx          # Campus feed, modals, and report submission
│   │   ├── components/           # AuthModal, ClaimModal, Navbar, ItemUploadForm, etc.
│   │   ├── context/AuthContext.tsx# JWT auth session & state provider
│   │   ├── services/api.ts       # REST client for items, AI matches, auth, and claims
│   │   └── types/item.ts         # User, Claim, Item TypeScript definitions
├── backend/              # Node.js + Express.js REST API + MongoDB Mongoose (Days 2 & 4)
│   ├── src/
│   │   ├── config/db.js        # MongoDB connection manager
│   │   ├── middleware/auth.js  # JWT authentication & requireRole RBAC middleware
│   │   ├── middleware/upload.js# Multer image upload security
│   │   ├── models/
│   │   │   ├── ItemReport.js   # Item schema with submitterId and secret protection
│   │   │   ├── User.js         # User schema with bcrypt hashing & role enforcement
│   │   │   └── Claim.js        # Ownership Claim schema with status lifecycle
│   │   ├── routes/
│   │   │   ├── authRoutes.js   # /api/auth/register, /api/auth/login, /api/auth/me
│   │   │   ├── claimRoutes.js  # /api/claims (student submit, my-claims, admin review)
│   │   │   └── itemRoutes.js   # /api/items (authenticated submit, public list, admin view)
│   │   └── scripts/
│   │       └── seedAdmin.js    # Secure admin account provisioning script
│   ├── uploads/          # Static file storage for item photos
│   ├── server.js         # Express app entrypoint & health checks
│   ├── test-backend.js   # Day 2 automated test suite (22 tests)
│   └── test-day4.js      # Day 4 automated test suite (55 tests)
├── ai-service/           # Python + FastAPI (CLIP & Sentence Transformers) (Day 3)
├── dataset/              # Benchmark dataset & evaluation tools (Day 5)
└── README.md             # Master documentation & instructions
```

---

## 📅 Roadmap Overview

- [x] **Day 1: Project Setup & Responsive Lost/Found Upload Form**
  - Next.js 16 App Router with TypeScript & Tailwind CSS.
  - Interactive Lost / Found item submission form with image upload preview.
  - Spatiotemporal input fields (campus locations, dates, landmarks).
  - Feature-level attribute tagging (colors, unique marks, verification hints).
- [x] **Day 2: Backend API & MongoDB Database Integration**
  - Node.js & Express REST API server running on port 5000.
  - MongoDB `ItemReport` schema with strict privacy (`secretVerificationDetail` is never exposed).
  - Multer multipart/form-data image upload (5MB limits, MIME validation).
  - REST endpoints: `POST /api/items`, `GET /api/items`, `GET /api/items/:id`, `GET /api/health`.
  - Frontend integration with live feed, live data refresh, and offline error states.
- [x] **Day 3: Multimodal AI Service & Explainable Matching Engine (FastAPI)**
  - Python FastAPI microservice on port 8001 (`/health`, `/api/embed`, `/api/match`).
  - OpenCLIP `ViT-B-32` image embeddings (512-dim, L2-normalized) with path traversal guards.
  - Sentence Transformers `all-MiniLM-L6-v2` semantic text embeddings (384-dim, L2-normalized).
  - 5-weight formula (0.40 Visual, 0.25 Text, 0.15 Location, 0.10 Time, 0.10 Attribute).
  - Missing modality weight re-normalization: $W'_m = W_m / \sum W_{\text{available}}$.
  - Express proxy bridge (`GET /api/items/:id/matches`).
  - Frontend Explainable Matches Modal with 5-bar similarity breakdown and human-in-the-loop warning.
- [x] **Day 4: Authentication, Role Management & Ownership Claim System**
  - Express authentication with bcrypt password hashing (10 salt rounds) and signed JWT tokens.
  - Role-Based Access Control (`student` vs `admin`) with zero public role escalation.
  - Ownership claims lifecycle (`pending` -> `approved` / `rejected`) for found items.
  - Confidential verification answer and distinguishing proof submitted by claimants.
  - Protected endpoints: `POST /api/claims`, `GET /api/claims/my-claims`, `GET /api/claims` (admin), `PATCH /api/claims/:id/status` (admin).
  - Item status updates to `claimed` upon approval; automatic rejection of competing claims.
  - Frontend Student Dashboard (`/my-claims`) and Admin Verification Portal (`/admin`).
  - Comprehensive automated integration test suite (`backend/test-day4.js` with 55/55 passing tests).
- [ ] **Day 5: Dataset, Validation & Weight Grid Search**
  - 300–500 pair benchmark dataset.
  - Grid search evaluation script for Precision@K, Recall@K, and MRR.

---

## 🚀 Quick Start Guide (Day 4: Full Stack with Auth & Claims)

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (Installed: `v24.18.0`)
- **Python**: v3.10 to v3.13 (Installed: `3.13`)
- **MongoDB**: A running local MongoDB instance (`mongodb://localhost:27017`) or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) connection URI.

---

### 2. Verify MongoDB is Running
On Windows, MongoDB runs as a background service:
```powershell
Get-Service -Name MongoDB
# If Stopped, run: Start-Service -Name MongoDB
```

---

### 3. Start the Backend API & Provision Admin (Terminal 1)
1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd d:\my_all_project\FindIt\backend
   npm install
   ```
2. Provision the campus administrator account (reads from `backend/.env`):
   ```bash
   npm run seed:admin
   ```
   *Default seed credentials: `admin@campus.edu` / `AdminSecure2026!` (role: `admin`)*
3. Start the Express development server:
   ```bash
   npm run dev
   ```
   *Express runs on **`http://localhost:5000`** with `/api/auth`, `/api/claims`, and `/api/items`.*

---

### 4. Start the Python AI Microservice (Terminal 2)
1. Open a **second terminal** and navigate to the `ai-service` folder:
   ```bash
   cd d:\my_all_project\FindIt\ai-service
   ```
2. Activate the virtual environment:
   ```bash
   .venv\Scripts\activate
   ```
3. Start the FastAPI microservice:
   ```bash
   uvicorn main:app --host 127.0.0.1 --port 8001 --reload
   ```
   *FastAPI runs on **`http://localhost:8001`** and loads OpenCLIP (`ViT-B-32`) + Sentence Transformers (`all-MiniLM-L6-v2`).*

---

### 5. Start the Next.js Frontend (Terminal 3)
1. Open a **third terminal** and navigate to the `frontend` folder:
   ```bash
   cd d:\my_all_project\FindIt\frontend
   npm install
   npm run dev
   ```
2. Open your browser and navigate to **`http://localhost:3000`**.
   - **Student Registration & Login**: Click "Register" or "Log In" in the top navbar. Public registration creates students only (`role: "student"`).
   - **Submit Item Report**: Fill out the report form (requires student login). Submitter details auto-populate.
   - **AI Matching**: Click "Find AI Matches (5-Weight)" on any Lost item to open the explainable match viewer.
   - **Claim a Found Item**: Click "Claim This Item" on any active Found card, enter confidential proof and secret verification answers.
   - **Student Dashboard**: Navigate to `/my-claims` to review your submitted claims and administrative review notes.
   - **Admin Verification Portal**: Log in as `admin@campus.edu` and open `/admin` to inspect confidential secrets side-by-side and approve or reject claims.

---

### 6. Run the Automated Test Suites
From the `backend` directory:
- **Day 4 Full Authentication & Claims Suite (55 Tests)**:
  ```bash
  node test-day4.js
  ```
- **Day 2 CRUD & Validation Suite (22 Tests)**:
  ```bash
  node test-backend.js
  ```

---

## 🔒 Security & Privacy Notice (Days 2 & 4)
- **Password Security**: Passwords are cryptographically hashed using `bcryptjs` with 10 salt rounds. Plaintext passwords and password hashes are never returned in API responses (`toJSON` schema transforms).
- **JWT Authorization**: Cryptographically signed JSON Web Tokens (`HS256`) with a 7-day expiration time (`JWT_EXPIRES_IN`). Protected endpoints strictly enforce the `Authorization: Bearer <token>` header.
- **Role Escalation Prevention**: Public registration (`POST /api/auth/register`) enforces `role: "student"`. Any client payload attempting `role: "admin"` is immediately rejected with HTTP 403 Forbidden.
- **Admin Seeding**: Administrators can only be provisioned via the secure offline seed script `npm run seed:admin` using environment variables.
- **Confidential Item Secrets**: The field `secretVerificationDetail` is marked `select: false` in Mongoose and is stripped from all public item listings. Only authorized administrators querying the review queue can inspect this field for cross-examination.
- **Atomic Claim Approval**: When an admin approves an ownership claim, the target item transitions to `claimed`, and any other pending claims for that item are automatically and atomically rejected.
- **Upload Guards**: Multer enforces MIME-type whitelisting (`image/jpeg`, `image/png`, `image/webp`), 5MB maximum file sizes, and generates random UUID filenames to prevent path traversal attacks.
