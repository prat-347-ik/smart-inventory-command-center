# Data Flow — Write Path (Real-Time → Analytics)

## Step 1: Order Creation
- A new order is created in Service A (Node.js)
- Order is written to the `orders` collection in MongoDB (OLTP)

## Step 2: Change Data Capture
- MongoDB emits a change event (insert)
- Analytics Service listens via Change Streams

## Step 3: Raw Event Storage (Data Lake)
- Each order event is transformed into a raw sales event
- Stored in `raw_sales_events`
- Data is append-only and immutable

## Step 4: Aggregation
- Raw events are aggregated by:
  - date
  - product SKU
- Results are stored in `daily_sales_snapshots`

## Design Guarantees
- Operational system is never blocked
- Analytics can be replayed if logic changes
- Aggregations are idempotent

---

# Data Flow — Read Path (Forecast Consumption)

## Step 5: Forecast Request
- Service A (Node.js) requests demand forecasts via:
  GET /predict/{sku}?days=N

## Step 6: Forecast Cache Check
- Analytics service checks the `demand_forecasts` collection
- Forecasts are validated against:
  - time-to-live (TTL)
  - model version
  - aggregation version
  - requested horizon

## Step 7: Forecast Generation (If Required)
- If no valid forecast exists:
  - Aggregated data is loaded
  - Features are generated
  - A per-SKU regression model is trained
  - Recursive multi-day forecasts are produced
  - Results are persisted

## Step 8: Response to Consumer
- A structured, business-ready forecast response is returned
- No ML artifacts or raw data are exposed
