
# Intelligent Supply Chain / Inventory Command Center

## Overview

A microservices-based inventory analytics platform that separates real-time operations
from analytical and forecasting workloads.

The system mirrors real-world enterprise inventory architectures using **event-driven design**, **data warehousing**, and **explainable machine learning principles**.

---

## Architecture

* **Service A (Node.js)**: Operational core (OLTP, real-time writes, WebSockets)
* **Service B (Python + FastAPI)**: Analytics & forecasting engine (OLAP)
* **MongoDB Atlas**: Shared persistence layer with logical OLTP / OLAP separation

This design ensures heavy analytical workloads never block real-time user actions.

---

## Current Implementation Status

### ✅ Completed

✔ Event-driven analytics pipeline (CDC via MongoDB Change Streams)
✔ Immutable raw sales events data lake
✔ Daily aggregated sales fact table (OLAP)
✔ **Feature engineering layer (ML-ready signals)**

### 🚧 In Progress

🚧 Forecasting engine (Linear Regression – Phase 4)
🚧 Forecast persistence & reuse

---

## Analytics Pipeline (Implemented)

```text
Orders (OLTP)
   ↓
MongoDB Change Streams
   ↓
Raw Sales Events (Immutable Data Lake)
   ↓
Daily Sales Snapshots (Fact Table)
   ↓
Feature Engineering (ML-ready signals)
   ↓
Forecasting Engine (Phase 4)
```

---

## Feature Engineering (Phase 3)

The feature engineering layer converts aggregated business data into **explainable numerical signals** suitable for machine learning.

### Implemented Features

* **Lag features (1, 7, 14 days)**
  Capture short-term memory, weekly seasonality, and medium-term momentum.
* **7-day rolling mean (leakage-safe)**
  Smooths daily noise using past-only data.
* **Trend index (directionality)**
  Captures demand momentum using recent historical change.

### Guarantees

* Stateless & deterministic processing
* No database access
* No data leakage
* Numeric-only, non-null ML-ready output

This reinforces the principle:

> **Features matter more than algorithms.**

---

## Tech Stack

### Backend

* Python 3.9+
* FastAPI
* Motor (Async MongoDB)
* Pandas, NumPy
* Scikit-Learn (upcoming – Phase 4)

### Database

* MongoDB Atlas (Replica Set, Change Streams enabled)

---

## Why This Architecture

* Prevents analytical workloads from blocking real-time operations
* Enables scalable, replayable analytics pipelines
* Supports explainable and auditable ML predictions
* Mirrors enterprise-grade inventory & data warehouse systems

---

## How to Run (Service A – Operational)

```bash
cd service-operational
npm install
npm run dev
```

---

## How to Run (Service B – Analytics)

```bash
cd service-analytics
pip install -r requirements.txt
uvicorn app.main:app --reload
```

---

## Project Philosophy

* Finish MVP cleanly before adding complexity
* Prefer explainable models over black-box accuracy
* Treat documentation and architecture as first-class deliverables

---
