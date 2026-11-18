# GreenGrid v2.0 — AI-Powered E-Waste Intelligence Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![Node 18+](https://img.shields.io/badge/node-18+-green.svg)](https://nodejs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688.svg)](https://fastapi.tiangolo.com/)
[![React 19](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev/)
[![TensorFlow 2.16](https://img.shields.io/badge/TensorFlow-2.16-FF6F00.svg)](https://www.tensorflow.org/)

A production-ready, full-stack e-waste classification and recycling intelligence platform. GreenGrid combines transfer-learned CNNs, generative AI, and live OpenStreetMap data to provide instant e-waste identification, category-specific recycling guidance, certified recycler locations, and an AI-powered recycling assistant.

---

## 🎯 Features

### 🔬 Multi-Model E-Waste Classification
- **Three fine-tuned architectures** via transfer learning on 3,900+ images across 10 categories:
  | Model | Test Accuracy | Parameters | Inference (CPU) | Best For |
  |-------|--------------|------------|-----------------|----------|
  | **EfficientNetB0** | **97.8%** | 5.3M | ~45ms | Production default |
  | ResNet50 | 97.3% | 25.6M | ~65ms | High-accuracy baseline |
  | MobileNetV2 | 94.1% | 3.5M | ~35ms | Edge/mobile deployment |
- **Model comparison endpoint** — run all three models on one image
- **Per-class F1 scores**: Battery 0.99, Keyboard 0.99, Mobile 0.99, Mouse 1.00, PCB 0.95, Player 0.98, Printer 0.99, Television 0.99, Washing Machine 0.99, Microwave 0.94

### 🧠 Explainability & Robustness
- **Grad-CAM attention maps** — visualize which image regions drive predictions
- **Multi-signal Out-of-Distribution (OOD) detection** — combines:
  - Confidence threshold (default 0.5)
  - Prediction entropy (threshold 1.8)
  - Top-2 margin (threshold 0.15)
  - Normalized entropy (threshold 0.85)
- **Honest uncertainty labeling** — "Acceptance not verified" badges on recycler data

### ♻️ Comprehensive Recycling Guide (10 Categories)
Per-category guidance for: **Battery, Keyboard, Microwave, Mobile, Mouse, PCB, Player, Printer, Television, Washing Machine**
- Composition & environmental hazards
- Step-by-step disposal preparation
- Recycling process & recoverable materials
- Reuse, donation, and repair options
- Safety precautions & certified recycler directories (R2, e-Stewards)

### 🗺️ Live Recycling Center Finder
- **OpenStreetMap/Overpass API** — live facility queries with 4 instance fallbacks
- **Nominatim geocoding** — search by address, ZIP, city, or browser location
- **Distance-based sorting** (Haversine formula)
- **Known-chain fallbacks** — Best Buy, Staples, Home Depot, Lowe's, Call2Recycle, Apple, Samsung, Dell, HP, LG, Sony (marked "verify locally")
- **Indian certified recycler directory** — Attero, Ecoreco, GreenScape, TES-AMM, Karo Sambhav, RLG, Cerebra, Namo eWaste, Deshwal, Recycle Karo

### 🤖 AI Recycling Assistant (Gemini 2.5 Flash)
- **Context-aware** — auto-detects category from classification results
- **Knowledge-base fallback** — works offline when API key unavailable
- **Streaming responses** with conversation history
- **Quick-action question chips** for common queries

### 🏗️ Production Architecture
- **Backend**: FastAPI (async), TensorFlow/Keras model caching, Pydantic validation, Uvicorn
- **Frontend**: React 19 + Vite + Tailwind CSS 3 + Framer Motion + React Router 7 + TypeScript
- **Type-safe API contracts** shared via TypeScript interfaces
- **Container-ready** with multi-stage Dockerfile
- **E2E tested** with Playwright

---

## 📁 Repository Structure

```
greengrid-v2/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── main.py            # FastAPI application (all routes, ML logic, knowledge base)
│   │   └── __pycache__/       # (ignored)
│   ├── .env.example           # Environment variable template
│   ├── .env                   # (ignored - contains secrets)
│   └── requirements.txt       # Python dependencies
│
├── frontend/                   # React + Vite frontend
│   ├── src/
│   │   ├── pages/             # Home, Detect, Guide, Chat, About
│   │   ├── components/        # Reusable UI components
│   │   ├── lib/api.ts         # Typed API client (axios)
│   │   ├── hooks/             # Custom React hooks
│   │   ├── stores/            # Zustand state management
│   │   ├── utils/             # Helpers (cn, etc.)
│   │   └── types/             # TypeScript types
│   ├── public/                # Static assets
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js         # Vite config with API proxy
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── .gitignore
│
├── models/                     # Model weights (Git LFS)
│   ├── efficientnetb0_final.keras        # 20 MB
│   ├── mobilenetv2_ewaste_model.keras    # 13 MB
│   └── resnet50_ewaste_model.keras       # 97 MB (Git LFS)
│
├── docker-compose.yml          # Full stack orchestration
├── Dockerfile.backend          # Backend container
├── Dockerfile.frontend         # Frontend container
├── .gitignore                  # Root gitignore
├── .gitattributes              # Git LFS config
└── README.md                   # This file
```

---

## 🚀 Quick Start

### Prerequisites
- **Python 3.10+** (3.11 recommended)
- **Node.js 18+** and npm
- **Git LFS** (`git lfs install`) — required for ResNet50 model (97 MB)
- **Google Gemini API key** (free) — for AI chatbot: [Get key](https://aistudio.google.com/app/apikey)

### 1. Clone & Install Git LFS
```bash
git clone https://github.com/your-username/greengrid-v2.git
cd greengrid-v2
git lfs install
git lfs pull
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

# Run backend (loads models on startup)
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
Backend runs at `http://localhost:8000` — API docs at `http://localhost:8000/docs`

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Run development server (proxies /api to backend)
npm run dev
```
Frontend runs at `http://localhost:5173`

### 4. Verify Installation
| Endpoint | Purpose |
|----------|---------|
| `http://localhost:8000/api/health` | Backend health + model load status |
| `http://localhost:8000/api/models` | List available models |
| `http://localhost:5173` | Full GreenGrid UI |

---

## 🐳 Docker Deployment

### Development (with hot reload)
```bash
docker compose up --build
```
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`

### Production
```bash
# Build images
docker compose -f docker-compose.yml -f docker-compose.prod.yml build

# Run
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Environment Variables for Production
```bash
# Backend
GEMINI_API_KEY=your_key
LOG_LEVEL=INFO
MODEL_BASE_PATH=/app/models

# Frontend (build-time)
VITE_API_BASE_URL=https://your-api-domain.com
```

---

## 📦 Model Files & Git LFS

The three trained models are tracked via **Git LFS** due to file sizes:

| Model | Size | Git LFS |
|-------|------|---------|
| `models/efficientnetb0_final.keras` | 20 MB | ✅ |
| `models/mobilenetv2_ewaste_model.keras` | 13 MB | ✅ |
| `models/resnet50_ewaste_model.keras` | 97 MB | ✅ **Required** |

### If cloning without Git LFS
```bash
# Models will appear as pointer files (130 bytes each)
# Download actual weights:
git lfs pull

# Or manually download from releases:
# https://github.com/your-username/greengrid-v2/releases
```

### Model Training Details
- **Dataset**: 3,900+ images across 10 e-waste categories
- **Split**: 70% train / 15% val / 15% test (stratified)
- **Method**: Transfer learning from ImageNet weights, frozen backbone + 256-unit dense head
- **Epochs**: 15 per model
- **Framework**: TensorFlow/Keras 2.16
- **Input**: 224×224 RGB, model-specific preprocessing (EfficientNet, ResNet50, MobileNetV2)

---

## 🔧 Configuration

### Backend (`.env`)
```bash
# Required
GEMINI_API_KEY=your_gemini_api_key

# Optional
HOST=0.0.0.0
PORT=8000
LOG_LEVEL=INFO
MODEL_BASE_PATH=/absolute/path/to/models  # Default: ./models
```

### Frontend (`vite.config.js` proxy)
```js
server: {
  proxy: {
    '/api': { target: 'http://localhost:8000', changeOrigin: true }
  }
}
```

---

## 🧪 API Reference

### Health & Models
```http
GET /api/health                    # { status, models_loaded, gemini_configured }
GET /api/models                    # List available models with metadata
```

### Classification
```http
POST /api/predict                  # Single model inference
  FormData: file (image), model_id (efficientnetb0|resnet50|mobilenetv2), confidence_threshold

POST /api/predict/compare          # All models comparison
  FormData: file (image), confidence_threshold
```

### Chat
```http
POST /api/chat
  JSON: { message, history[], context_category? }
  → { response, source: "gemini"|"knowledge_base", context_used }
```

### Recycling Guide
```http
GET /api/guide                     # List categories
GET /api/guide/{category}          # Full guide for category
```

### Recycling Centers
```http
POST /api/centers/search           # By address/query
  JSON: { query, radius_km?, waste_type? }

POST /api/centers/nearby           # By GPS coordinates
  JSON: { latitude, longitude, radius_km?, waste_type? }
```

---

## 🧰 Development

### Running Tests
```bash
# Backend (pytest)
cd backend && pytest

# Frontend (Playwright E2E)
cd frontend && npx playwright test
npx playwright show-report
```

### Linting
```bash
# Frontend
cd frontend && npm run lint

# Backend (add ruff/mypy to requirements.txt if desired)
```

### Adding a New Model
1. Place `.keras` file in `models/`
2. Add entry to `MODEL_CONFIGS` in `backend/app/main.py`
3. Add preprocessing function in `get_preprocess_fn()`
4. Update `MODEL_OPTIONS` in `frontend/src/pages/Detect.tsx`
5. Run `git lfs track "models/new_model.keras"` and commit

---

## 📊 Project Metrics

| Metric | Value |
|--------|-------|
| Training images | 3,900+ |
| Test images | 596 (held-out, stratified) |
| Categories | 10 |
| Models | 3 |
| Best test accuracy | 97.8% (EfficientNetB0) |
| API endpoints | 11 |
| Frontend pages | 5 |
| TypeScript coverage | 100% (typed API layer) |
| Test coverage | E2E (Playwright) |

---

## ⚠️ Known Limitations

1. **No persistent database** — all recycling center data is live from OSM or representative fallbacks
2. **Model paths hardcoded** in `main.py:65` — configure via `MODEL_BASE_PATH` env var
3. **Grad-CAM** implemented in backend but not yet exposed in React frontend
4. **No authentication/rate limiting** — add for production deployment
5. **OSM data may be incomplete** — always verify locally before visiting
6. **Gemini API quota limits** — knowledge base fallback activates automatically

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- **Backend**: Black formatter, type hints throughout
- **Frontend**: Oxlint + TypeScript strict mode, Framer Motion for animations
- **Commits**: Conventional commits (`feat:`, `fix:`, `docs:`, `refactor:`)

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

**Academic Use**: This project was developed as a final-year capstone (CSET312) at Bennett University. Educational and research use encouraged with attribution.

---

## 🙏 Acknowledgments

- **TensorFlow/Keras** — model architectures and transfer learning
- **Google Gemini** — generative AI for recycling guidance
- **OpenStreetMap contributors** — recycling facility data (© OSM, ODbL)
- **Nominatim** — geocoding service
- **R2 / e-Stewards** — certified recycler standards
- **EPA / Basel Convention** — e-waste management guidelines

---

## 📬 Contact

**GreenGrid Team** — AI/ML Engineers & Full-Stack Developers
- GitHub: [your-username/greengrid-v2](https://github.com/your-username/greengrid-v2)
- Issues: [GitHub Issues](https://github.com/your-username/greengrid-v2/issues)

---

*Built for real impact, not demos. Every component serves a purpose. Real models. Real APIs. Honest limitations.*