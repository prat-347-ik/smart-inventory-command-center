# app/api/forecast.py
from fastapi import APIRouter, HTTPException, Query
from app.core.db import db
from app.core.config import settings
from app.services.forecasting_service import generate_forecast_for_sku
from app.models.forecast_response import ForecastResponse, DailyPrediction

router = APIRouter()

@router.get("/predict/{sku}", response_model=ForecastResponse)
async def get_prediction(sku: str, days: int = Query(7, gt=0, le=30)):
    """
    Get demand forecast for a product. 
    Smartly determines if the cached forecast is fresh enough or needs regeneration.
    """
    db_instance = db.get_db()
    
    # 1. Fetch existing forecast
    existing_forecast = await db_instance[settings.COLLECTION_FORECASTS].find_one(
        {"product_sku": sku}
    )

    should_regenerate = False

    if not existing_forecast:
        should_regenerate = True
    else:
        # 2. Freshness Check: Is the existing forecast stale?
        # A forecast is stale if:
        # A) It was generated with a shorter horizon than currently requested
        # B) New data (snapshots) has arrived since it was generated
        
        # Check A: Horizon
        if existing_forecast.get("forecast_horizon", 0) < days:
            should_regenerate = True
        else:
            # Check B: Data Freshness
            last_generation_time = existing_forecast.get("generated_at")
            
            # Look for any snapshot created AFTER the forecast
            new_data_exists = await db_instance[settings.COLLECTION_DAILY_SNAPSHOTS].find_one({
                "product_sku": sku,
                "generated_at": {"$gt": last_generation_time}
            })
            
            if new_data_exists:
                should_regenerate = True

    # 3. Regenerate or Reuse
    if should_regenerate:
        # Invoke Phase 4 Service
        # Note: This awaits the potentially expensive operation. 
        # In a higher-load system, this might be offloaded to a background worker,
        # but for this microservice design, direct await is acceptable.
        forecast_doc = await generate_forecast_for_sku(sku, horizon=days)
        
        if not forecast_doc:
            raise HTTPException(status_code=404, detail="Insufficient historical data to generate forecast")
    else:
        forecast_doc = existing_forecast

    # 4. Map to Response Model
    # Filter the forecast_data to match strictly the requested 'days' (if we have more cached)
    all_predictions = forecast_doc.get("forecasts", [])
    sliced_predictions = all_predictions[:days]

    return ForecastResponse(
        product_sku=forecast_doc["product_sku"],
        model_version=forecast_doc["model_version"],
        forecast_horizon_days=days,
        confidence_score=forecast_doc.get("confidence_score_r2", 0.0),
        generated_at=forecast_doc["generated_at"],
        forecast_data=[
            DailyPrediction(date=p["date"], predicted_demand=p["predicted_units"]) 
            for p in sliced_predictions
        ]
    )