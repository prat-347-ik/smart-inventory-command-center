# Intelligent Supply Chain / Inventory Command Center

## Overview
A microservices-based inventory analytics platform that separates real-time operations
from analytical and forecasting workloads.

The system mirrors real-world enterprise inventory architectures using event-driven design
and data warehousing principles.

## Architecture
- Service A (Node.js): Operational core (OLTP)
- Service B (Python + FastAPI): Analytics and forecasting engine (OLAP)
- MongoDB Atlas: Shared persistence layer with logical separation

## Current Implementation Status
✔ Event-driven analytics pipeline  
✔ MongoDB Change Streams integration  
✔ Immutable raw events data lake  
✔ Daily aggregated sales fact table  

🚧 Forecasting and feature engineering in progress

## Analytics Pipeline
1. Orders written by Service A
2. MongoDB Change Streams capture events
3. Raw events stored immutably
4. Daily sales snapshots generated asynchronously

## Tech Stack
**Backend**
- Python 3.9+
- FastAPI
- Motor (Async MongoDB)
- Pandas, NumPy

**Database**
- MongoDB Atlas (Replica Set)

## Why This Architecture
- Prevents analytical workloads from blocking real-time operations
- Enables scalable forecasting pipelines
- Matches industry-grade data warehouse design


## How to Run (Service A)
```bash
cd service-operational
npm install
npm run dev
```

## How to Run (Service B)
```bash
cd service-analytics
pip install -r requirements.txt
uvicorn app.main:app --reload
