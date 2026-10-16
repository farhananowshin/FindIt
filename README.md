# 🔍 FindIt — Explainable Multimodal Lost and Found Matching System

FindIt is an intelligent, privacy-preserving, and explainable lost-and-found matching system designed for university campuses. It pairs lost item reports with found items using multimodal artificial intelligence (Visual Similarity via OpenCLIP + Semantic Text Similarity via Sentence Transformers) combined with spatiotemporal campus reasoning and physical attribute cross-matching.

The system incorporates **human-in-the-loop ownership verification**, ensuring that AI suggests matches with mathematically transparent confidence scores, while verified campus administrators make the final decision based on confidential verification proofs.

---

## 🏛️ System Architecture

```mermaid
graph TD
    subgraph Client Layer ["🖥️ Frontend (Next.js 16 + TypeScript + Tailwind CSS)"]
        UI_Feed["Campus Feed & Search"]
        UI_Upload["Item Upload (Lost & Found)"]
        UI_Modal["Explainable 5-Weight Match Modal"]
        UI_Claims["Student Claims Portal (/my-claims)"]
        UI_Admin["Admin Verification Queue (/admin)"]
        UI_Notif["In-App Notification Bell & Dropdown"]
    end

    subgraph Backend Layer ["⚙️ Backend REST API (Node.js + Express.js :5000)"]
        AuthRoute["Auth & RBAC (/api/auth)"]
        ItemRoute["Item Reports & Proxy (/api/items)"]
        ClaimRoute["Claim Verification Engine (/api/claims)"]
        NotifRoute["Notification Controller (/api/notifications)"]
        MulterStorage["Secure File Upload (Multer)"]
    end

    subgraph AI Microservice ["🧠 Multimodal AI Matching Service (FastAPI :8001)"]
        OpenCLIP["OpenCLIP ViT-B-32 (512-dim L2 Normalized)"]
        SBERT["Sentence Transformers all-MiniLM-L6-v2 (384-dim)"]
        MatchingEngine["5-Modality Weighted Scorer & Dynamic Re-normalization"]
        ExplainEngine["Explainability & Contributing Factors Generator"]
    end

    subgraph Data Layer ["💾 Persistent Storage (MongoDB)"]
        DB_Users[("Users Collection (bcrypt hashes)")]
        DB_Items[("ItemReports Collection (+secretVerificationDetail)")]
        DB_Claims[("Claims Collection (Proof & Review Notes)")]
        DB_Notifs[("Notifications Collection (Alerts & Read Status)")]
    end

    UI_Feed --> ItemRoute
    UI_Upload --> MulterStorage --> ItemRoute
    UI_Modal --> ItemRoute --> MatchingEngine
    UI_Claims --> ClaimRoute
    UI_Admin --> ClaimRoute
    UI_Notif --> NotifRoute

    ItemRoute --> DB_Items
    AuthRoute --> DB_Users
    ClaimRoute --> DB_Claims
    NotifRoute --> DB_Notifs

    ItemRoute -.->|HTTP Proxy| AI Microservice
    MatchingEngine --> OpenCLIP
    MatchingEngine --> SBERT
    ClaimRoute -.->|Trigger Alert| DB_Notifs
    ItemRoute -.->|Trigger Match Alert (>= 70%)| DB_Notifs
```

---

## 📅 5-Day Milestone Roadmap (100% Completed)

- [x] **Day 1: Project Setup & Responsive Multimodal Item Upload Form**
  - Next.js 16 App Router with TypeScript & Tailwind CSS v4.
  - Interactive Lost / Found item submission form with instant image upload preview.
  - Spatiotemporal input fields (campus zones, buildings, dates, times).
  - Feature-level attribute tagging (categories, colors, brands, unique marks).
- [x] **Day 2: Backend API & MongoDB Database Integration**
  - Node.js & Express REST API server running on port 5000.
  - MongoDB `ItemReport` schema with strict privacy (`secretVerificationDetail` is never exposed publicly).
  - Multer multipart/form-data image upload (5MB limits, MIME whitelisting, UUID filenames).
  - REST endpoints: `POST /api/items`, `GET /api/items`, `GET /api/items/:id`, `GET /api/health`.
  - Frontend integration with live feed, dynamic filters, and offline retry states.
- [x] **Day 3: Multimodal AI Service & Explainable Matching Engine (FastAPI)**
  - Python FastAPI microservice on port 8001 (`/health`, `/api/embed`, `/api/match`).
  - OpenCLIP `ViT-B-32` image embeddings (512-dim, L2-normalized) with path traversal guards.
  - Sentence Transformers `all-MiniLM-L6-v2` semantic text embeddings (384-dim, L2-normalized).
  - 5-weight formula (0.40 Visual, 0.25 Text, 0.15 Location, 0.10 Time, 0.10 Attribute).
  - Dynamic weight re-normalization when modalities are missing ($W'_m = W_m / \sum W_{\text{available}}$).
  - Express proxy bridge (`GET /api/items/:id/matches`).
  - Frontend Explainable Matches Modal with 5-bar similarity breakdown and human-in-the-loop warning.
- [x] **Day 4: Authentication, Role Management & Ownership Claim System**
  - Express authentication with bcrypt password hashing (10 salt rounds) and signed JWT tokens (7-day validity).
  - Role-Based Access Control (`student` vs `admin`) with zero public role escalation (403 Forbidden).
  - Ownership claims lifecycle (`pending` -> `approved` / `rejected`) for found items.
  - Confidential verification answer and distinguishing proof submitted by claimants.
  - Protected endpoints: `POST /api/claims`, `GET /api/claims/my-claims`, `GET /api/claims` (admin), `PATCH /api/claims/:id/status` (admin).
  - Item status updates to `claimed` upon approval; automatic rejection of competing claims.
  - Frontend Student Dashboard (`/my-claims`) and Admin Verification Portal (`/admin`).
- [x] **Day 5: AI Evaluation, Match Notifications, System Polish & Showcase Readiness**
  - Labeled benchmark evaluation dataset (30 campus loss/found scenarios: 15 true matches, 15 distractors).
  - Evaluation of baseline weights vs. empirical grid search optimization (715 candidate configurations).
  - Threshold sensitivity analysis: Empirically determined $\ge 70\%$ as the optimal high-confidence match alert threshold (93.8% precision, 100% recall).
  - Persistent MongoDB In-App Notification System (`/api/notifications`) with real-time unread badges, deduplication, and ownership security.
  - Automated triggers: High-confidence match alerts, claim approval notices, and competing claim closure notifications.
  - UI/UX polish with responsive bell icon, popover dropdown, offline AI service graceful fallback with retry.
  - 100% passing automated test suites across AI, Backend, and Frontend.

---

## 📊 AI Evaluation & Empirical Benchmark Results

### 1. Benchmark Dataset
We established a campus-representative ground-truth benchmark dataset located at [`ai-service/tests/evaluate_matcher.py`](ai-service/tests/evaluate_matcher.py) and [`ai-service/tests/evaluation_results.json`](ai-service/tests/evaluation_results.json):
- **30 Scenario Pairs**: 15 True Positive item matches (cross-angled electronics, text-described bottles, student backpacks, keys) and 15 Hard Negative distractors (same category but different brand/color, differing campus locations, different timeframes).

### 2. Decision Threshold ($\tau$) Sensitivity Analysis
Evaluating the baseline weight vector across multiple decision thresholds demonstrates the trade-off between recall and false alarm rate:

| Threshold ($\tau$) | Precision | Recall | F1-Score | True Positives | False Positives | False Negatives | True Negatives | Evaluation Verdict |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **0.45** | 57.69% | 100.00% | 73.17% | 15 / 15 | 11 | 0 | 4 / 15 | Overly permissive; high false alarms |
| **0.50** | 60.00% | 100.00% | 75.00% | 15 / 15 | 10 | 0 | 5 / 15 | High false alarm rate |
| **0.60** | 65.22% | 100.00% | 78.95% | 15 / 15 | 8 | 0 | 7 / 15 | Balanced exploratory search |
| **0.65** | 88.24% | 100.00% | 93.75% | 15 / 15 | 2 | 0 | 13 / 15 | High quality candidate filter |
| **0.70** | **93.75%** | **100.00%** | **96.77%** | **15 / 15** | **1** | **0** | **14 / 15** | **Optimal Threshold for Automated In-App Alerts** |

> [!NOTE]
> Based on this empirical evaluation, **70.0%** was selected as the system's operational threshold for generating automated in-app match alerts (`match_alert`), maintaining **100% recall** while dropping false positive notifications to a single edge-case.

### 3. Grid Search Weight Tuning
We executed an empirical simplex grid search ($step=0.05$, 715 valid configurations) with a train/validation split (Seed 42):

- **Baseline Weights**: `{'visual': 0.40, 'textual': 0.25, 'location': 0.15, 'time': 0.10, 'attribute': 0.10}`
  - Validation F1: **75.00%** | Full Dataset F1: **78.95%**
- **Empirical Tuned Weights**: `{'visual': 0.20, 'textual': 0.40, 'location': 0.10, 'time': 0.05, 'attribute': 0.25}`
  - Validation F1: **85.71%** | Full Dataset F1: **90.91%**

*Insight: In real university lost-and-found datasets, students often provide rich textual descriptions and specific physical attribute details (colors, brand, stickers) that out-weigh single-angle photographs with lighting variance.*

---

## 🔔 In-App Match Notification System

- **Persistent Model (`Notification.js`)**:
  - `userId`: Target recipient (strict ownership).
  - `type`: `match_alert` | `claim_approved` | `claim_rejected` | `system`.
  - `title`, `message`: Clear, user-friendly notifications.
  - `relatedItemId`, `relatedClaimId`, `matchScore`: Direct reference objects for rich navigation.
  - `isRead`: Read/unread state tracking.
- **REST API (`/api/notifications`)**:
  - `GET /api/notifications`: Fetches user notifications with `unreadCount` and pagination.
  - `PATCH /api/notifications/:id/read`: Marks single notification as read with strict user ownership isolation (User A cannot mark User B's notification).
  - `PATCH /api/notifications/read-all`: Marks all user's notifications as read in one click.
- **Deduplication Safeguard**: Prevents duplicate notification spam for the same lost/found item pair using compound indexing and pre-query verification.
- **Frontend Notification Center (`NotificationBell.tsx`)**:
  - Top navigation bell icon with live unread badge count.
  - Animated dropdown popover displaying recent notifications with relative timestamps.
  - Color-coded icons per alert type (Sparkles for AI matches, Check for approval, Info for rejection).
  - One-click "Mark all as read" button.
  - Background polling every 30 seconds for non-intrusive updates.

---

## 🛡️ Offline AI Graceful Fallback & Resilience

When the FastAPI AI microservice is offline, restarting, or unreachable:
1. The Express proxy catches the network error and returns a clean HTTP 503 response.
2. The frontend `MatchesModal` displays a non-alarming, informational banner:
   - *"The AI matching microservice is temporarily offline. Core item reporting, manual searches, and ownership claims remain fully operational."*
3. Includes an interactive **"Retry AI Matching"** button so users can re-attempt once the service comes online.
4. Core campus functionality (Item Uploads, Feed Search, User Auth, and Ownership Claims) continues uninterrupted.

---

## 🚀 Quick Start Guide (3-Terminal Setup)

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Python**: v3.10 to v3.13 (with virtual environment)
- **MongoDB**: Running locally at `mongodb://localhost:27017`

---

### Terminal 1: Backend API Server
```bash
cd d:\my_all_project\FindIt\backend

# 1. Install dependencies
npm install

# 2. Provision initial campus administrator
npm run seed:admin
# Seed credentials: admin@campus.edu / AdminSecure2026!

# 3. Start Express API server
npm run dev
```
*Backend runs on **`http://localhost:5000`** with MongoDB database `findit`.*

---

### Terminal 2: Multimodal AI Microservice
```bash
cd d:\my_all_project\FindIt\ai-service

# 1. Activate virtual environment
.venv\Scripts\activate   # (On Windows) or source .venv/bin/activate (Linux/Mac)

# 2. Start FastAPI server
uvicorn main:app --host 127.0.0.1 --port 8001 --reload
```
*FastAPI microservice runs on **`http://localhost:8001`** (Swagger docs: `/docs`).*

---

### Terminal 3: Next.js Frontend Application
```bash
cd d:\my_all_project\FindIt\frontend

# 1. Install dependencies
npm install

# 2. Start Next.js development server
npm run dev
```
*Frontend runs on **`http://localhost:3000`**.*

---

## 🧪 Comprehensive Automated Test Suites

All tests have been run and verified 100% passing:

```bash
# 1. Run Day 5 Backend & Notifications Test Suite (46 Tests)
cd d:\my_all_project\FindIt\backend
node test-day5.js
# Output: 📊 TEST RESULTS: 46 / 46 TESTS PASSED (100%)

# 2. Run Day 4 Authentication & Claims Test Suite (55 Tests)
node test-day4.js
# Output: 📊 TEST RESULTS: 55 / 55 TESTS PASSED (100%)

# 3. Run AI Service Unit Tests
cd d:\my_all_project\FindIt\ai-service
.venv\Scripts\python.exe tests/test_ai_service.py
# Output: 🎉 ALL AI UNIT TESTS PASSED SUCCESSFULLY!

# 4. Run AI Evaluation Benchmark & Weight Tuning Grid Search
.venv\Scripts\python.exe tests/evaluate_matcher.py
# Output: Evaluation saved to evaluation_results.json

# 5. Verify Frontend Production Build & TypeScript Checking
cd d:\my_all_project\FindIt\frontend
npm run build
# Output: ✓ Compiled successfully. Zero TypeScript or Turbopack errors.
```

---

## 🎬 Live Demonstration Script (Step-by-Step)

Follow this 6-step walkthrough during presentations or project reviews:

1. **User Registration & Login (Student A)**:
   - Open `http://localhost:3000`, click **Register**, and create an account (e.g., `alice@campus.edu`).
   - Notice the role badge confirms **Student** access.
2. **Report a Found Item with Confidential Secret**:
   - Alice clicks **Report an Item** and chooses **Found Item**.
   - Fills in: *Apple AirPods Pro in Student Union*.
   - In the **Secret Verification Detail** field, enters: *"Engraved with initials B.M. and case serial ending in 77X8"*.
   - Submits report. Verify that the confidential secret does NOT appear on the public card.
3. **Student B Files an Ownership Claim**:
   - Log out and log in as `bob@campus.edu`.
   - Locates Alice's found AirPods report and clicks **Claim This Item**.
   - Enters secret answer: *"Initials B.M., serial ending in 77X8"*, and purchase receipt details.
   - Navigates to `/my-claims` to observe the claim in **Pending Review** status.
4. **Admin Cross-Examination & Approval (Human-in-the-Loop)**:
   - Log in as campus administrator: `admin@campus.edu` / `AdminSecure2026!`.
   - Open **Admin Dashboard** (`/admin`).
   - Observe the **Side-by-Side Review**: Finder's secret vs. Claimant's answer.
   - Click **Approve Claim** with staff pickup instructions.
   - Item status transitions to `claimed`.
5. **Real-Time Notification Delivery**:
   - Log back in as `bob@campus.edu`.
   - Notice the **Notification Bell** in the navbar displaying a red unread badge `(1)`.
   - Click the bell to open the dropdown and view the **Claim Approved** notice with pickup instructions.
   - Click to mark as read; badge counter clears.
6. **AI Explainable Multimodal Matching & Match Alerts**:
   - Bob reports a **Lost Item**: *Hydro Flask 32oz Water Bottle in Library*.
   - Click **Find AI Matches (5-Weight)** on the card.
   - The Explainable Matches Modal displays candidate found items with the 5-bar similarity breakdown (Visual, Text, Location, Time, Attribute).
   - High-confidence matches ($\ge 70\%$) automatically dispatch an in-app match alert to the user.

---

## 🔒 Security & Privacy Architecture
- **Cryptographic Password Hashing**: `bcryptjs` with 10 salt rounds; plaintext passwords and hashes never leave the server.
- **Signed Stateless Tokens**: JSON Web Tokens (`HS256`) with strict 7-day expiration and Bearer header enforcement.
- **Strict Role Boundaries**: Public registration is locked to `role: "student"`. Administrator accounts can only be provisioned via offline server scripts.
- **Confidential Verification Protection**: `secretVerificationDetail` is marked `select: false` in Mongoose. It is never returned in public feeds or search endpoints, preventing fraudulent claims.
- **Human-in-the-Loop Policy**: AI calculates similarity scores and explainable breakdowns, but **AI never automatically transfers item ownership**. Campus administrators make all final ownership decisions.
