import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Service Info
    PROJECT_NAME: str = "Inventory Analytics Service"
    VERSION: str = "1.0.0"
    
    # Database (Load from .env)
    MONGO_URI: str
    DB_NAME: str = "inventory_analytics"
    
    # Collection Names (Constants)
    COLLECTION_ORDERS: str = "orders"  # We read from this (Operational)
    COLLECTION_RAW_EVENTS: str = "raw_sales_events"
    COLLECTION_DAILY_SNAPSHOTS: str = "daily_sales_snapshots"
    COLLECTION_FORECASTS: str = "demand_forecasts"
    COLLECTION_PRODUCTS: str = "products"  # For SKU lookup
    
    # ML Config
    MODEL_VERSION: str = "v1.0_linear"

    class Config:
        env_file = ".env"

settings = Settings()