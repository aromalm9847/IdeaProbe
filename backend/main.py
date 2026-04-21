import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO").upper(),
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)

import models  # noqa: F401 — must import before init_db to register all ORM models
from database import init_db
from routers import scan, leaderboard, mrr, examples, auth, pdf, admin


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(title="IdeaProbe API", version="3.0.0", lifespan=lifespan)  # v3: Auth + PDF + GPT-4.1

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(scan.router, prefix="/api")
app.include_router(leaderboard.router, prefix="/api")
app.include_router(mrr.router, prefix="/api")
app.include_router(examples.router, prefix="/api")
app.include_router(auth.router, prefix="/api")
app.include_router(pdf.router, prefix="/api")
app.include_router(admin.router, prefix="/api")


@app.get("/")
async def root():
    return {"status": "ok", "app": "IdeaProbe API"}

@app.get("/health")
async def health_check():
    return {"status": "ok"}
