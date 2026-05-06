import io
import json
import os
import urllib.request
from typing import List, Optional

import numpy as np
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image
import tensorflow as tf

# ---------- Configuration ----------
MODEL_URL = "https://huggingface.co/saiganesh0813/Plant-Disease-Prediction/resolve/main/plant%20disease_99.04.h5"
MODEL_PATH = os.getenv("PLANT_MODEL_PATH", os.path.join(os.path.dirname(__file__), "plant disease_99.04.h5"))
LABELS_TXT = os.getenv("PLANT_LABELS_TXT", os.path.join(os.path.dirname(__file__), "class_names.txt"))
LABELS_JSON = os.getenv("PLANT_LABELS_JSON", os.path.join(os.path.dirname(__file__), "class_names.json"))
TARGET_SIZE = (200, 200)  # Image size from crop-disease-prediction-final-model.ipynb
NUM_CLASSES = 56  # Model output layers (EfficientNetB3 based)
TOP_K_DEFAULT = 5


def _download_model_if_needed():
    """Download model from Hugging Face if missing or corrupted (e.g. Git LFS pointer)."""
    min_size = 1_000_000  # Real model is ~135MB; LFS pointer is ~130 bytes
    if os.path.isfile(MODEL_PATH) and os.path.getsize(MODEL_PATH) > min_size:
        return  # Model file looks valid

    print(f"[INFO] Model file missing or too small. Downloading from Hugging Face...")
    try:
        urllib.request.urlretrieve(MODEL_URL, MODEL_PATH)
        size_mb = os.path.getsize(MODEL_PATH) / (1024 * 1024)
        print(f"[INFO] Model downloaded successfully ({size_mb:.1f} MB)")
    except Exception as e:
        print(f"[ERROR] Failed to download model: {e}")
        raise


_download_model_if_needed()

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


class _CompatDepthwiseConv2D(tf.keras.layers.DepthwiseConv2D):
    """Wrapper that silently drops the 'groups' kwarg for older TF versions."""
    def __init__(self, *args, **kwargs):
        kwargs.pop("groups", None)
        super().__init__(*args, **kwargs)


def _ensure_model_loaded():
    global _model, _class_names, _input_requires_rescale
    if _model is None:
        if not os.path.isfile(MODEL_PATH):
            raise FileNotFoundError(f"Model file not found at '{MODEL_PATH}'. Place 'plant disease_99.04.h5' in the project root or set PLANT_MODEL_PATH.")
        # Load model - H5 format with compatibility fix for DepthwiseConv2D
        _model = tf.keras.models.load_model(
            MODEL_PATH,
            compile=False,
            custom_objects={"DepthwiseConv2D": _CompatDepthwiseConv2D},
        )
        _class_names = _load_labels()
        # Model has Rescaling layer (1/255) as second layer after input, so no need to rescale
        _input_requires_rescale = False


def _preprocess_image_bytes(image_bytes: bytes) -> np.ndarray:
    """Load and preprocess image bytes into a model-ready batch (1, H, W, 3).

    Model from crop-disease-prediction-final-model.ipynb has built-in Rescaling layer,
    so input should be in [0, 255] range, not [0, 1].
    """
    _ensure_model_loaded()

    # Read with PIL to handle various formats
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image = image.resize(TARGET_SIZE)

    arr = np.asarray(image, dtype=np.float32)

    # Model has Rescaling(1./255) as built-in layer, so pass raw [0-255] values
    # No need to divide by 255 here

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
    # Note: Model has 56 output classes, class_names files may have fewer (42)
    labels = None
    if _class_names is not None:
        labels = []
        for idx in top_indices:
            if idx < len(_class_names):
                labels.append(_class_names[idx])
            else:
                labels.append(f"class_{idx}")  # Fallback for indices beyond loaded labels

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

