import io
import json
import os
from typing import List, Optional

import numpy as np
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image
import tensorflow as tf

# ---------- Configuration ----------
MODEL_PATH = os.getenv("PLANT_MODEL_PATH", os.path.join(os.path.dirname(__file__), "googlenet.keras"))
LABELS_TXT = os.getenv("PLANT_LABELS_TXT", os.path.join(os.path.dirname(__file__), "class_names.txt"))
LABELS_JSON = os.getenv("PLANT_LABELS_JSON", os.path.join(os.path.dirname(__file__), "class_names.json"))
TARGET_SIZE = (224, 224)  # As used in the notebook
TOP_K_DEFAULT = 5

app = FastAPI(title="Plant Disease Classifier API", version="1.0.0")

# Enable CORS (adjust origins as needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _load_labels() -> Optional[List[str]]:
    """Try to load class names from txt or JSON (optional)."""
    try:
        if os.path.isfile(LABELS_JSON):
            with open(LABELS_JSON, "r", encoding="utf-8") as f:
                data = json.load(f)
            if isinstance(data, list) and all(isinstance(x, str) for x in data):
                return data
        if os.path.isfile(LABELS_TXT):
            with open(LABELS_TXT, "r", encoding="utf-8") as f:
                lines = [ln.strip() for ln in f.readlines() if ln.strip()]
            if lines:
                return lines
    except Exception:
        # Labels are optional; ignore errors.
        pass
    return None


# Lazy-loaded globals
_model: Optional[tf.keras.Model] = None
_class_names: Optional[List[str]] = None
_input_requires_rescale: Optional[bool] = None


def _ensure_model_loaded():
    global _model, _class_names, _input_requires_rescale
    if _model is None:
        if not os.path.isfile(MODEL_PATH):
            raise FileNotFoundError(f"Model file not found at '{MODEL_PATH}'. Place googlenet.keras in the project root or set PLANT_MODEL_PATH.")
        _model = tf.keras.models.load_model(MODEL_PATH, compile=False)
        _class_names = _load_labels()
        # Heuristic: if the first layer is a Rescaling, don't rescale again here
        _input_requires_rescale = True
        try:
            from tensorflow.keras.layers import Rescaling
            first_layer = _model.layers[0] if _model.layers else None
            _input_requires_rescale = not isinstance(first_layer, Rescaling)
        except Exception:
            # Fallback: default to not rescaling if the shape looks like it expects [0,1]
            _input_requires_rescale = True


def _preprocess_image_bytes(image_bytes: bytes) -> np.ndarray:
    """Load and preprocess image bytes into a model-ready batch (1, H, W, 3)."""
    _ensure_model_loaded()

    # Read with PIL to handle various formats
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image = image.resize(TARGET_SIZE)

    arr = np.asarray(image, dtype=np.float32)

    # If the model already has a Rescaling(1./255), we shouldn't divide again here.
    if _input_requires_rescale:
        arr = arr / 255.0

    # Add batch dimension
    arr = np.expand_dims(arr, axis=0)
    return arr


class PredictResponse(BaseModel):
    top_indices: List[int]
    top_scores: List[float]
    top_labels: Optional[List[str]] = None
    predicted_index: int
    predicted_score: float
    predicted_label: Optional[str] = None


@app.get("/")
def read_root():
    return {
        "message": "Plant Disease Classifier API is running",
        "model_path": MODEL_PATH,
        "has_labels": os.path.isfile(LABELS_TXT) or os.path.isfile(LABELS_JSON),
        "target_size": TARGET_SIZE,
        "top_k_default": TOP_K_DEFAULT,
    }


@app.get("/healthz")
def healthz():
    try:
        _ensure_model_loaded()
        return {"status": "ok", "model_loaded": True}
    except Exception as e:
        return {"status": "error", "detail": str(e)}


@app.post("/predict", response_model=PredictResponse)
async def predict(file: UploadFile = File(...), top_k: int = TOP_K_DEFAULT):
    if top_k <= 0:
        raise HTTPException(status_code=400, detail="top_k must be > 0")

    # Load model (lazily)
    try:
        _ensure_model_loaded()
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load model: {e}")

    # Read file content
    try:
        contents = await file.read()
        batch = _preprocess_image_bytes(contents)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image file: {e}")

    # Predict
    try:
        preds = _model.predict(batch)
        if preds.ndim != 2 or preds.shape[0] != 1:
            raise ValueError(f"Unexpected prediction shape: {preds.shape}")
        probs = preds[0].astype(float)
        # The model should already apply softmax; in case it's not, apply manually
        if np.any(probs < 0) or np.sum(probs) <= 0 or np.max(probs) > 1.0 + 1e-3:
            exps = np.exp(probs - np.max(probs))
            probs = exps / np.sum(exps)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {e}")

    # Top-k
    k = min(top_k, probs.shape[0])
    top_indices = np.argsort(probs)[-k:][::-1].tolist()
    top_scores = [float(probs[i]) for i in top_indices]

    # Labels (optional)
    labels = None
    if _class_names is not None:
        labels = [(_class_names[i] if i < len(_class_names) else f"class_{i}") for i in top_indices]

    return PredictResponse(
        top_indices=top_indices,
        top_scores=top_scores,
        top_labels=labels,
        predicted_index=top_indices[0],
        predicted_score=top_scores[0],
        predicted_label=(labels[0] if labels else None),
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
# To run locally:
#   uvicorn main:app --reload --port 8000
# Then send a request, e.g., with curl:
#   curl -X POST "http://127.0.0.1:8000/predict" \
#        -H "accept: application/json" -H "Content-Type: multipart/form-data" \
#        -F "file=@path/to/leaf.jpg"
