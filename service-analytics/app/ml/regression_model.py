# app/ml/regression_model.py
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score
from typing import List
from datetime import datetime, timedelta

class DemandLinearRegression:
    """
    A wrapper around Scikit-Learn's LinearRegression specialized for 
    recursive time-series forecasting.
    """

    def __init__(self):
        self.model = LinearRegression()
        self.r2_score = 0.0
        # CRITICAL: This exact order must be maintained.
        # It matches the Feature Engineering output + the dynamic features we add here.
        self.feature_order = [
            'lag_1', 'lag_7', 'lag_14', 
            'rolling_mean_7', 'trend_index',
            'is_weekend', 'is_holiday'  # <--- NEW CONTEXT FEATURES
        ]
        
        # Hardcoded holidays for forecast-time generation (Matches Feature Engineer)
        self.static_holidays = {
            "2023-01-01", "2023-05-29", "2023-07-04", "2023-11-23", "2023-11-24", "2023-12-25",
            "2024-01-01", "2024-05-27", "2024-07-04", "2024-11-28", "2024-11-29", "2024-12-25",
            "2025-01-01", "2025-05-26", "2025-07-04", "2025-11-27", "2025-11-28", "2025-12-25",
        }

    def train(self, X: pd.DataFrame, y: pd.Series) -> None:
        """
        Trains the model on historical data.
        """
        # Filter X to only include the features we expect
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

    def forecast_recursive(self, recent_history: List[float], start_date: datetime, horizon: int = 7) -> List[float]:
        """
        Generates future predictions iteratively using DYNAMIC CONTEXT.
        
        Args:
            recent_history: List of float values (demand)
            start_date: The date of the FIRST prediction (t+1)
            horizon: How many days to predict
        """
        # Create a working buffer to avoid mutating original data
        history_buffer = list(recent_history)
        predictions = []

        # Minimum required history (14 days for lag_14)
        if len(history_buffer) < 14:
            safe_mean = np.mean(history_buffer) if history_buffer else 0
            return [safe_mean] * horizon

        current_date = start_date

        for _ in range(horizon):
            # --- 1. Dynamic Feature Engineering ---
            lag_1 = history_buffer[-1]
            lag_7 = history_buffer[-7]
            lag_14 = history_buffer[-14]

            # Rolling Mean & Trend
            rolling_mean_7 = np.mean(history_buffer[-7:])
            trend_index = (lag_1 - lag_7) / 7.0

            # --- 2. Dynamic Context Generation (The "Brain" Upgrade) ---
            # is_weekend: 5=Sat, 6=Sun
            is_weekend = 1 if current_date.weekday() >= 5 else 0
            
            # is_holiday
            date_str = current_date.strftime("%Y-%m-%d")
            is_holiday = 1 if date_str in self.static_holidays else 0

            # Construct feature vector
            features_vector = np.array([[
                lag_1, lag_7, lag_14, 
                rolling_mean_7, trend_index,
                is_weekend, is_holiday
            ]])
            
            features_df = pd.DataFrame(features_vector, columns=self.feature_order)
            
            # --- 3. Predict ---
            predicted_demand = float(self.model.predict(features_df)[0])
            
            # --- 4. Safety Clamps (prevent runaway feedback loops) ---
            base_mean = rolling_mean_7 if rolling_mean_7 > 0.1 else 1.0
            upper_limit = base_mean * 2.0 
            lower_limit = base_mean * 0.2
            
            predicted_demand = max(lower_limit, min(predicted_demand, upper_limit))

            predictions.append(predicted_demand)

            # --- 5. Recursion Step ---
            history_buffer.append(predicted_demand)
            current_date += timedelta(days=1) # Move to next day

        return predictions