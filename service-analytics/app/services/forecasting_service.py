# app/services/forecasting_service.py
import pandas as pd
from datetime import datetime, timedelta
from app.core.db import db
from app.core.config import settings
from app.utils.logger import logger
from app.services.feature_engineering import InventoryFeatureEngineer
from app.ml.regression_model import DemandLinearRegression

async def generate_forecast_for_sku(sku: str, horizon: int = 7) -> dict:
    """
    Full Orchestration Pipeline:
    1. Fetch historical daily snapshots (OLAP).
    2. Engineer ML features (Phase 3).
    3. Train Linear Regression Model (Phase 4).
    4. Generate Recursive Forecast (Phase 6 - Context Aware).
    5. Save results to MongoDB.
    """
    db_instance = db.get_db()
    
    # --- Step 1: Extract Data (OLAP) ---
    # Fetch all daily snapshots for this SKU, sorted by date
    cursor = db_instance[settings.COLLECTION_DAILY_SNAPSHOTS].find(
        {"product_sku": sku}
    ).sort("date_key", 1) # Ascending order is critical for time-series
    
    snapshots = await cursor.to_list(length=None)
    
    if not snapshots:
        logger.warning(f"No historical data found for SKU: {sku}")
        return None

    # Convert to Pandas DataFrame
    df = pd.DataFrame(snapshots)
    
    # Ensure we have the target column
    if "total_units_sold" not in df.columns:
        logger.error(f"Data for {sku} is missing 'total_units_sold'")
        return None

    # --- Step 2: Feature Engineering (Phase 3) ---
    # Transform raw data into ML-ready features (lags, rolling means, etc.)
    engineer = InventoryFeatureEngineer(df, target_col='total_units_sold', date_col='date_key')
    X = engineer.transform()
    
    # The target variable 'y' corresponds to the transformed X
    # (Note: X will be shorter than df because of initial NaNs from lags)
    y = X['total_units_sold']

    # --- Step 3: Train Model (Phase 4) ---
    # We initialize a fresh model for every request (Stateless Architecture)
    regressor = DemandLinearRegression()
    regressor.train(X, y)
    
    # --- Step 4: Generate Recursive Forecast ---
    # We need the last 14 days of history to start the recursion loop.
    # We take this from the ORIGINAL df (before NaNs were dropped) to get the most recent data.
    recent_history = df['total_units_sold'].tail(14).tolist()
    
    # CRITICAL UPDATE for Phase 6: Calculate Start Date
    # We need to tell the model *when* the forecast starts so it can generate
    # calendar features (is_weekend, is_holiday) dynamically.
    last_date_str = df.iloc[-1]['date_key']
    
    # Ensure it's a datetime object
    if isinstance(last_date_str, str):
        last_date = datetime.strptime(last_date_str, "%Y-%m-%d")
    else:
        last_date = last_date_str # Already datetime/timestamp
        
    # The forecast starts the day AFTER the last known history
    forecast_start_date = last_date + timedelta(days=1)
    
    # Call the updated recursive method with the start_date
    predicted_values = regressor.forecast_recursive(
        recent_history, 
        start_date=forecast_start_date, 
        horizon=horizon
    )

# --- Step 5: Format with CONFIDENCE INTERVALS ---
    # Logic: The lower the R2, the wider the margin of error.
    # We use a base error margin of 10% (0.10) and scale it by (1 - R2).
    # If R2 is 1.0, margin is 0%. If R2 is 0.5, margin is 10% + 5% = 15%.
    
    r2_score = max(0, regressor.r2_score) # Clamp negative R2 to 0
    uncertainty_factor = 0.10 + (0.20 * (1 - r2_score)) 
    
    forecast_entries = []
    for i, pred_val in enumerate(predicted_values):
        forecast_date = forecast_start_date + timedelta(days=i)
        
        # Calculate Bounds
        margin = pred_val * uncertainty_factor
        upper = pred_val + margin
        lower = max(0, pred_val - margin) # No negative demand
        
        forecast_entries.append({
            "date": forecast_date.strftime("%Y-%m-%d"),
            "predicted_units": round(pred_val, 2),
            "upper_bound": round(upper, 2), # <--- NEW
            "lower_bound": round(lower, 2)  # <--- NEW
        })

    forecast_document = {
        "product_sku": sku,
        "model_version": settings.MODEL_VERSION,
        "generated_at": datetime.utcnow(),
        "forecast_horizon": horizon,
        "confidence_score_r2": round(regressor.r2_score, 4),
        "forecasts": forecast_entries
    }

    # Upsert the forecast
    await db_instance[settings.COLLECTION_FORECASTS].update_one(
        {"product_sku": sku},
        {"$set": forecast_document},
        upsert=True
    )
    
    logger.info(f"Generated forecast for {sku} (R2: {regressor.r2_score:.2f})")
    
    return forecast_document