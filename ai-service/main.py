import logging
from contextlib import asynccontextmanager
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

import numpy as np

from src.config import PORT, HOST, DEFAULT_TOP_K, MAX_TOP_K, INITIAL_WEIGHTS, CURRENT_WEIGHTS
from src.models_loader import get_model_manager
from src.embeddings import (
    generate_image_embedding,
    generate_text_embedding,
    get_cache_stats,
    clear_all_caches,
)
from src.matcher import calculate_match
from src.database import (
    check_db_health,
    find_item_by_id,
    find_active_found_candidates,
    update_item_embeddings,
    record_match_feedback,
    get_feedback_stats,
)

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("findit.api")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan event handler: loads pretrained AI models at startup
    and verifies database connection.
    """
    logger.info("Initializing FindIt AI Service...")
    mgr = get_model_manager()
    mgr.load_all()

    db_health = check_db_health()
    logger.info(f"MongoDB connection on startup: {db_health.get('status')}")

    status = mgr.get_status()
    if status["all_ready"]:
        logger.info("All multimodal models (OpenCLIP + S-BERT) are loaded and ready.")
    else:
        logger.warning(f"Some models failed to load: {status}")

    yield

    logger.info("Shutting down FindIt AI Service...")

app = FastAPI(
    title="FindIt Multimodal AI Service",
    description="Explainable Multimodal Lost and Found Matching Engine (OpenCLIP + Sentence Transformers)",
    version="1.0.0",
    lifespan=lifespan,
)

# Enable CORS for frontend and backend proxy
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request & Response Schemas
class EmbedRequest(BaseModel):
    title: str = Field(..., min_length=2)
    description: Optional[str] = ""
    category: Optional[str] = "other"
    brand: Optional[str] = ""
    primaryColor: Optional[str] = ""
    secondaryColor: Optional[str] = ""
    uniqueMarks: Optional[str] = ""
    imagePath: Optional[str] = None
    imageUrl: Optional[str] = None

class MatchRequest(BaseModel):
    lostItemId: str = Field(..., description="MongoDB ObjectId of the lost item report")
    topK: Optional[int] = Field(DEFAULT_TOP_K, ge=1, le=MAX_TOP_K, description="Number of top matches to return")
    weights: Optional[Dict[str, float]] = Field(None, description="Custom 5-factor weights (visual, textual, location, time, attribute)")

@app.get("/health")
def health_check():
    """
    Healthcheck endpoint reporting service, model readiness, and database connectivity.
    """
    mgr = get_model_manager()
    model_status = mgr.get_status()
    db_status = check_db_health()

    is_healthy = model_status["all_ready"] and db_status.get("connected", False)

    return {
        "status": "ok" if is_healthy else "degraded",
        "service": "FindIt Multimodal AI Service",
        "models": model_status,
        "database": db_status,
    }

@app.post("/api/embed")
def embed_report(request: EmbedRequest):
    """
    Generates real visual and text embeddings for a given report and returns metadata.
    """
    report_dict = request.model_dump()
    image_source = request.imagePath or request.imageUrl

    # Generate text embedding
    txt_emb = generate_text_embedding(report_dict)

    # Generate image embedding if image is provided
    img_emb = None
    if image_source:
        img_emb = generate_image_embedding(image_source)

    return {
        "success": True,
        "textEmbedding": {
            "status": "generated" if txt_emb is not None else "failed",
            "dimensions": len(txt_emb) if txt_emb is not None else 0,
        },
        "visualEmbedding": {
            "status": "generated" if img_emb is not None else ("not_provided" if not image_source else "failed"),
            "dimensions": len(img_emb) if img_emb is not None else 0,
        },
    }

class BatchEmbedRequest(BaseModel):
    reports: List[EmbedRequest] = Field(..., max_length=50)

@app.post("/api/batch-embed")
def batch_embed_reports(request: BatchEmbedRequest):
    """
    Cost/Efficiency Guard: Batch generates dense embeddings for multiple reports in one request,
    amortizing overhead and supporting bulk indexing.
    """
    results = []
    for item in request.reports:
        rep_dict = item.model_dump()
        img_src = item.imagePath or item.imageUrl
        t_emb = generate_text_embedding(rep_dict)
        i_emb = generate_image_embedding(img_src) if img_src else None

        results.append({
            "title": item.title,
            "textEmbeddingDimensions": len(t_emb) if t_emb is not None else 0,
            "visualEmbeddingDimensions": len(i_emb) if i_emb is not None else 0,
            "hasVisual": i_emb is not None,
            "hasText": t_emb is not None,
        })

    return {
        "success": True,
        "processedCount": len(results),
        "results": results,
    }

@app.post("/api/match")
def match_lost_item(request: MatchRequest):
    """
    Retrieves the target Lost item from MongoDB, compares it against all active Found items,
    computes 5-weight explainable match scores, and returns ranked candidates.
    AI NEVER automatically confirms ownership.
    """
    lost_id = request.lostItemId.strip()

    # 1. Retrieve the source Lost report from MongoDB
    lost_item = find_item_by_id(lost_id)
    if not lost_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lost item report with ID '{lost_id}' was not found in the campus registry.",
        )

    # 2. Validate that the source item is a Lost report
    item_type = (lost_item.get("type") or lost_item.get("reportType") or "").lower()
    if item_type != "lost":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Item with ID '{lost_id}' is a '{item_type}' item. The matching engine compares Lost items against Found candidates.",
        )

    # 3. Retrieve eligible active Found candidates from MongoDB
    found_candidates = find_active_found_candidates(exclude_id=lost_id)

    if not found_candidates:
        return {
            "success": True,
            "sourceItemId": lost_id,
            "sourceItemTitle": lost_item.get("title"),
            "totalCandidatesEvaluated": 0,
            "matches": [],
            "message": "No active found items currently available in the campus registry to match against.",
        }

    # 4. Retrieve or generate embeddings for the Lost item (with MongoDB persistent cache)
    lost_image_source = None
    if lost_item.get("imagePaths") and len(lost_item["imagePaths"]) > 0:
        lost_image_source = lost_item["imagePaths"][0]
    elif lost_item.get("imageUrls") and len(lost_item["imageUrls"]) > 0:
        lost_image_source = lost_item["imageUrls"][0]

    # Check MongoDB cache
    lost_img_emb = (
        np.array(lost_item["imageEmbedding"], dtype=np.float32)
        if lost_item.get("imageEmbedding")
        else None
    )
    if lost_img_emb is None and lost_image_source:
        lost_img_emb = generate_image_embedding(lost_image_source)

    lost_txt_emb = (
        np.array(lost_item["textEmbedding"], dtype=np.float32)
        if lost_item.get("textEmbedding")
        else None
    )
    if lost_txt_emb is None:
        lost_txt_emb = generate_text_embedding(lost_item)

    # Persist newly generated embeddings back to MongoDB
    if lost_item.get("_id") and (lost_item.get("imageEmbedding") is None or lost_item.get("textEmbedding") is None):
        update_item_embeddings(lost_item["_id"], lost_img_emb, lost_txt_emb)

    # 5. Evaluate similarity against each Found candidate (with caching)
    ranked_results = []

    for found_item in found_candidates:
        found_image_source = None
        if found_item.get("imagePaths") and len(found_item["imagePaths"]) > 0:
            found_image_source = found_item["imagePaths"][0]
        elif found_item.get("imageUrls") and len(found_item["imageUrls"]) > 0:
            found_image_source = found_item["imageUrls"][0]

        # Check MongoDB cache for found candidate
        found_img_emb = (
            np.array(found_item["imageEmbedding"], dtype=np.float32)
            if found_item.get("imageEmbedding")
            else None
        )
        if found_img_emb is None and found_image_source:
            found_img_emb = generate_image_embedding(found_image_source)

        found_txt_emb = (
            np.array(found_item["textEmbedding"], dtype=np.float32)
            if found_item.get("textEmbedding")
            else None
        )
        if found_txt_emb is None:
            found_txt_emb = generate_text_embedding(found_item)

        # Persist newly generated embeddings back to MongoDB
        if found_item.get("_id") and (found_item.get("imageEmbedding") is None or found_item.get("textEmbedding") is None):
            update_item_embeddings(found_item["_id"], found_img_emb, found_txt_emb)

        match_data = calculate_match(
            lost_item=lost_item,
            found_item=found_item,
            lost_img_emb=lost_img_emb,
            found_img_emb=found_img_emb,
            lost_txt_emb=lost_txt_emb,
            found_txt_emb=found_txt_emb,
            weights=request.weights or CURRENT_WEIGHTS,
        )

        candidate_result = {
            "itemId": str(found_item.get("_id") or found_item.get("id")),
            "title": found_item.get("title"),
            "category": found_item.get("category"),
            "brand": found_item.get("brand") or "",
            "primaryColor": found_item.get("primaryColor") or "",
            "campusZone": found_item.get("location", {}).get("campusZone") or "",
            "specificLocation": found_item.get("location", {}).get("specificLocation") or "",
            "dateTime": found_item.get("dateTime"),
            "imageUrls": found_item.get("imageUrls", []),
            "matchScore": match_data["matchScore"],
            "matchScoreNormalized": match_data["matchScoreNormalized"],
            "subScores": match_data.get("subScores", {}),
            "scoreBreakdown": match_data["scoreBreakdown"],
            "effectiveWeights": match_data["effectiveWeights"],
            "availableModalities": match_data["availableModalities"],
            "unavailableModalities": match_data["unavailableModalities"],
            "explanation": match_data["explanation"],
            "visualCues": match_data.get("visualCues", []),
            "textualCues": match_data.get("textualCues", []),
            "topKeywordsShared": match_data.get("topKeywordsShared", []),
            "humanVerificationGuidance": match_data.get(
                "humanVerificationGuidance",
                "AI similarity is advisory only. Physical ownership must be authenticated by campus staff before release."
            ),
            "status": found_item.get("status", "active"),
            "verificationNotice": "AI candidate match only. Physical ownership must be authenticated by campus security before release.",
        }
        ranked_results.append(candidate_result)

    # 6. Rank candidates in descending order of match score
    ranked_results.sort(key=lambda x: x["matchScore"], reverse=True)

    # 7. Return top K
    top_matches = ranked_results[: request.topK]

    return {
        "success": True,
        "sourceItemId": lost_id,
        "sourceItemTitle": lost_item.get("title"),
        "totalCandidatesEvaluated": len(found_candidates),
        "matchesReturned": len(top_matches),
        "matches": top_matches,
    }

class TuneWeightsRequest(BaseModel):
    weights: Dict[str, float] = Field(..., description="Map of factor weights: visual, textual, location, time, attribute")

class MatchFeedbackRequest(BaseModel):
    lostItemId: str
    candidateItemId: str
    feedbackType: str = Field(..., description="'confirmed_match', 'accepted_claim', 'rejected_claim', or 'false_match'")
    reportedScore: Optional[float] = None
    notes: Optional[str] = ""

@app.get("/api/weights")
def get_weights():
    """
    Returns current active weights, initial baseline weights,
    and ground-truth feedback learning statistics.
    """
    feedback_stats = get_feedback_stats()
    return {
        "success": True,
        "currentWeights": CURRENT_WEIGHTS,
        "initialWeights": INITIAL_WEIGHTS,
        "feedbackStats": feedback_stats,
    }

@app.post("/api/weights/tune")
def tune_weights(request: TuneWeightsRequest):
    """
    Online Tuning Endpoint: Adjusts the runtime weights dynamically.
    Ensures all 5 factors exist and sum to 1.00 (tolerance ±0.05).
    """
    required_keys = {"visual", "textual", "location", "time", "attribute"}
    provided_keys = set(request.weights.keys())

    if not required_keys.issubset(provided_keys):
        missing = required_keys - provided_keys
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Missing required weight factors: {', '.join(missing)}",
        )

    weight_sum = sum(request.weights[k] for k in required_keys)
    if not (0.95 <= weight_sum <= 1.05):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Weights must sum to 1.00 (got {round(weight_sum, 3)}). Please re-normalize.",
        )

    # Normalize strictly to sum = 1.00
    for k in required_keys:
        CURRENT_WEIGHTS[k] = round(request.weights[k] / weight_sum, 4)

    logger.info(f"Updated active matching weights dynamically: {CURRENT_WEIGHTS}")
    return {
        "success": True,
        "message": "Matching weights dynamically tuned successfully.",
        "activeWeights": CURRENT_WEIGHTS,
    }

@app.post("/api/weights/reset")
def reset_weights():
    """Resets active weights back to the initial baseline."""
    for k, v in INITIAL_WEIGHTS.items():
        CURRENT_WEIGHTS[k] = v
    logger.info("Reset active matching weights to initial baseline.")
    return {
        "success": True,
        "message": "Weights reset to default baseline.",
        "activeWeights": CURRENT_WEIGHTS,
    }

@app.post("/api/weights/feedback")
def submit_match_feedback(request: MatchFeedbackRequest):
    """
    Continuous Learning Loop: Records positive/negative feedback from user claims or admin actions,
    enabling closed-loop weight tuning and ground-truth validation.
    """
    data = request.model_dump()
    success = record_match_feedback(data)
    return {
        "success": success,
        "message": "Feedback recorded successfully for continuous tuning." if success else "Failed to record feedback.",
    }

@app.get("/api/cache/stats")
def cache_telemetry():
    """
    Telemetry and inspection for in-memory and MongoDB caches and fallbacks.
    """
    cache_info = get_cache_stats()
    mgr = get_model_manager()
    return {
        "success": True,
        "cache": cache_info,
        "modelsLoaded": mgr.get_status(),
        "fallbacks": {
            "zeroShotTextOnly": "Available when image is missing or corrupt",
            "heuristicSecurity": "Available if Groq API limit reached",
            "diskStorage": "Available if Cloudinary remote upload fails",
            "serviceOfflineDegradation": "Backend proxies return HTTP 503 graceful notice",
        },
    }

@app.post("/api/cache/clear")
def flush_cache():
    """Flushes in-memory OpenCLIP and Sentence Transformer caches."""
    clear_all_caches()
    return {
        "success": True,
        "message": "All in-memory embedding caches flushed successfully.",
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=HOST, port=PORT, reload=True)
