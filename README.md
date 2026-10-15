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
- [x] **Day 3: Multimodal AI Service & Explainable Matching Engine (FastAPI)**
  - Python FastAPI microservice on port 8000 (`/health`, `/api/embed`, `/api/match`).
  - OpenCLIP `ViT-B-32` image embeddings (512-dim, L2-normalized) with path traversal guards.
  - Sentence Transformers `all-MiniLM-L6-v2` semantic text embeddings (384-dim, L2-normalized).
  - 5-weight formula (0.40 Visual, 0.25 Text, 0.15 Location, 0.10 Time, 0.10 Attribute).
  - Missing modality weight re-normalization: $W'_m = W_m / \sum W_{\text{available}}$.
  - Express proxy bridge (`GET /api/items/:id/matches`).
  - Frontend Explainable Matches Modal with 5-bar similarity breakdown and human-in-the-loop warning.
- [ ] **Day 4: Admin Verification & Claims Dashboard**
  - Claim management and ownership authentication workflow.
  - Human security staff verification against secret details.
- [ ] **Day 5: Dataset, Validation & Weight Grid Search**
  - 300–500 pair benchmark dataset.
  - Grid search evaluation script for Precision@K, Recall@K, and MRR.

---

## 🚀 Quick Start Guide (Day 3: Full Stack + AI)

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

### 3. Start the Backend API (Terminal 1)
1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd d:\my_all_project\FindIt\backend
   npm install
   npm run dev
   ```
   *Express runs on **`http://localhost:5000`** with proxy route `/api/items/:id/matches`.*

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
   uvicorn main:app --host 127.0.0.1 --port 8000 --reload
   ```
   *FastAPI runs on **`http://localhost:8000`** and loads OpenCLIP (`ViT-B-32`) + Sentence Transformers (`all-MiniLM-L6-v2`).*

---

### 5. Start the Next.js Frontend (Terminal 3)
1. Open a **third terminal** and navigate to the `frontend` folder:
   ```bash
   cd d:\my_all_project\FindIt\frontend
   npm install
   npm run dev
   ```
2. Open your browser and navigate to **`http://localhost:3000`**.
   - Browse the campus items list.
   - Click **"Find AI Matches (5-Weight)"** on any Lost item to open the explainable match viewer.

---

## 🧠 Explainable Multimodal Matching Algorithm

FindIt evaluates potential Lost & Found pairs across 5 independent modalities:

$$\text{MatchScore} = \sum_{m \in M_{\text{available}}} W'_m \times S_m$$

### 1. Modality Breakdown
- **Visual Similarity ($W_{\text{vis}} = 0.40$)**: OpenCLIP `ViT-B-32` image embeddings (512-dim cosine similarity).
- **Textual Similarity ($W_{\text{txt}} = 0.25$)**: Sentence Transformers `all-MiniLM-L6-v2` semantic description embeddings (384-dim cosine similarity).
- **Location Proximity ($W_{\text{loc}} = 0.15$)**: Hierarchical campus zone matching (+0.70 same zone, +0.30 landmark overlap).
- **Temporal Proximity ($W_{\text{time}} = 0.10$)**: Exponential decay with rate $\lambda = 0.10$ ($e^{-0.10 \times |\Delta \text{days}|}$).
- **Attribute Overlap ($W_{\text{attr}} = 0.10$)**: Normalized category, brand, and color token intersection.

### 2. Missing Modality Weight Re-normalization
When an item has no photo, the visual modality is omitted and remaining weights dynamically scale up:

$$W'_m = \frac{W_m}{\sum_{k \in M_{\text{available}}} W_k}$$

This guarantees that effective weights always sum to **strictly 1.00 ($100\%$)** regardless of missing photos or descriptions.

### 3. Human-In-The-Loop Safety Guard
The AI matching engine produces **candidate recommendations only**. Campus security staff must authenticate physical possession and secret verification details prior to returning any lost item.

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
