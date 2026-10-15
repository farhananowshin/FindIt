# 🔍 FindIt — Explainable Multimodal Lost and Found Matching System

FindIt is an intelligent, explainable matching system designed for university campuses. It pairs lost item reports with found items using multimodal artificial intelligence (Visual Similarity via CLIP + Semantic Text Similarity via Sentence Transformers) combined with spatiotemporal and attribute matching.

---

## 🏛️ System Architecture

```
FindIt/
├── frontend/             # Next.js (TypeScript, Tailwind CSS, Lucide Icons)
├── backend/              # Node.js + Express.js REST API (Coming in Day 2)
├── ai-service/           # Python + FastAPI (CLIP & Sentence Transformers) (Coming in Day 3)
├── dataset/              # Benchmark dataset & evaluation tools (Coming in Day 5)
└── README.md             # Project documentation & instructions
```

---

## 📅 Roadmap Overview

- [x] **Day 1: Project Setup & Responsive Lost/Found Upload Form**
  - Next.js 14+ App Router with TypeScript & Tailwind CSS.
  - Interactive Lost / Found item submission form with image upload preview.
  - Spatiotemporal input fields (campus locations, dates, landmarks).
  - Feature-level attribute tagging (colors, unique marks, verification hints).
- [ ] **Day 2: Backend API & MongoDB Database**
  - Node.js & Express server.
  - MongoDB models for Item reports, User authentication, and claims.
  - Image file handling (Multer) & REST endpoints.
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

## 🚀 Getting Started (Day 1 - Frontend)

### Prerequisites
- **Node.js**: v18.0.0 or higher (Current: v24.18.0)
- **npm**: v9.0.0 or higher

### Running the Frontend
1. Open PowerShell or your terminal.
2. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
3. Install dependencies (if not already installed):
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```
