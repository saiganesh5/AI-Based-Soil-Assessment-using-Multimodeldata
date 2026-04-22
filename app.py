import io
import os
import zipfile
import tempfile
from contextlib import asynccontextmanager
from pathlib import Path
from typing import List, Optional
from urllib.parse import urlparse

os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"

import numpy as np
import requests
from fastapi import FastAPI, File, HTTPException, UploadFile
from pydantic import BaseModel, HttpUrl
from PIL import Image

import keras
from keras.applications import MobileNetV2
from keras.layers import (
    Input, GlobalAveragePooling2D, BatchNormalization,
    Dense, Dropout, Rescaling, RandomFlip, RandomRotation, RandomZoom, RandomContrast
)
from keras.models import Model

import uvicorn


# Paths
BASE_DIR = Path(__file__).resolve().parent

MODEL_PATH = BASE_DIR / "Soil_type_CNN_Model.keras"

LABELS_PATH = BASE_DIR / "labels.txt"
REQUEST_TIMEOUT_SECONDS = 15
MAX_IMAGE_BYTES = 10 * 1024 * 1024
CONFIDENCE_THRESHOLD = 0.60  # Reject predictions below 60% as "not soil"


def _build_and_load_model(model_path: str):
    """Reconstruct the model architecture as a Functional model and load
    weights from the .keras archive.

    This bypasses a Keras 3.13 deserialization bug where Sequential models
    containing a nested Functional sub-model (MobileNetV2) cause
    BatchNormalization to receive duplicate input tensors.
    """
    input_shape = (224, 224, 3)

    # Build as a Functional model (avoids the Sequential deserialization bug)
    inputs = Input(shape=input_shape, name="input_layer_1")

    # Data augmentation layers (matching the saved model config)
    x = RandomFlip("horizontal", name="random_flip")(inputs)
    x = RandomRotation(0.2, name="random_rotation")(x)
    x = RandomZoom(0.2, name="random_zoom")(x)
    x = RandomContrast(0.2, name="random_contrast")(x)

    # Rescaling
    x = Rescaling(1.0 / 255, name="rescaling")(x)

    # MobileNetV2 backbone (weights=None; real weights loaded from file)
    base_model = MobileNetV2(weights=None, include_top=False, input_shape=input_shape)
    x = base_model(x)

    # Classification head
    x = GlobalAveragePooling2D(name="global_average_pooling2d")(x)
    x = BatchNormalization(name="batch_normalization")(x)
    x = Dense(128, activation="relu", name="dense")(x)
    x = Dropout(0.5, name="dropout")(x)
    x = Dense(6, activation="softmax", name="dense_1")(x)

    model = Model(inputs=inputs, outputs=x, name="sequential_1")

    # Extract weights from the .keras archive and load them
    with zipfile.ZipFile(model_path) as z:
        with tempfile.TemporaryDirectory() as tmpdir:
            z.extract("model.weights.h5", tmpdir)
            weights_path = os.path.join(tmpdir, "model.weights.h5")
            model.load_weights(weights_path)

    return model


# App lifecycle
@asynccontextmanager
async def lifespan(app: FastAPI):
    if not MODEL_PATH.exists():
        raise RuntimeError(f"Model not found at: {MODEL_PATH}")

    print("Loading model...")

    # Use manual reconstruction to avoid Keras 3.13 deserialization bug
    app.state.model = _build_and_load_model(str(MODEL_PATH))

    print("Model loaded successfully!")

    app.state.labels = _load_labels()
    app.state.input_shape = app.state.model.input_shape
    yield


app = FastAPI(title="Soil Classification API", version="1.0.0", lifespan=lifespan)


# Request / Response models
class PredictRequest(BaseModel):
    image_url: HttpUrl


class PredictResponse(BaseModel):
    is_soil: bool
    predicted_index: int
    predicted_label: Optional[str]
    confidence: float
    probabilities: List[float]


# Load labels
def _load_labels() -> List[str]:
    if not LABELS_PATH.exists():
        return []
    labels = [line.strip() for line in LABELS_PATH.read_text(encoding="utf-8").splitlines()]
    return [label for label in labels if label and not label.startswith("#")]


# Validate URL
def _validate_remote_url(url: str) -> None:
    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https"):
        raise HTTPException(status_code=400, detail="Only http/https image URLs are supported.")


# Fetch image
def _fetch_image_bytes(url: str) -> bytes:
    _validate_remote_url(url)
    try:
        response = requests.get(url, timeout=REQUEST_TIMEOUT_SECONDS, stream=True)
        response.raise_for_status()
    except requests.RequestException as exc:
        raise HTTPException(status_code=400, detail=f"Unable to fetch image URL: {exc}") from exc

    total = 0
    chunks = []
    for chunk in response.iter_content(chunk_size=8192):
        if not chunk:
            continue
        total += len(chunk)
        if total > MAX_IMAGE_BYTES:
            raise HTTPException(status_code=400, detail="Image is too large (max 10 MB).")
        chunks.append(chunk)

    return b"".join(chunks)


# Prepare input
def _prepare_input(image_bytes: bytes, input_shape: tuple) -> np.ndarray:
    if len(input_shape) != 4:
        raise HTTPException(status_code=500, detail=f"Unexpected model input shape: {input_shape}")

    _, h, w, c = input_shape

    try:
        image = Image.open(io.BytesIO(image_bytes))
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Invalid image data: {exc}") from exc

    # Convert channels
    if c == 1:
        image = image.convert("L")
    elif c == 3:
        image = image.convert("RGB")
    else:
        raise HTTPException(status_code=500, detail=f"Unsupported channel count: {c}")

    # Resize
    image = image.resize((w, h))

    # IMPORTANT: NO /255 (model already has Rescaling layer)
    arr = np.asarray(image, dtype=np.float32)

    if c == 1:
        arr = np.expand_dims(arr, axis=-1)

    arr = np.expand_dims(arr, axis=0)
    return arr


# Health check
@app.get("/health")
def health():
    return {"status": "ok"}


def _build_response(scores: np.ndarray) -> PredictResponse:
    """Build a prediction response with confidence threshold check."""
    predicted_index = int(np.argmax(scores))
    confidence = float(scores[predicted_index])

    labels = app.state.labels
    is_soil = confidence >= CONFIDENCE_THRESHOLD
    predicted_label = (
        labels[predicted_index] if is_soil and predicted_index < len(labels) else None
    )

    return PredictResponse(
        is_soil=is_soil,
        predicted_index=predicted_index,
        predicted_label=predicted_label,
        confidence=confidence,
        probabilities=scores.tolist(),
    )


# Prediction endpoint
@app.post("/predict", response_model=PredictResponse)
def predict(payload: PredictRequest):
    image_bytes = _fetch_image_bytes(str(payload.image_url))
    model_input = _prepare_input(image_bytes, app.state.input_shape)

    probs = app.state.model.predict(model_input, verbose=0)

    if probs.ndim != 2 or probs.shape[0] != 1:
        raise HTTPException(status_code=500, detail=f"Unexpected model output shape: {probs.shape}")

    return _build_response(probs[0].astype(float))


# File upload prediction endpoint
@app.post("/predict-upload", response_model=PredictResponse)
async def predict_upload(file: UploadFile = File(...)):
    """Upload an image file directly for soil type prediction."""
    image_bytes = await file.read()
    if len(image_bytes) > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=400, detail="Image is too large (max 10 MB).")

    model_input = _prepare_input(image_bytes, app.state.input_shape)

    probs = app.state.model.predict(model_input, verbose=0)

    if probs.ndim != 2 or probs.shape[0] != 1:
        raise HTTPException(status_code=500, detail=f"Unexpected model output shape: {probs.shape}")

    return _build_response(probs[0].astype(float))


# Run server
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)