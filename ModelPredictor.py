from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd
app = FastAPI(title="Soil Health Fertilizer Recommendation API")

# -------- Load Model Once (on startup) --------
model = joblib.load("fertilizer_model_new.pkl")   # your trained model file


# -------- Request Schema --------
class PredictionRequest(BaseModel):
    Soil_Type: str
    Soil_pH: float
    Soil_Moisture: float
    Organic_Carbon: float
    Electrical_Conductivity: float
    Nitrogen_Level: float
    Phosphorus_Level: float
    Potassium_Level: float
    Temperature: float
    Humidity: float
    Rainfall: float
    Crop_Type: str
    Crop_Growth_Stage: str
    Season: str
    Irrigation_Type: str
    Previous_Crop: str
    Region: str
    Fertilizer_Used_Last_Season: float
    Yield_Last_Season: float


# -------- Response Schema --------
class PredictionResponse(BaseModel):
    Recommended_Fertilizer: str


# -------- Prediction Endpoint --------
@app.post("/predict", response_model=PredictionResponse)
def predict(data: PredictionRequest):

    # Convert request into DataFrame (it is important because the model was trained on pandas library)
    input_df = pd.DataFrame([data.model_dump()])

    # Predict
    prediction = model.predict(input_df)[0]

    return PredictionResponse(
        Recommended_Fertilizer=str(prediction)
    )
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("ModelPredictor:app", host="127.0.0.1", port=8000, reload=True)