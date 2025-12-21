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
    4. Generate Recursive Forecast.
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
        logger.error(f"Data integrity error: 'total_units_sold' missing for {sku}")
        return None

    # --- Step 2: Feature Engineering (Phase 3 Integration) ---
    # We need enough raw data to generate lags (max lag 14) + training rows
    if len(df) < 20: 
        logger.info(f"Insufficient data points ({len(df)}) to train model for {sku}. Need > 20.")
        return None

    engineer = InventoryFeatureEngineer(df, target_col='total_units_sold', date_col='date_key')
    ml_df = engineer.transform() # This drops the first 14 rows (NaNs)

    # Prepare Training Matrices
    feature_cols = ['lag_1', 'lag_7', 'lag_14', 'rolling_mean_7', 'trend_index']
    target_col = 'total_units_sold'
    
    X_train = ml_df[feature_cols]
    y_train = ml_df[target_col]

    # --- Step 3: Train Model (Phase 4) ---
    regressor = DemandLinearRegression()
    regressor.train(X_train, y_train)

    # --- Step 4: Recursive Forecasting ---
    # We need the *actual* last 14 days of history to start the recursion loop.
    # We take this from the ORIGINAL df (before NaNs were dropped) to get the most recent data.
    recent_history = df['total_units_sold'].tail(14).tolist()
    
    predicted_values = regressor.forecast_recursive(recent_history, horizon=horizon)

    # --- Step 5: Format & Persist Results ---
    # Calculate dates for the forecast
    last_date_str = df.iloc[-1]['date_key']
    # If date_key is string, convert to object, else assume datetime
    last_date = datetime.strptime(last_date_str, "%Y-%m-%d")
    
    forecast_entries = []
    for i, pred_val in enumerate(predicted_values):
        forecast_date = last_date + timedelta(days=i+1)
        forecast_entries.append({
            "date": forecast_date.strftime("%Y-%m-%d"),
            "predicted_units": round(pred_val, 2)
        })

    forecast_document = {
        "product_sku": sku,
        "model_version": settings.MODEL_VERSION,
        "generated_at": datetime.utcnow(),
        "forecast_horizon": horizon,
        "confidence_score_r2": round(regressor.r2_score, 4),
        "forecasts": forecast_entries
    }

    # Upsert the forecast (replace old forecast for this SKU)
    await db_instance[settings.COLLECTION_FORECASTS].update_one(
        {"product_sku": sku},
        {"$set": forecast_document},
        upsert=True
    )

    logger.info(f"✅ Generated forecast for {sku} (R²: {regressor.r2_score:.2f})")
    
    return forecast_document