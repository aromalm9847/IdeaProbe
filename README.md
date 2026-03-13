# IdeaProbe — AI Startup Idea Validator

**IdeaProbe** is a full-stack AI-powered startup idea validation platform. Submit any business idea and receive a comprehensive analysis from 4 specialized AI agents in ~60 seconds — covering market sizing (in INR), competitor intelligence, innovation opportunities, and deep research with regional comparisons. Users can sign up for an account or continue as a guest, and registered users can download a full PDF report.

---

## Live Demo

| Service | URL |
|---|---|
| **Frontend** | https://ideaprobe-app.netlify.app |
| **Backend API** | https://backend-production-603e.up.railway.app |
| **API Docs** | https://backend-production-603e.up.railway.app/docs |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 + TypeScript + Vite + TailwindCSS |
| **State Management** | Zustand (with persistence) |
| **Animations** | Framer Motion + GSAP |
| **Charts** | Recharts |
| **Backend** | FastAPI (Python 3.11) + Uvicorn |
| **Database** | SQLite (local) / any SQLAlchemy-compatible DB |
| **AI Engine** | OpenAI GPT-4.1 |
| **Auth** | JWT (python-jose) + bcrypt |
| **PDF Generation** | ReportLab |
| **Deployment** | Netlify (frontend) + Railway (backend) |

---

## Project Structure

```
ideaprobe/
├── README.md
├── start.sh              # One-command startup (Mac/Linux)
├── start.bat             # One-command startup (Windows)
│
├── backend/
│   ├── main.py           # FastAPI app entry point
│   ├── database.py       # SQLAlchemy async engine
│   ├── models.py         # ORM models (User, Scan, Leaderboard, MRR)
│   ├── schemas.py        # Pydantic request/response schemas
│   ├── requirements.txt  # Python dependencies
│   ├── .env.example      # Environment variable template
│   │
│   ├── routers/
│   │   ├── scan.py            # POST /api/scan, GET /api/scan/{id}
│   │   ├── auth.py            # Register, login, me endpoints
│   │   ├── pdf.py             # GET /api/pdf/{scan_id}
│   │   ├── leaderboard.py
│   │   ├── mrr.py
│   │   └── examples.py
│   │
│   └── services/
│       ├── ai_client.py           # Shared OpenAI GPT-4.1 client
│       ├── pipeline.py            # 4-agent orchestration pipeline
│       ├── agent_refining.py      # Refining Agent
│       ├── agent_competitors.py   # Competitors Agent
│       ├── agent_innovation.py    # Innovation Agent
│       ├── agent_deep_research.py # Deep Research Agent
│       ├── auth_service.py        # JWT + password hashing
│       ├── scoring.py             # Idea scoring algorithm
│       ├── reddit_service.py      # Reddit signal scraping
│       ├── trends_service.py      # Google Trends data
│       └── web_search_service.py  # DuckDuckGo web search
│
└── frontend/
    ├── src/
    │   ├── App.tsx               # Router + AuthModal
    │   ├── main.tsx              # Entry point
    │   ├── index.css             # Premium CSS with glassmorphism
    │   ├── api/client.ts         # Axios API client
    │   ├── store/
    │   │   ├── authStore.ts      # Auth state (Zustand + persist)
    │   │   └── useScanStore.ts   # Scan state
    │   ├── types/index.ts        # TypeScript types
    │   ├── components/
    │   │   ├── auth/AuthModal.tsx        # Login/Register/Guest modal
    │   │   ├── layout/Navbar.tsx         # Premium glassmorphism navbar
    │   │   ├── scanner/ReportView.tsx    # Full report with PDF download
    │   │   └── landing/Hero.tsx          # Animated hero section
    │   └── pages/
    │       ├── Landing.tsx
    │       ├── ScannerPage.tsx
    │       ├── MRREstimator.tsx
    │       ├── Examples.tsx
    │       └── About.tsx
    ├── package.json
    ├── vite.config.ts    # Dev proxy: /api -> localhost:8000
    ├── tailwind.config.js
    └── .env.example      # Frontend environment template
```

---

## Prerequisites

Before running locally, ensure you have the following installed:

| Tool | Version | Download |
|---|---|---|
| **Python** | 3.11 or higher | https://python.org/downloads |
| **Node.js** | 18 or higher | https://nodejs.org |
| **pnpm** | Latest | `npm install -g pnpm` |
| **VS Code** | Latest | https://code.visualstudio.com |

You also need an **OpenAI API key** (GPT-4.1 access required). Go to https://platform.openai.com/api-keys, click **"Create new secret key"**, and copy the key.

---

## Local Setup (Step by Step)

### Step 1 — Extract the Project

Extract the zip file to a folder, e.g. `C:\Projects\ideaprobe` or `~/Projects/ideaprobe`.

Open the folder in VS Code:

```bash
code ideaprobe
```

### Step 2 — Backend Setup

Open a terminal in VS Code (`Ctrl+`` ` or `Terminal > New Terminal`).

```bash
# Navigate to the backend folder
cd backend

# Create a Python virtual environment
python3 -m venv venv

# Activate the virtual environment
# On Mac/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install all Python dependencies
pip install -r requirements.txt
```

### Step 3 — Configure Backend Environment Variables

```bash
# Copy the example env file
cp .env.example .env
```

Open `backend/.env` in VS Code and fill in your values:

```env
# Required
IDEAPROBE_OPENAI_KEY=sk-proj-YOUR_OPENAI_API_KEY_HERE

# Optional - improves Reddit signal data
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
REDDIT_USER_AGENT=IdeaProbe/1.0

# Security - change this in production!
JWT_SECRET_KEY=your-super-secret-jwt-key-change-this

# Database - SQLite by default, no setup needed
# DATABASE_URL=sqlite+aiosqlite:///./ideaprobe.db

# AI Model - default is gpt-4.1
# IDEAPROBE_MODEL=gpt-4.1
```

> **Only `IDEAPROBE_OPENAI_KEY` is required to run the app locally.**

### Step 4 — Start the Backend

```bash
# Make sure you are in the backend/ folder with venv activated
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

You should see:

```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

Visit http://localhost:8000/docs for interactive API documentation.

### Step 5 — Frontend Setup

Open a **second terminal** in VS Code (click the `+` button in the terminal panel).

```bash
cd frontend
pnpm install
```

### Step 6 — Configure Frontend Environment Variables

```bash
cp .env.example .env
```

Open `frontend/.env` and set:

```env
VITE_API_BASE_URL=http://localhost:8000
```

> The Vite dev server already proxies `/api` requests to `localhost:8000` automatically via `vite.config.ts`, so this is mainly needed for production builds.

### Step 7 — Start the Frontend

```bash
pnpm dev
```

You should see:

```
  VITE v5.x.x  ready in 500ms
  Local:   http://localhost:5173/
```

### Step 8 — Open the App

Go to **http://localhost:5173** in your browser. Enter any startup idea and click **"Scan idea"** to test.

---

## One-Command Startup (Alternative)

After completing Step 3 (`.env` setup), use the startup scripts:

**Mac / Linux:**

```bash
chmod +x start.sh
./start.sh
```

**Windows:**

```
start.bat
```

---

## VS Code Recommended Extensions

| Extension | ID | Purpose |
|---|---|---|
| Python | `ms-python.python` | Python IntelliSense and debugging |
| Pylance | `ms-python.vscode-pylance` | Type checking for Python |
| ESLint | `dbaeumer.vscode-eslint` | TypeScript linting |
| Tailwind CSS IntelliSense | `bradlc.vscode-tailwindcss` | Tailwind class autocomplete |
| Prettier | `esbenp.prettier-vscode` | Code formatting |
| REST Client | `humao.rest-client` | Test API endpoints in VS Code |

---

## Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `IDEAPROBE_OPENAI_KEY` | **Yes** | — | Your OpenAI API key (GPT-4.1 required) |
| `IDEAPROBE_MODEL` | No | `gpt-4.1` | OpenAI model to use |
| `JWT_SECRET_KEY` | No | `ideaprobe-super-secret...` | JWT signing secret — change in production |
| `DATABASE_URL` | No | `sqlite+aiosqlite:///./ideaprobe.db` | Database connection string |
| `REDDIT_CLIENT_ID` | No | `""` | Reddit API client ID |
| `REDDIT_CLIENT_SECRET` | No | `""` | Reddit API client secret |
| `REDDIT_USER_AGENT` | No | `IdeaProbe/1.0` | Reddit API user agent |

### Frontend (`frontend/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_API_BASE_URL` | No | `http://localhost:8000` | Backend API base URL |

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/scan` | None | Submit a new idea for analysis |
| `GET` | `/api/scan/{id}` | None | Poll scan status and get results |
| `GET` | `/api/pdf/{id}` | Login required | Download PDF report for a scan |
| `POST` | `/api/auth/register` | None | Create a new user account |
| `POST` | `/api/auth/login` | None | Sign in and receive JWT token |
| `GET` | `/api/auth/me` | Bearer JWT | Get current user profile |
| `GET` | `/api/leaderboard` | None | Top-scored ideas this week |
| `GET` | `/api/examples` | None | Pre-built example reports |
| `POST` | `/api/mrr/estimate` | None | MRR estimator tool |

---

## How the 4-Agent Pipeline Works

When you submit an idea, the backend runs 4 AI agents using GPT-4.1:

1. **Refining Agent** — Polishes the idea, identifies target market, sizes the market in INR, provides feasibility snapshot with confidence rating and source URL.
2. **Competitors Agent** — Finds 5-7 real competitors (global and Indian) with accurate INR pricing, traffic data, strengths, weaknesses, and opportunity gaps.
3. **Innovation Agent** — Suggests 3-5 differentiator features with feasibility and impact ratings (1-10), rationale, and source URLs.
4. **Deep Research Agent** — Comprehensive research from 5+ diverse sources (2023-2025) with datasets, charts, and a regional comparison (India vs global markets).

All agents run sequentially. Results are combined into a score (0-100) and a final verdict: VALIDATED / PROMISING / RISKY / AVOID.

---

## Getting Reddit API Keys (Optional)

Reddit API keys improve signal quality. Without them, the app uses simulated data.

1. Go to https://www.reddit.com/prefs/apps
2. Click **"Create App"** at the bottom
3. Select **"script"** type, name it `IdeaProbe`, redirect URI: `http://localhost:8000`
4. Copy the **client ID** (below the app name) and **client secret**
5. Add them to `backend/.env`

---

## Deployment Guide

### Deploy Backend to Railway

**Step 1 — Install Railway CLI:**

```bash
npm install -g @railway/cli
railway login
```

**Step 2 — Initialize and deploy:**

```bash
cd backend
railway init
railway up
```

**Step 3 — Set environment variables in Railway dashboard:**

Go to your project > Variables tab and add:

```
IDEAPROBE_OPENAI_KEY=sk-proj-...
JWT_SECRET_KEY=your-strong-random-secret
IDEAPROBE_MODEL=gpt-4.1
```

Copy the generated Railway URL (e.g. `https://your-app.up.railway.app`).

---

### Deploy Frontend to Netlify

**Step 1 — Update `frontend/.env` with your Railway backend URL:**

```env
VITE_API_BASE_URL=https://your-app.up.railway.app
```

**Step 2 — Build and deploy:**

```bash
cd frontend
pnpm build
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=dist
```

Or drag and drop the `dist/` folder at https://app.netlify.com.

**Step 3 — Set Netlify environment variable:**

Go to Site > Site configuration > Environment variables and add:

```
VITE_API_BASE_URL=https://your-railway-backend.up.railway.app
```

---

## Common Issues and Fixes

| Issue | Cause | Fix |
|---|---|---|
| `ValueError: OpenAI API key not found` | Missing `.env` or key not set | Copy `.env.example` to `.env` and add your key |
| `ModuleNotFoundError` | Dependencies not installed | Run `pip install -r requirements.txt` with venv activated |
| `pnpm: command not found` | pnpm not installed | Run `npm install -g pnpm` |
| Frontend shows blank page | Build error or wrong API URL | Check browser console; verify `VITE_API_BASE_URL` |
| `CORS error` in browser | Backend not running | Ensure backend is running on port 8000 |
| PDF download fails | Scan not complete | Wait for scan status to be `complete` |
| `401 Unauthorized` on PDF | Not logged in | Sign in or register before downloading PDF |
| Scan takes too long | GPT-4.1 API latency | Normal — 4 AI agents run per scan (15-60s total) |
| `sqlite3.OperationalError` | Database file locked | Stop all backend instances and restart |

---

## Development Tips

```bash
# Run backend with auto-reload
uvicorn main:app --reload --port 8000

# View API docs
open http://localhost:8000/docs

# Test a scan via curl
curl -X POST http://localhost:8000/api/scan \
  -H "Content-Type: application/json" \
  -d '{"idea_text": "AI meal planner for Indian households"}'

# Check scan status
curl http://localhost:8000/api/scan/1

# Download PDF (requires completed scan)
curl http://localhost:8000/api/pdf/1 --output report.pdf
```

---

## License

MIT — built for founders who validate before they build.
