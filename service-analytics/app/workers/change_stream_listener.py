import asyncio
from app.core.db import db
from app.core.config import settings
from app.utils.logger import logger
from app.services.etl_service import process_new_order 

async def watch_orders():
    """
    Continously watches the 'orders' collection for new inserts.
    """
    logger.info(f"👀 Change Stream Listener started. Watching: {settings.COLLECTION_ORDERS}")
    
    # Ensure DB is connected (in case this is run as a standalone script)
    if db.client is None:
        db.connect()

    collection = db.get_db()[settings.COLLECTION_ORDERS]

    try:
        # Watch the collection for changes
        # pipeline=[{'$match': ...}] filters only for 'insert' operations
        pipeline = [{"$match": {"operationType": "insert"}}]
        
        async with collection.watch(pipeline) as stream:
            async for change in stream:
                order_data = change["fullDocument"]
                order_id = order_data.get("order_id", "UNKNOWN")
                
                logger.info(f"⚡ Event Detected: New Order {order_id}")

                # --- THIS IS THE MISSING PIECE ---
                await process_new_order(order_data)
                # --------------------------------
                
                # TODO: In Phase 2, we will call 'process_new_order(order_data)' here
                # await etl_service.process_new_order(order_data)

    except asyncio.CancelledError:
        logger.warning("Change Stream stopped manually.")
    except Exception as e:
        logger.error(f"❌ Change Stream Error: {e}")
        # In production, we would add retry logic here (backoff strategy)