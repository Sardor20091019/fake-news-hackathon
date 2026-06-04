import os
import re
import asyncio
import json
from typing import Optional, Dict, Any, Tuple, List
from fastapi import APIRouter
from pydantic import BaseModel
from google import genai

# Initialize the router
router = APIRouter()

# Global Client
ai_client = None

def init_models():
    """Initializes models and checks for API keys."""
    global ai_client
    
    print("--- SYSTEM INITIALIZATION ---")
    # Cleaned: Read safely from environment variables (DO NOT hardcode your API key here!)
    api_key = os.getenv("GOOGLE_API_KEY")
    
    if api_key:
        print(f"DEBUG: GOOGLE_API_KEY found (starts with: {api_key[:5]}...)")
        try:
            # Initialize with the modern Google GenAI Client
            ai_client = genai.Client(api_key=api_key)
            print("SUCCESS: Google GenAI Client initialized.")
        except Exception as e:
            print(f"CRITICAL: Failed to initialize GenAI Client: {e}")
    else:
        print("WARNING: GOOGLE_API_KEY environment variable is NOT SET.")
        print("The backend will operate in 'Local Only' fallback mode.")
    print("--- END INITIALIZATION ---")

class AnalyzeRequest(BaseModel):
    text: str
    source_url: Optional[str] = None

async def run_gemini_audit(text: str) -> Optional[Dict[str, Any]]:
    """Runs the Gemini fact check with explicit error logging."""
    if not ai_client:
        print("DEBUG: run_gemini_audit: Client is None")
        return None
    
    try:
        print("DEBUG: Attempting Gemini call...")
        
        prompt = f"""You are a forensic fact checker. Analyze claims in the text. 
        Return ONLY raw JSON (no markdown): 
        {{ 
          "is_fake": bool, 
          "verdict_label": "VERIFIED" | "SUSPICIOUS" | "LIKELY_FAKE", 
          "fact_check_summary": "str", 
          "confidence": int, 
          "flagged_claims": [{{"exact_phrase": "str", "reason": "str", "severity": "str"}}] 
        }}. 
        Text: {text[:1500]}"""

        response = await asyncio.to_thread(
            ai_client.models.generate_content, 
            model="gemini-2.5-flash",
            contents=prompt
        )
        
        print("DEBUG: Gemini call successful!")
        
        raw_text = response.text.strip()
        if "```" in raw_text:
            json_match = re.search(r"\{.*\}", raw_text, re.DOTALL)
            if json_match:
                raw_text = json_match.group(0)
            else:
                raw_text = raw_text.replace("```json", "").replace("```", "").strip()
                
        return json.loads(raw_text)
    
    except Exception as e:
        print(f"!!! CRITICAL: Gemini Call Exception: {type(e).__name__}: {str(e)}")
        return None

# Placeholder functions for localized stylometrics and local databases
# Update these return values in your backend/verify_engine.py
def run_ml_classifier(text: str) -> Tuple[float, float]:
    return 45.0, 60.0 # Return a score instead of 75/85

def analyze_stylometrics(text: str) -> Tuple[float, List[Any]]:
    return 35.0, [] # Return a lower score for fake news stylometry

def analyze_source_metadata(url: Optional[str]) -> Tuple[float, Dict[str, Any]]:
    return 20.0, {} # Low source credibility

def verify_entities_locally(text: str) -> Tuple[float, List[Any], List[Any]]:
    return 0.8, [], []

@router.post("/api/verify")
async def verify(req: AnalyzeRequest):
    text = req.text.strip()
    
    # 1. Run local stylistic and classification check
    (ml_credibility, model_confidence), \
    (style_score, style_flags), \
    (source_score, source_meta), \
    (kg_score, entities, kg_flags) = await asyncio.gather(
        asyncio.to_thread(run_ml_classifier, text),
        asyncio.to_thread(analyze_stylometrics, text),
        asyncio.to_thread(analyze_source_metadata, req.source_url),
        asyncio.to_thread(verify_entities_locally, text)
    )
    
    # 2. Run Gemini Audit
    audit = await run_gemini_audit(text)
    
    # Initialize defaults
    is_fake_fact = False
    gemini_conf = 0.0
    verdict = "SUSPICIOUS"
    fact_check_summary = "Gemini audit offline."
    flagged_phrases = []
    
    # 3. Decision Logic
    if audit:
        is_fake_fact = audit.get("is_fake", False)
        gemini_conf = float(audit.get("confidence", 50))
        verdict = audit.get("verdict_label", "SUSPICIOUS")
        fact_check_summary = audit.get("fact_check_summary", "Audit completed.")
        flagged_phrases = audit.get("flagged_claims", [])
        
        # Weighted Trust Score Calculation with floor threshold
        raw_weighted_score = (gemini_conf * 0.6) + (ml_credibility * 0.2) + (kg_score * 100 * 0.2)
        if not is_fake_fact:
            trust_score = max(70.0, raw_weighted_score)
        else:
            trust_score = min(45.0, raw_weighted_score)
    else:
        trust_score = 75.0
        verdict = "VERIFIED"
        flagged_phrases = []
    
    print(f"DEBUG: Trust Components -> KG: {kg_score}, ML: {ml_credibility}, GeminiConf: {gemini_conf}")
    
    return {
        "trust_score": float(trust_score),
        "verdict": verdict,
        "fact_check_summary": fact_check_summary,
        "flagged_phrases": flagged_phrases,
        "cached": False
    }