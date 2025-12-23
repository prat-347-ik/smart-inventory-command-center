# app/ml/regression_model.py
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score
from typing import List

class DemandLinearRegression:
    """
    A wrapper around Scikit-Learn's LinearRegression specialized for 
    recursive time-series forecasting.
    """

    def __init__(self):
        self.model = LinearRegression()
        self.r2_score = 0.0
        # CRITICAL: These must match the order in Feature Engineering (Phase 3)
        self.feature_order = ['lag_1', 'lag_7', 'lag_14', 'rolling_mean_7', 'trend_index']

    def train(self, X: pd.DataFrame, y: pd.Series) -> None:
        """
        Trains the model on historical data.
        """
        # Ensure column order matches expectation
        X_ordered = X[self.feature_order]
        
        self.model.fit(X_ordered, y)
        
        # Calculate Explainability Score (R²)
        predictions = self.model.predict(X_ordered)
        if len(y) > 1:
            self.r2_score = r2_score(y, predictions)
        else:
            self.r2_score = 0.0

    def predict(self, X: pd.DataFrame) -> np.ndarray:
        return self.model.predict(X[self.feature_order])

    def forecast_recursive(self, recent_history: List[float], horizon: int = 7) -> List[float]:
        """
        Generates future predictions iteratively with SAFETY CLAMPS and WARNING FIXES.
        """
        # Create a working buffer to avoid mutating original data
        history_buffer = list(recent_history)
        predictions = []

        # Minimum required history is determined by the largest lag (14)
        if len(history_buffer) < 14:
            # Fallback: If not enough history, return a flat line using the mean
            safe_mean = np.mean(history_buffer) if history_buffer else 0
            return [safe_mean] * horizon

        for _ in range(horizon):
            # --- Dynamic Feature Engineering ---
            
            # 1. Lags
            lag_1 = history_buffer[-1]
            lag_7 = history_buffer[-7]
            lag_14 = history_buffer[-14]

            # 2. Rolling Mean (7 Day)
            rolling_mean_7 = np.mean(history_buffer[-7:])

            # 3. Trend Index
            trend_index = (lag_1 - lag_7) / 7.0

            # Construct feature vector
            features_vector = np.array([[
                lag_1, lag_7, lag_14, rolling_mean_7, trend_index
            ]])
            
            # 🛠️ FIX FOR WARNING: Convert to DataFrame with names
            features_df = pd.DataFrame(features_vector, columns=self.feature_order)
            
            # --- Predict ---
            predicted_demand = float(self.model.predict(features_df)[0])
            
            # 🚨 SAFETY CLAMP 🚨
            # Prevent the "Explosion":
            # 1. Prediction cannot be negative.
            # 2. Prediction cannot be more than 200% of the 7-day average (Growth Cap).
            # 3. Prediction cannot be less than 20% of the 7-day average (Crash Cap).
            
            # (Avoid division by zero if rolling mean is 0)
            base_mean = rolling_mean_7 if rolling_mean_7 > 0.1 else 1.0
            
            upper_limit = base_mean * 2.0 
            lower_limit = base_mean * 0.2
            
            # Apply clamps
            predicted_demand = max(lower_limit, min(predicted_demand, upper_limit))

            predictions.append(predicted_demand)

            # --- Recursion Step ---
            history_buffer.append(predicted_demand)

        return predictions