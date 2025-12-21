# app/main.py
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.core.db import db
from app.utils.logger import logger
from app.workers.change_stream_listener import watch_orders
from app.api.forecast import router as forecast_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- Startup ---
    logger.info("🚀 Analytics Service starting up...")
    
    # 1. Connect to Database
    db.connect()
    
    # 2. Start Background Worker (Phase 1: Change Stream)
    # We run this as a non-blocking background task
    loop = asyncio.get_event_loop()
    change_stream_task = loop.create_task(watch_orders())
    
    yield
    
    # --- Shutdown ---
    logger.info("🛑 Analytics Service shutting down...")
    
    # 3. Graceful Cleanup
    change_stream_task.cancel()
    try:
        await change_stream_task
    except asyncio.CancelledError:
        logger.info("✅ Change stream listener stopped gracefully")
        
    db.close()

app = FastAPI(
    title="Intelligent Inventory Analytics API",
    version="1.0.0",
    lifespan=lifespan
)

# Register Routes
app.include_router(forecast_router, prefix="/api/forecast", tags=["Forecasting"])

# Health Check
@app.get("/health", tags=["System"])
async def health_check():
    """
    Simple health check for k8s/external monitoring.
    Checks if the service is up and DB client is initialized.
    """
    db_status = "connected" if db.client else "disconnected"
    return {
        "status": "ok",
        "database": db_status,
        "service": "analytics-engine"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8001, reload=True)