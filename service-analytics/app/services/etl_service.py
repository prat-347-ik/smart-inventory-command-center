from datetime import datetime
from app.core.db import db
from app.core.config import settings
from app.utils.logger import logger
from bson import ObjectId

async def process_new_order(order_data: dict):
    """
    Handles the ETL pipeline for a single order event.
    """
    # --- EXTRACT (Read Data) ---
    order_id = order_data.get("order_id")
    items = order_data.get("items", [])
    
    # Parse timestamp safely (Node.js sends ISO strings)
    created_at = order_data.get("createdAt")
    if isinstance(created_at, str):
        created_at = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
    
    db_instance = db.get_db()

    # --- TRANSFORM & LOAD ---
    for item in items:
        product_id = item.get("product_id")
        qty = item.get("qty")
        price = item.get("price_at_sale")

        # 1. Lookup SKU (Required because Orders only have ID)
        # We need the SKU for readable analytics
        product = await db_instance[settings.COLLECTION_PRODUCTS].find_one({"_id": ObjectId(product_id)})
        
        if not product:
            logger.error(f"❌ Product ID {product_id} not found for Order {order_id}")
            continue # Skip this item if product doesn't exist

        sku = product.get("sku")

        # ---------------------------------------------------------
        # ✅ PHASE 1.2 COMPLETE: Write to Data Lake (Raw Events)
        # ---------------------------------------------------------
        raw_event = {
            "event_id": f"{order_id}_{sku}", # Unique Composite Key
            "order_id": order_id,
            "product_sku": sku,
            "quantity": qty,
            "unit_price": price,
            "timestamp": created_at
        }
        
        # 'upsert=True' ensures we don't crash if we process the same event twice
        await db_instance[settings.COLLECTION_RAW_EVENTS].update_one(
            {"event_id": raw_event["event_id"]},
            {"$set": raw_event},
            upsert=True
        )

        # ---------------------------------------------------------
        # ✅ PHASE 2.1 COMPLETE: Aggregate to Fact Table (Snapshots)
        # ---------------------------------------------------------
        date_key = created_at.strftime("%Y-%m-%d") # Group by Day
        snapshot_id = f"{date_key}_{sku}"
        
        await db_instance[settings.COLLECTION_DAILY_SNAPSHOTS].update_one(
            {"_id": snapshot_id},
            {
                "$set": {
                    "date_key": date_key,
                    "product_sku": sku,
                    "aggregation_version": "v1.0",
                    "generated_at": datetime.utcnow()
                },
                "$inc": {
                    # Atomic Increment: Add new numbers to existing totals
                    "total_units_sold": qty,
                    "total_revenue": (price * qty)
                }
            },
            upsert=True
        )

    logger.info(f"✅ Processed Order {order_id} -> Saved to Data Lake & Aggregated Stats")