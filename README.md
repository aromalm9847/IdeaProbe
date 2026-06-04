<div align="center">

# IdeaProbe

**Validate your startup idea in 60 seconds with AI.**

[![Live Demo](https://img.shields.io/badge/Live-idea.iamhashir.com-2563EB?style=for-the-badge&logo=vercel&logoColor=white)](https://idea.iamhashir.com)

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![GPT-4.1](https://img.shields.io/badge/GPT--4.1-412991?logo=openai&logoColor=white)](https://openai.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-111827)](#license)

</div>

---

## Overview

IdeaProbe turns any business idea into a full validation report in under a minute. A pipeline of specialized AI agents analyzes market size, competitors, and innovation gaps, then returns a single score and a clear verdict.

**[→ Try it live at idea.iamhashir.com](https://idea.iamhashir.com)**

## Features

- **AI validation pipeline** — multiple agents covering refining, competitors, innovation, and deep research.
- **Instant scoring** — a 0–100 score with a VALIDATED / PROMISING / RISKY / AVOID verdict.
- **Market intelligence** — competitor pricing, market sizing, and regional comparisons.
- **PDF reports** — download a complete, shareable report.
- **Accounts & history** — sign up to save scans, or continue as a guest.
- **Installable PWA** — works on mobile and installs to the home screen.

## Tech Stack

| Layer | Stack |
|---|---|
| Frontend | React 18 · TypeScript · Vite · TailwindCSS · Zustand |
| Backend | FastAPI · SQLAlchemy (async) · JWT auth |
| AI | OpenAI GPT-4.1 |
| Database | SQLite · PostgreSQL |
| Deploy | Hostinger (web) · Railway (API) |

## Quick Start

```bash
# Backend
cd backend
python -m venv venv
venv\Scripts\activate          # Windows  (source venv/bin/activate on macOS/Linux)
pip install -r requirements.txt
cp .env.example .env           # add your OpenAI API key
uvicorn main:app --reload --port 8000

# Frontend (new terminal)
cd frontend
pnpm install
pnpm dev
```

Open **http://localhost:5173**.

> Requires Python 3.11+, Node 18+, pnpm, and an OpenAI API key with GPT-4.1 access.

## License

MIT
