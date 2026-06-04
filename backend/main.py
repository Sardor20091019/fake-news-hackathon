"""
Sovereign Verify — FastAPI entry point
Production Run: python main.py
"""

import uvicorn
import sys
import os  # ADDED: To access environment variables
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI
from typing import Dict, Any
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
    # Updated print to reflect dynamic port
    port = os.environ.get("PORT", 8001)
    print(f"ENGINE READY. Listening on port {port}.")
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

# ── Entry point (Production Ready) ───────────────────────────────────────────

if __name__ == "__main__":
    # MODIFIED: Use environment variable for port, default to 8001
    port = int(os.environ.get("PORT", 8001))
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=False,  # MODIFIED: Set to False for production
    )

# ── Helpers ───────────────────────────────────────────────────────────────────

def apply_malicious_intent_override(data: Dict[str, Any]) -> Dict[str, Any]:
    meta_flags = [
        "bypass", "filter", "obfuscated", "unicode",
        "hidden from", "don't show", "secretly"
    ]
    
    is_malicious = False
    if "flagged_phrases" in data:
        for f in data["flagged_phrases"]:
            text_to_check = (f.get("phrase", "") + " " + f.get("reason", "")).lower()
            if any(flag in text_to_check for flag in meta_flags):
                is_malicious = True
                f["severity"] = "danger"
                f["reason"] = f"{f['reason']} (CRITICAL: Intent to bypass detected)"

    if is_malicious:
        data["trust_score"] = min(data.get("trust_score", 100), 10.0)
        data["verdict"] = "MALICIOUS_INTENT"
        
    return data