"""
Sovereign Verify — FastAPI entry point
Run: python main.py
  or: python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload
"""

import uvicorn
import sys
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# ── Paths & env ───────────────────────────────────────────────────────────────

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")
sys.path.append(str(BASE_DIR))

# ── Import engine ─────────────────────────────────────────────────────────────

try:
    from verify_engine import router as verify_router, init_models
except ImportError as e:
    print(f"Setup error: {e}")
    sys.exit(1)

# ── Lifespan: load models once at startup ─────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("SOVEREIGN ENGINE STARTING...")
    init_models()
    print("ENGINE READY. Listening on port 8001.")
    yield
    print("ENGINE SHUTDOWN.")

# ── App ───────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="Sovereign Verify Engine",
    version="3.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(verify_router)

# ── Entry point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
    )