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
