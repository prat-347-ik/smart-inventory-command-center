# app/services/feature_engineering.py
import pandas as pd
import numpy as np
from typing import List, Optional

class InventoryFeatureEngineer:
    """
    Transforms raw daily sales snapshots into ML-ready numeric features.
    
    This pipeline is stateless and deterministic. It focuses on capturing:
    1. Autocorrelation (Lags)
    2. Momentum (Rolling Means)
    3. Directionality (Trend Index)
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
        
        Captures autocorrelation (e.g., Did we sell a lot yesterday? Last week?).
        """
        for lag in lags:
            feature_name = f'lag_{lag}'
            self.df[feature_name] = self.df[self.target_col].shift(lag)

    def _add_rolling_features(self, window: int = 7) -> None:
        """
        Generates a Rolling Mean feature.
        
        CRITICAL: We shift by 1 before rolling. 
        If we are predicting for Day T, we can only see the average of T-1, T-2...
        Including Day T in the average would be data leakage.
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
        
        Formula: (Yesterday's Sales - Sales 7 Days Ago) / 7
        Logic:
          - Positive Value: Upward trend (increasing demand)
          - Negative Value: Downward trend (decreasing demand)
          - Zero: Stable demand
        """
        # Ensure dependencies exist
        if 'lag_1' not in self.df.columns or 'lag_7' not in self.df.columns:
            raise ValueError("Lags must be generated before Trend Index can be calculated.")

        self.df['trend_index'] = (self.df['lag_1'] - self.df['lag_7']) / 7.0

    def transform(self) -> pd.DataFrame:
        """
        Executes the full feature engineering pipeline.

        Returns:
            pd.DataFrame: A cleaned DataFrame containing only numeric features and the target.
                          Rows with NaN values (due to lags/rolling) are dropped.
        """
        # 1. Prepare Structure
        self._preprocess()

        # 2. Generate Features
        self._add_lags(lags=[1, 7, 14])
        self._add_rolling_features(window=7)
        self._add_trend_index()

        # 3. Clean and Filter
        # Remove rows where features couldn't be calculated (e.g., first 14 days)
        ml_ready_df = self.df.dropna()

        # Select only numeric types for Scikit-Learn compatibility
        # We explicitly keep the target column + the new features
        numeric_df = ml_ready_df.select_dtypes(include=[np.number])

        # Reset index for clean usage
        return numeric_df.reset_index(drop=True)