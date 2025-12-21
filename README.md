

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
✔ Feature engineering layer (ML-ready signals)
✔ **Forecasting engine with explainable ML (Phase 4)**
✔ **Forecast persistence & read-optimized API**

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
Forecasting Engine (Linear Regression)
   ↓
Persisted Forecasts (Read-Optimized)
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

> **Features matter more than algorithms.**

---

## Forecasting Engine (Phase 4)

The forecasting engine generates **explainable, multi-day demand predictions** using engineered time-series features.

### Model Design

* **Algorithm**: Linear Regression (Scikit-Learn)
* **Training**: On-the-fly per SKU
* **Forecasting Strategy**: Recursive multi-step forecasting
* **Confidence Metric**: R² score (training-based, MVP)

### Key Characteristics

* Explainable feature weights
* Deterministic predictions
* No black-box models
* Safe for low-data scenarios (minimum history enforced)

### Forecast Lifecycle

1. Historical daily snapshots are loaded (OLAP)
2. Feature engineering pipeline is applied
3. Regression model is trained per SKU
4. Future demand is predicted for a configurable horizon
5. Forecasts are **persisted** and reused

---

## Forecast API (Read Path)

Forecasts are exposed via a **read-only, low-latency API**.

```http
GET /api/forecast/{sku}
```

### Behavior

* Returns the latest persisted forecast
* Does not trigger model training
* Ensures consistent, reproducible results for dashboards

---
🔄 Model Lifecycle & Forecast Execution (Important Clarifications)
Model Lifecycle (Training & Persistence)

For the current MVP implementation:

Forecasting models are trained on-the-fly per SKU when a forecast is generated.

Trained models are not persisted or versioned.

Only the forecast outputs (predictions + confidence score) are stored in the database.

This design was chosen intentionally to:

Keep the system simple and explainable

Avoid premature model registry complexity

Support rapid iteration during development

In a production-grade system, trained models could be versioned and persisted (e.g., model registry, serialized artifacts) to support reuse, comparison, and offline evaluation.

Forecast Triggering Strategy

In the current implementation:

Forecast generation is triggered manually or via script (e.g., trigger_forecast.py).

This allows controlled testing and verification of the full pipeline:

OLAP read → feature engineering → ML → persistence

This approach is sufficient for MVP validation and development.

In a production environment, forecast generation would typically be automated using a scheduler (e.g., cron jobs, Airflow, or a workflow orchestrator) to run periodically or in response to new data availability.

Design Philosophy Behind These Choices

These decisions reflect a deliberate MVP-first strategy:

Prioritize correctness, explainability, and architecture clarity

Defer infrastructure-heavy components until the core pipeline is validated

Ensure every part of the system can be reasoned about and debugged easily

## Tech Stack

### Backend

* Python 3.9+
* FastAPI
* Motor (Async MongoDB)
* Pandas, NumPy
* Scikit-Learn (Linear Regression)

### Database

* MongoDB Atlas

  * Replica Set
  * Change Streams enabled

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
* Separate data ingestion, transformation, and prediction clearly
* Treat documentation and architecture as first-class deliverables

---


