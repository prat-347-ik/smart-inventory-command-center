import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.core.db import db
from app.utils.logger import logger
from app.workers.change_stream_listener import watch_orders

@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- Startup ---
    logger.info("🚀 Analytics Service starting up...")
    db.connect()
    
    # Run the Change Stream Listener in the background
    # We store the task so we can cancel it on shutdown if needed
    loop = asyncio.get_event_loop()
    task = loop.create_task(watch_orders())
    
    yield
    
    # --- Shutdown ---
    logger.info("🛑 Analytics Service shutting down...")
    task.cancel() # Stop the listener
    db.close()

app = FastAPI(title="Inventory Analytics API", lifespan=lifespan)

@app.get("/")
async def health_check():
    return {"status": "healthy", "service": "analytics-engine"}