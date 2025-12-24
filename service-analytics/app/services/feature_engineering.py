# service-analytics/app/services/feature_engineering.py
import pandas as pd
import numpy as np
from typing import List, Optional, Set

class InventoryFeatureEngineer:
    """
    Transforms raw daily sales snapshots into ML-ready numeric features.
    
    This pipeline is stateless and deterministic. It focuses on capturing:
    1. Autocorrelation (Lags)
    2. Momentum (Rolling Means)
    3. Directionality (Trend Index)
    4. Seasonality (Calendar & Holiday Context)
    """

    def __init__(self, raw_data: pd.DataFrame, target_col: str = 'total_units_sold', date_col: str = 'date_key'):
        """
        Initialize the engineer with raw data.

        Args:
            raw_data (pd.DataFrame): DataFrame containing history.
            target_col (str): The name of the column containing sales figures.
            date_col (str): The name of the column containing dates.
        """
        # Work on a copy to prevent SettingWithCopy warnings and preserve original data
        self.df = raw_data.copy()
        self.target_col = target_col
        self.date_col = date_col

        # Validation
        required_cols = {self.target_col, self.date_col}
        if not required_cols.issubset(self.df.columns):
            raise ValueError(f"Input DataFrame missing required columns: {required_cols - set(self.df.columns)}")

    def _preprocess(self) -> None:
        """
        Ensures dates are datetime objects and sorts the series chronologically.
        Essential for time-series features to be valid.
        """
        self.df[self.date_col] = pd.to_datetime(self.df[self.date_col])
        self.df.sort_values(by=self.date_col, ascending=True, inplace=True)

    def _add_lags(self, lags: List[int] = [1, 7, 14]) -> None:
        """
        Generates Lag features.
        Lag N = The value of the target column N days ago.
        """
        for lag in lags:
            feature_name = f'lag_{lag}'
            self.df[feature_name] = self.df[self.target_col].shift(lag)

    def _add_rolling_features(self, window: int = 7) -> None:
        """
        Generates a Rolling Mean feature.
        
        CRITICAL: We shift by 1 before rolling to prevent data leakage.
        """
        feature_name = f'rolling_mean_{window}'
        self.df[feature_name] = (
            self.df[self.target_col]
            .shift(1)  # Shift to ensure we only look at PAST data
            .rolling(window=window)
            .mean()
        )

    def _add_trend_index(self) -> None:
        """
        Calculates a Trend Index representing the velocity of sales changes.
        """
        if 'lag_1' not in self.df.columns or 'lag_7' not in self.df.columns:
            raise ValueError("Lags must be generated before Trend Index can be calculated.")

        self.df['trend_index'] = (self.df['lag_1'] - self.df['lag_7']) / 7.0

    def _add_calendar_context(self) -> None:
        """
        Adds deterministic calendar context features.
        
        Feature: is_weekend (Binary)
        Definition: 1 if Saturday(5) or Sunday(6), else 0.
        
        Why: Allows the model to distinguish weekly seasonality (weekend spikes)
             from actual demand trends.

        Safety: This feature is safe for future inference because calendar dates 
                are known in advance (exogenous variables).
        """
        # Calendar Features (contextual, non-lag):
        # - is_weekend
        
        # Calculate day of week (0=Monday, 6=Sunday)
        # Note: _preprocess guarantees self.date_col is datetime type
        day_of_week = self.df[self.date_col].dt.dayofweek
        
        # Create binary feature: 1 for Sat/Sun, 0 otherwise
        self.df['is_weekend'] = (day_of_week >= 5).astype(int)

        # Sanity Check: Ensure strictly binary (0 or 1)
        # Guards against silent dtype corruption or logic errors
        assert self.df['is_weekend'].isin([0, 1]).all(), "is_weekend must be binary (0 or 1)"

    def _add_holiday_context(self) -> None:
        """
        Adds static holiday context features.
        
        Feature: is_holiday (Binary)
        Definition: 1 if date is in the static holiday list, else 0.
        
        Why: Allows the model to account for exogenous demand spikes 
             (e.g., Black Friday, Christmas) separately from organic trends.
             
        Safety: Deterministic and leak-safe. Uses a pre-defined list of dates
                so it can be generated for future forecast horizons.
        """
        # MVP: Static list of major retail holidays (Example years: 2023-2025)
        # In a real production env, this might be injected via config or a library.
        static_holidays: Set[str] = {
            # 2023
            "2023-01-01", "2023-05-29", "2023-07-04", "2023-11-23", "2023-11-24", "2023-12-25",
            # 2024
            "2024-01-01", "2024-05-27", "2024-07-04", "2024-11-28", "2024-11-29", "2024-12-25",
            # 2025
            "2025-01-01", "2025-05-26", "2025-07-04", "2025-11-27", "2025-11-28", "2025-12-25",
        }

        # Convert static strings to datetime for robust comparison
        # (This handles timestamp matching correctly)
        holiday_dates = pd.to_datetime(list(static_holidays))
        
        # Vectorized check: is the date in our list?
        self.df['is_holiday'] = self.df[self.date_col].isin(holiday_dates).astype(int)

    def transform(self) -> pd.DataFrame:
        """
        Executes the full feature engineering pipeline.

        Returns:
            pd.DataFrame: A cleaned DataFrame containing only numeric features and the target.
        """
        # 1. Prepare Structure
        self._preprocess()

        # 2. Generate Features
        self._add_lags(lags=[1, 7, 14])
        self._add_rolling_features(window=7)
        self._add_trend_index()
        self._add_calendar_context()
        self._add_holiday_context()   # <--- Added Step (Holiday Context)

        # 3. Clean and Filter
        # Remove rows where features couldn't be calculated (e.g., first 14 days)
        ml_ready_df = self.df.dropna()

        # Select only numeric types for Scikit-Learn compatibility.
        # 'is_weekend' and 'is_holiday' are ints, so they are included automatically.
        numeric_df = ml_ready_df.select_dtypes(include=[np.number])

        # Reset index for clean usage
        return numeric_df.reset_index(drop=True)