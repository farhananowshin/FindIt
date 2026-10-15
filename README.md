# 🔍 FindIt — Explainable Multimodal Lost and Found Matching System

FindIt is an intelligent, explainable matching system designed for university campuses. It pairs lost item reports with found items using multimodal artificial intelligence (Visual Similarity via CLIP + Semantic Text Similarity via Sentence Transformers) combined with spatiotemporal and attribute matching.

---

## 🏛️ System Architecture

```
FindIt/
├── frontend/             # Next.js 16 (TypeScript, Tailwind CSS v4, Lucide Icons)
├── backend/              # Node.js + Express.js REST API + MongoDB Mongoose (Day 2 Completed)
│   ├── src/
│   │   ├── config/db.js        # MongoDB connection manager
│   │   ├── models/ItemReport.js# Mongoose schema with privacy protection
│   │   ├── routes/itemRoutes.js# REST endpoints (POST, GET items)
│   │   └── middleware/upload.js# Multer image upload security
│   ├── uploads/          # Static file storage for item photos
│   ├── server.js         # Express app entrypoint & health checks
│   └── test-backend.js   # Automated test suite (22 tests)
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
- [ ] **Day 3: Multimodal AI Service (FastAPI)**
  - OpenCLIP visual embedding pipeline.
  - Sentence Transformers semantic text representation.
  - Weighted matching algorithm (0.40 Visual, 0.25 Semantic, 0.15 Location, 0.10 Time, 0.10 Attributes).
- [ ] **Day 4: Admin Verification & Explainability UI**
  - Match score breakdown & transparent explanation cards.
  - Human-in-the-loop admin verification dashboard.
- [ ] **Day 5: Dataset, Validation & Weight Grid Search**
  - 300–500 pair benchmark dataset.
  - Grid search evaluation script for Precision@K, Recall@K, and MRR.

---

## 🚀 Quick Start Guide (Day 2)

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (Installed: `v24.18.0`)
- **npm**: v9.0.0 or higher
- **MongoDB**: A running local MongoDB instance (`mongodb://localhost:27017`) or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) connection URI.

---

### 2. Verify MongoDB is Running
On Windows, MongoDB runs as a background service. To check its status:
1. Open PowerShell and run:
   ```powershell
   Get-Service -Name MongoDB
   ```
2. If the status says `Stopped`, start it with:
   ```powershell
   Start-Service -Name MongoDB
   ```
> [!NOTE]
> If you are using a cloud MongoDB Atlas database, simply set `MONGODB_URI` in `backend/.env` to your Atlas connection string (e.g., `mongodb+srv://user:pass@cluster.mongodb.net/findit?retryWrites=true&w=majority`).

---

### 3. Start the Backend API (Terminal 1)
1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd d:\my_all_project\FindIt\backend
   ```
2. Install backend dependencies (if not already installed):
   ```bash
   npm install
   ```
3. Start the Express backend:
   ```bash
   npm run dev
   ```
   *The backend will start on **`http://localhost:5000`** and log:*
   ```
   🚀 [FindIt Server] Backend running on http://localhost:5000
   📡 [FindIt Health] Healthcheck endpoint: http://localhost:5000/api/health
   ✅ [MongoDB] Connected successfully to host: localhost
   ```

---

### 4. Start the Frontend Application (Terminal 2)
1. Open a **second terminal** and navigate to the `frontend` folder:
   ```bash
   cd d:\my_all_project\FindIt\frontend
   ```
2. Install frontend dependencies (if not already installed):
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

---

## 🧪 Testing the API Endpoints

You can verify the backend endpoints at any time using your browser or terminal:

### 1. Healthcheck
- **URL**: `http://localhost:5000/api/health`
- **Expected Response**:
  ```json
  {
    "status": "ok",
    "uptime": 120,
    "service": "FindIt Backend API",
    "database": {
      "status": "connected",
      "name": "findit"
    }
  }
  ```

### 2. Fetch All Items
- **URL**: `http://localhost:5000/api/items`
- **Supported Query Filters**:
  - Filter by lost items: `http://localhost:5000/api/items?type=lost`
  - Filter by found items: `http://localhost:5000/api/items?type=found`
  - Filter by category: `http://localhost:5000/api/items?category=electronics`

### 3. Run the Automated Test Suite
From the `backend` directory, run:
```bash
node test-backend.js
```
*Runs 22 comprehensive tests covering validation, creation, queries, filters, and privacy safeguards.*

---

## 🔒 Security & Privacy Notice (Day 2)
- **Zero Public Leakage**: The field `secretVerificationDetail` is configured with `select: false` in Mongoose and is stripped from all public responses.
- **Upload Guards**: Multer enforces strict MIME-type whitelisting (`image/jpeg`, `image/png`, `image/webp`), 5MB maximum file sizes, and generates random UUID filenames to prevent path traversal attacks.
- **Development Limitations**: Uploaded images are stored locally in `backend/uploads/`. In production, this can be transitioned to cloud object storage (e.g. AWS S3 or Cloudinary).
