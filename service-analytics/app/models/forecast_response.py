# app/models/forecast_response.py
from pydantic import BaseModel
from typing import List
from datetime import datetime

class DailyPrediction(BaseModel):
    date: str
    predicted_demand: float

class ForecastResponse(BaseModel):
    product_sku: str
    model_version: str
    forecast_horizon_days: int
    confidence_score: float
    generated_at: datetime
    forecast_data: List[DailyPrediction]