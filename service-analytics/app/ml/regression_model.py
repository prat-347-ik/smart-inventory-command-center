# app/ml/regression_model.py
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score
from typing import List, Tuple

class DemandLinearRegression:
    """
    A wrapper around Scikit-Learn's LinearRegression specialized for 
    recursive time-series forecasting.
    
    Attributes:
        model (LinearRegression): The underlying sklearn model.
        r2_score (float): The R-squared score of the fitted model (Explanation metric).
        feature_order (List[str]): strict order of features expected by the model.
    """

    def __init__(self):
        self.model = LinearRegression()
        self.r2_score = 0.0
        # CRITICAL: These must match the order in Feature Engineering (Phase 3)
        self.feature_order = ['lag_1', 'lag_7', 'lag_14', 'rolling_mean_7', 'trend_index']

    def train(self, X: pd.DataFrame, y: pd.Series) -> None:
        """
        Trains the model on historical data.
        
        Args:
            X (pd.DataFrame): Feature matrix (must contain columns in self.feature_order).
            y (pd.Series): Target vector (actual daily demand).
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
        """Standard prediction for a batch of feature vectors."""
        return self.model.predict(X[self.feature_order])

    def forecast_recursive(self, recent_history: List[float], horizon: int = 7) -> List[float]:
        """
        Generates future predictions iteratively.
        
        Mechanism:
        1. Calculate features for Day T+1 using Day T data.
        2. Predict Demand for Day T+1.
        3. Append Predicted Demand to history (treating it as 'real').
        4. Repeat for Day T+2 using T+1 (predicted) data.
        
        Args:
            recent_history (List[float]): List of actual 'total_units_sold'. 
                                          Must be at least 14 days long (max lag).
            horizon (int): Number of days to forecast.

        Returns:
            List[float]: Predicted demand for the next 'horizon' days.
        """
        # Create a working buffer to avoid mutating original data
        history_buffer = list(recent_history)
        predictions = []

        # Minimum required history is determined by the largest lag (14)
        if len(history_buffer) < 14:
            raise ValueError("Insufficient history for forecasting. Need at least 14 days.")

        for _ in range(horizon):
            # --- Dynamic Feature Engineering (Mini-Version) ---
            # We must replicate the logic from Phase 3 here on the fly
            
            # 1. Lags
            # lag_1 is the last known value (T)
            lag_1 = history_buffer[-1]
            lag_7 = history_buffer[-7]
            lag_14 = history_buffer[-14]

            # 2. Rolling Mean (7 Day)
            # In training, we used shift(1).rolling(7).
            # For T+1 prediction, the input window is T-6 to T (inclusive).
            rolling_mean_7 = np.mean(history_buffer[-7:])

            # 3. Trend Index
            # (Lag_1 - Lag_7) / 7
            trend_index = (lag_1 - lag_7) / 7.0

            # Construct feature vector [1, 5]
            features_vector = np.array([[
                lag_1, lag_7, lag_14, rolling_mean_7, trend_index
            ]])
            
            # --- Predict ---
            # Extract scalar value, ensure non-negative demand
            predicted_demand = float(self.model.predict(features_vector)[0])
            predicted_demand = max(0.0, predicted_demand)

            predictions.append(predicted_demand)

            # --- Recursion Step ---
            # Add prediction to buffer so next iteration sees it as 'lag_1'
            history_buffer.append(predicted_demand)

        return predictions