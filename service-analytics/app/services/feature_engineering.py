# app/services/feature_engineering.py
import pandas as pd
import numpy as np
from typing import List, Dict

class FeatureEngineer:
    """
    Transforms raw inventory snapshots into ML-ready features.
    Focus: Lags, Rolling Windows, and Trends.
    """

    def __init__(self, raw_data: pd.DataFrame):
        # Ensure we work on a copy to avoid SettingWithCopy warnings
        self.df = raw_data.copy()
        
        # Ensure date is datetime
        if 'date' in self.df.columns:
            self.df['date'] = pd.to_datetime(self.df['date'])

    def _add_lags(self, target_col='quantity', lags=[1, 7, 14]):
        """
        Creates past-value features. 
        Lag 1 = Yesterday's stock. Lag 7 = Last week's stock.
        """
        for lag in lags:
            self.df[f'lag_{lag}'] = self.df.groupby('sku_id')[target_col].shift(lag)
        return self

    def _add_rolling_features(self, target_col='quantity', window=7):
        """
        Creates rolling mean.
        CRITICAL: We shift by 1 before rolling to prevent data leakage.
        We cannot use today's number to predict today's number.
        """
        # Calculate 7-day rolling mean of the PREVIOUS days
        self.df[f'rolling_mean_{window}'] = (
            self.df.groupby('sku_id')[target_col]
            .shift(1) # Move data down 1 step so window includes yesterday, not today
            .rolling(window=window)
            .mean()
        )
        return self

    def _add_trend_index(self):
        """
        Calculates a simple slope trend index.
        Formula: (Yesterday's Value - Value 7 Days Ago) / 7
        Positive = Stock building up. Negative = Stock depleting.
        """
        # We rely on lags we just created
        if 'lag_1' not in self.df.columns or 'lag_7' not in self.df.columns:
            raise ValueError("Lags must be generated before Trend Index.")

        # Simple linear slope over the last week
        self.df['trend_index'] = (self.df['lag_1'] - self.df['lag_7']) / 7
        return self

    def generate_features(self) -> pd.DataFrame:
        """
        Master pipeline execution.
        """
        # 1. Sort by SKU and Date (Time series strict requirement)
        self.df.sort_values(by=['sku_id', 'date'], inplace=True)

        # 2. Build Features
        self._add_lags(lags=[1, 7, 14])
        self._add_rolling_features(window=7)
        self._add_trend_index()

        # 3. Clean NaN (The first 14 days of data will be null due to lag_14)
        # ML models generally crash on NaNs.
        ml_ready_df = self.df.dropna().reset_index(drop=True)

        return ml_ready_df