# FindIt — Explainable Multimodal Lost and Found Matching System

FindIt is an intelligent, privacy-first, explainable lost-and-found matching platform engineered for universities and metropolitan municipal districts (e.g., Sylhet Metropolitan Network). The platform bridges citizen lost/found reporting with dual-encoder multimodal AI, zero-knowledge ownership verification, and an explainable 5-factor scoring engine.

---

## 🏗️ System Architecture & End-to-End Pipeline

```
  ┌───────────────────────┐
  │ Next.js 14 Frontend   │ (TypeScript, Tailwind, Linear/Vercel Dark UI, Leaflet Maps)
  └──────────┬────────────┘
             │ multipart/form-data (Images, GPS/Zone, Metadata)
             ▼
  ┌───────────────────────┐
  │ Express 4 Backend API │ (Node.js, JWT Auth, Google GIS OAuth, Multer, Nodemailer)
  └─────┬───────────┬─────┘
        │           │
        │           │ HTTP JSON Proxy (Match & Embedding Requests)
        │           ▼
        │    ┌───────────────────────────────┐
        │    │ FastAPI AI Microservice (:8001)│
        │    │ • OpenCLIP (ViT-B/32)         │ -> 512-dim visual embeddings
        │    │ • S-BERT (all-MiniLM-L6-v2)   │ -> 384-dim semantic text embeddings
        │    │ • 5-Factor Explainable Matcher│
        │    └──────────────┬────────────────┘
        │                   │
        ▼                   ▼
  ┌───────────────────────────────────────────┐
  │ MongoDB Database                          │
  │ • Real-time Item Reports                  │
  │ • Persistent Image & Text Vector Caches   │
  │ • Claims & Ground-Truth Feedback Logs     │
  └───────────────────────────────────────────┘
```

---

## 🎯 Verification of Core Criteria

### 1. End-to-End MVP Pipeline
* **Frontend Upload:** [`frontend/src/components/ItemUploadForm.tsx`](frontend/src/components/ItemUploadForm.tsx) captures multi-image uploads, item metadata, Sylhet geographical zones, and secret anti-fraud verification hints.
* **Backend Processing:** [`backend/src/routes/itemRoutes.js`](backend/src/routes/itemRoutes.js) processes file uploads with Cloudinary remote storage (and disk fallback), validates data with Mongoose, and persists to MongoDB.
* **AI Service Dispatch:** Express communicates via asynchronous HTTP with [`ai-service/main.py`](ai-service/main.py) to extract OpenCLIP visual embeddings and Sentence Transformer contextual vectors.
* **MongoDB Storage:** [`backend/src/models/ItemReport.js`](backend/src/models/ItemReport.js) stores items and precomputed dense vectors.

### 2. Validation Dataset & Dynamic Online Tuning
* **Benchmark Dataset:** [`dataset/campus_benchmark_350.json`](dataset/campus_benchmark_350.json) contains **350 ground-truth pairs** (175 positive matches and candidate pools) across electronics, wallets, bags, IDs, books, and keys.
* **Offline Baseline vs Tuned Weights:** Pre-computed and analyzed in [`ai-service/tests/evaluate_ir_metrics.py`](ai-service/tests/evaluate_ir_metrics.py).
* **Live Interactive Tuning Console:** [`frontend/src/components/WeightsModal.tsx`](frontend/src/components/WeightsModal.tsx) allows users and admins to dynamically tune weights (`POST /api/items/weights/tune`) on the fly.
* **Continuous Feedback Loop:** When admins approve/reject claims in [`backend/src/routes/claimRoutes.js`](backend/src/routes/claimRoutes.js), positive/negative match feedback is automatically recorded (`POST /api/weights/feedback`) for closed-loop continuous fine-tuning.

### 3. Rigorous Evaluation Harness
* **Information Retrieval (IR) Metrics:** Evaluated in [`ai-service/tests/evaluate_ir_metrics.py`](ai-service/tests/evaluate_ir_metrics.py):
  * **MRR (Mean Reciprocal Rank):** Top candidate retrieval accuracy.
  * **Recall@1, Recall@3, Recall@5:** Candidate coverage across ranking thresholds.
  * **Precision@k:** Relevance concentration.
* **Test Results:** Recorded in [`ai-service/tests/ir_evaluation_results.json`](ai-service/tests/ir_evaluation_results.json).

### 4. Admin Verification & Explainability
* **Explainable 5-Factor Formulation:**
  $$\text{Score} = W_{\text{img}}(S_{\text{img}}) + W_{\text{txt}}(S_{\text{txt}}) + W_{\text{loc}}(S_{\text{loc}}) + W_{\text{time}}(S_{\text{time}}) + W_{\text{attr}}(S_{\text{attr}})$$
* **Breakdown & Cues:** Every match provides explicit visual cues, S-BERT semantic similarities, landmark overlaps, and shared keyword tokens.
* **Zero-Knowledge Ownership Challenges:** Groq LLM (Llama 3.1) dynamically generates secret anti-fraud questions (`POST /api/items/generate-challenge`).
* **Human-in-the-Loop Safeguard:** AI output is strictly advisory; physical item release is gated behind verified administrative review in [`frontend/src/components/ClaimModal.tsx`](frontend/src/components/ClaimModal.tsx).

### 5. Multi-Layer Cache, Batch & Resilient Fallbacks
* **Multi-Layer Caching:**
  1. *In-Memory LRU Vector Cache:* SHA-256 content-hashed LRU caches (`_IMAGE_CACHE`, `_TEXT_CACHE`) in [`ai-service/src/embeddings.py`](ai-service/src/embeddings.py).
  2. *Short-Term Query Cache:* 30-second TTL in-memory match cache in Express to prevent redundant AI re-queries.
  3. *MongoDB Vector Persistence:* Extracted vectors are cached inside the item document (`imageEmbedding`, `textEmbedding`).
* **Batch Operations:** [`POST /api/batch-embed`](ai-service/main.py) allows bulk generation of dense embeddings for multiple items in a single request.
* **Resilient Multi-Tier Fallbacks:**
  * *No Image Fallback:* Zero-shot text-only semantic matching dynamically re-normalizes weights.
  * *Cloudinary Fallback:* Seamless automatic downgrade to local disk storage if Cloudinary credentials fail.
  * *Groq LLM Fallback:* High-precision heuristic security rule generator activates if Groq API is offline.
  * *Service Degradation Fallback:* Express backend gracefully handles offline FastAPI states with HTTP 503 advisories.

---

## 🚀 Getting Started

### 1. Prerequisites
* **Node.js** (v18+)
* **Python** (v3.10+ with PyTorch, OpenCLIP, Sentence-Transformers)
* **MongoDB** (running locally on port 27017 or remote Atlas URI)

### 2. Environment Setup
```bash
# Backend (.env)
PORT=5000
MONGODB_URI=mongodb://localhost:27017/findit
JWT_SECRET=your_jwt_secret_key
AI_SERVICE_URL=http://localhost:8001
GROQ_API_KEY=your_optional_groq_api_key

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:5000

# AI Service (.env)
PORT=8001
MONGODB_URI=mongodb://localhost:27017/findit
```

### 3. Launching All Services (One-Click)
On Windows:
```cmd
start-all.bat
```
Or start each service independently:
```bash
# Terminal 1 - Backend API (:5000)
cd backend && npm run dev

# Terminal 2 - AI Microservice (:8001)
cd ai-service && .venv\Scripts\python main.py

# Terminal 3 - Frontend UI (:3000)
cd frontend && npm run dev
```

---

## 📜 License
MIT License. Built for university academic evaluation and public sector campus safety initiatives.
