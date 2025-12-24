# Analytics Pipeline Status

## Completed Phases

### Phase 0 — Foundation
✔ Environment configuration  
✔ Async MongoDB connection using Motor  
✔ Structured logging  

### Phase 1 — Change Data Capture
✔ MongoDB Change Stream listener  
✔ Insert-only event capture  
✔ Fault-tolerant background worker  

### Phase 2 — Aggregation Layer
✔ Raw sales events data lake  
✔ Daily sales snapshots (fact table)  
✔ Idempotent aggregation logic  

Perfect — this is exactly the **right time** to document Phase 3.
Good documentation here will save you **hours later** and makes your project **interview-ready**.

Below is **professional, copy-paste ready documentation** for **Phase 3 — Feature Engineering**, written in the same tone used in real production repos.

You can place this in:

```
docs/analytics-pipeline.md
```

or as a separate file:

```
docs/feature-engineering.md
```

---

# Phase 3 — Feature Engineering

## Purpose

The Feature Engineering phase transforms aggregated business data into **machine-learning-ready numerical signals**.

While earlier phases focus on *data correctness* and *aggregation*, this phase focuses on **predictive usefulness**.

> Well-designed features contribute more to forecast accuracy than complex algorithms.

---

## Input Data

**Source**

* `daily_sales_snapshots` (Fact Table)

**Scope**

* Data is processed **per product SKU**
* Historical records only (no future data)

**Expected Columns**

| Column Name        | Description                        |
| ------------------ | ---------------------------------- |
| `date_key`         | Date of aggregation (`YYYY-MM-DD`) |
| `total_units_sold` | Total units sold on that day       |

The input data is assumed to be:

* Clean
* Aggregated
* Time-indexed
* Ordered by day

No database access is performed in this phase.

---

## Output Data

The Feature Engineering module produces a **Pandas DataFrame** that:

* Contains only numeric feature columns
* Has no missing (`null`) values
* Is ordered chronologically
* Can be directly consumed by Scikit-Learn models

This output acts as the **single source of truth** for all forecasting models.

---

## Engineered Features

### 1. Lag Features

**Generated**

* `lag_1`
* `lag_7`
* `lag_14`

**Meaning**
Lag features capture historical dependency in demand.

| Feature  | Represents           |
| -------- | -------------------- |
| `lag_1`  | Yesterday’s demand   |
| `lag_7`  | Demand one week ago  |
| `lag_14` | Demand two weeks ago |

**Why This Matters**
Demand is auto-correlated — recent sales strongly influence near-future sales.

---

### 2. Rolling Mean (7-Day)

**Generated**

* `rolling_mean_7`

**Meaning**
Represents the smoothed demand level over the previous 7 days.

**Why This Matters**
Daily sales data is noisy due to:

* Promotions
* Weekends
* One-off spikes

Rolling averages help the model learn the **underlying trend** instead of short-term noise.

---

### 3. Trend Index (Linear Slope)

**Generated**

* `trend_index`

**Meaning**
A simple linear slope representing the direction of demand over time.

| Value     | Interpretation       |
| --------- | -------------------- |
| Positive  | Demand is increasing |
| Negative  | Demand is decreasing |
| Near zero | Stable demand        |

**Why This Matters**
Inventory decisions depend heavily on **direction**, not just magnitude.

This feature is:

* Explainable
* Computationally cheap
* Interview-friendly

---

## Data Leakage Prevention

To ensure valid forecasts:

* All lag and rolling features are **shifted**
* No future information leaks into the training data
* Rows without sufficient historical context are dropped

This guarantees realistic training conditions.

---

## Design Principles

This phase strictly follows these architectural rules:

1. **Stateless processing**

   * Same input always produces same output
2. **No database access**
3. **No model training or inference**
4. **Pandas-only transformations**
5. **Clear separation from forecasting logic**

This separation enables:

* Easier testing
* Model experimentation
* Long-term maintainability

---

## Validation Checkpoint

Before passing data to the forecasting engine, the following must be true:

* All feature columns are numeric
* No null values exist
* Data is sorted by date
* Target variable is clearly separated

This confirms the dataset is **ML-ready**.

---

## Pipeline Position

```text
Raw Events
   ↓
Daily Sales Snapshots
   ↓
Feature Engineering  ← (Phase 3)
   ↓
Forecasting Models
```

---

## Status

✔ Phase 3 implemented
✔ Feature set finalized
✔ Ready for forecasting engine integration

---

## Notes for Future Enhancements

Possible extensions (not part of MVP):

* Holiday indicators
* Seasonality flags
* Volatility metrics
* SKU category embeddings

These are intentionally deferred to keep the MVP focused and explainable.

---

## Why This Phase Is Critical

This phase bridges the gap between:

* **Business data** and **machine learning**
* **Facts** and **predictions**

A clean Feature Engineering layer ensures that forecasting models remain:

* Simple
* Interpretable
* Reliable

---

# Phase 4 — Forecasting Engine

### Goal

Generate **explainable, SKU-level demand forecasts** using a lightweight ML model that is:

* fast to train
* safe to operate
* easy to reason about
* suitable for production backends

This phase focuses on **engineering correctness**, not algorithmic complexity.

---

## Overview

The forecasting engine is implemented as a **stateless service layer** that trains a **separate Linear Regression model per SKU** on demand.

Key characteristics:

* No long-lived model storage (MVP)
* No cross-SKU coupling
* Deterministic, repeatable forecasts
* Recursive multi-day prediction
* Simple confidence metric for interpretability

---

## Forecasting Flow

```text
Load Aggregated Sales History (per SKU)
            ↓
Build Feature Matrix
(lag_1, lag_7, lag_14, rolling_mean_7, trend_index)
            ↓
Train Linear Regression Model
            ↓
Evaluate Model Fit (R² score)
            ↓
Generate Day T+1 Prediction
            ↓
Append Prediction to History
            ↓
Recompute Features for Next Day
            ↓
Repeat Until Forecast Horizon Reached
```

---

## Why Recursive Forecasting?

Instead of predicting all future days in one step, the system:

* predicts **one day at a time**
* feeds each prediction back into the feature set
* preserves temporal dependencies

This mirrors how real forecasting systems operate when future ground truth is unavailable.

---

## Model Choice: Linear Regression

The project intentionally uses **Linear Regression** for the MVP.

### Why this is a good engineering choice

* Fully explainable
* Extremely fast to train
* Stable with small datasets
* Easy to debug and reason about
* No hyperparameter tuning required

This ensures the focus remains on **pipeline correctness and system design**, not model complexity.

---

## Confidence Scoring

Each forecast includes a **confidence score** derived from the model’s **R² value** on historical data.

While simple, this provides:

* a sanity check for predictions
* transparency for downstream services
* a foundation for future improvements

The confidence score is treated as **informational**, not probabilistic.

---

## System Boundaries

To maintain clean separation of concerns:

The forecasting engine **does**:

* consume feature-engineered data
* train a model per SKU
* generate multi-day forecasts
* return numeric predictions + confidence

The forecasting engine **does not**:

* query raw databases directly
* perform feature engineering
* expose APIs
* manage caching or persistence logic

---

## Why This Phase Matters

Phase 4 demonstrates:

* practical ML engineering
* feature-driven forecasting
* recursive prediction logic
* explainability-first design

This phase bridges the gap between **data preparation** and **production analytics**, making the system interview-ready without unnecessary complexity.

---


# Phase 5 — Analytics API Layer

### Goal

Expose **forecasting results** from the analytics service in a **stable, cache-aware, read-only API** that can be safely consumed by the operational backend (Node.js) and frontend dashboards.

This phase turns the analytics engine into a **production-facing service**, not an internal script.

---

## Overview

The Analytics API is designed with the following principles:

* **No blind recomputation** — forecasts are reused when possible
* **Deterministic GET requests** — same input, same output
* **Clear separation of concerns** — API orchestration only
* **Explainable responses** — business-ready, not ML-internal data

Node.js handles *real-time operations* (“Now”), while this service exposes *predictive insights* (“Future”).

---

## Forecast Endpoint

### Endpoint

```http
GET /predict/{sku}?days=7
```

### Description

Returns a **multi-day demand forecast** for a given product SKU.

The endpoint first checks whether a **valid, up-to-date forecast** already exists.
If a cached forecast is stale or insufficient, it is **regenerated and persisted** before being returned.

```

         Client Request
                ↓
     Validate SKU & Query Parameters
                ↓
       Lookup Cached Forecast
                ↓
┌──────────────────────────────────────┐
│ Is a valid & up-to-date forecast     │
│ available for this SKU and horizon?  │
└──────────────┬───────────────────────┘
               │ Yes
               ↓
      Return Cached Forecast
               │
               │ No
               ↓
     Regenerate Forecast
               ↓
   Persist Forecast to Database
               ↓
        Return New Forecast
```        


This ensures:

* Low latency for repeated reads
* Predictable system behavior
* Controlled ML execution

---

## Forecast Staleness Rules

A forecast is considered **stale** if **any** of the following conditions are met:

* Forecast age exceeds a configured TTL (e.g. 24 hours)
* Aggregation logic version has changed
* Model version has changed
* Cached forecast horizon is shorter than requested

This design enables **safe evolution** of:

* aggregation logic
* feature engineering
* forecasting models

without breaking consumers.

---

## Response Schema

The API returns a **business-consumable forecast**, not raw ML artifacts.

### Example Response

```json
{
  "sku": "DELL-MON-24",
  "forecast_horizon_days": 7,
  "generated_at": "2025-12-20T10:15:00Z",
  "model_version": "lr_v1",
  "confidence_score": 0.82,
  "predictions": [
    { "date": "2025-12-21", "expected_units": 42 },
    { "date": "2025-12-22", "expected_units": 39 }
  ],
  "metadata": {
    "data_points_used": 120,
    "aggregation_version": "v1.0",
    "notes": "Recursive linear regression forecast"
  }
}
```

### Why This Matters

* Frontend dashboards can plot results immediately
* Node.js can forward or cache responses safely
* ML internals remain fully encapsulated
* Response contract remains stable over time

---

## API Design Constraints

To maintain reliability and clarity, the API layer **does not**:

* Perform feature engineering
* Train models directly
* Run Pandas or Scikit-Learn code
* Execute MongoDB aggregations

All heavy computation is delegated to **internal services**, keeping the API thin and predictable.

---

## Service Bootstrap & Lifecycle

### Startup Behavior

On application startup:

* A background **Change Data Capture (CDC) listener** is initialized
* The listener runs asynchronously and does not block the API
* Structured logs are emitted for observability

This allows the analytics service to **ingest events and serve forecasts concurrently**.

---

# Phase 6 — Model Tuning & Signal Enhancement

### Goal

Improve **forecast explainability and confidence** by addressing **data realism and signal quality**, without increasing model complexity.

This phase focuses on **why the model performs the way it does**, not on replacing the algorithm.

> The objective is to validate the ML pipeline, not to maximize benchmark accuracy.

---

## Motivation

During early testing, the forecasting model produced a **low confidence score (R² ≈ 0.37)**.

This was **not caused by model limitations**, but by the nature of the **synthetic data** used for testing:

- High random variance
- Weak seasonality
- Poor autocorrelation
- Features with little predictive power

This phase exists to **separate data issues from model issues**.

---

## Strategy

Instead of switching algorithms, Phase 6 applies a **data-first tuning approach**.

### Core Principle

> **Better data beats better models.**

The model remains unchanged (Linear Regression).  
All improvements come from **improving the signal-to-noise ratio** in training data.

---

## Synthetic Data Redesign

The seeding process was rewritten to generate **structured, learnable demand signals**.

### Injected Signal Components

| Component | Purpose |
|--------|--------|
| Linear Trend | Captures long-term demand growth or decay |
| Weekly Seasonality | Aligns with `lag_7` and rolling features |
| Autocorrelation | Ensures short-term momentum (`lag_1`) |
| Controlled Noise | Preserves realism without destroying patterns |
| Constraints | Prevents negative or unrealistic demand |

### Noise Design

- Gaussian noise (`np.random.normal`)
- Low standard deviation
- No discrete random jumps

This ensures the data remains:
- Predictable
- ML-safe
- Representative of retail demand behavior

---

## Results

### Observed Outcome

- **Confidence Score (R²): ~0.95** on structured synthetic data

### Interpretation

This confirms that:

- Feature engineering logic is correct
- Recursive forecasting behaves as expected
- The earlier low R² was a **data design issue**, not a modeling issue

> High R² here validates the pipeline — **not real-world accuracy**.

---

## Important Clarification

The improved confidence score **does not represent production performance**.

In real-world data, demand is affected by:
- Promotions
- Stockouts
- Holidays
- External market forces

These factors reduce explainability and are **intentionally excluded** from the MVP.

Phase 6 validates **system correctness**, not business guarantees.

---

## What This Phase Does NOT Do

By design, Phase 6 does **not** introduce:

- Deep learning models
- Prophet / ARIMA
- Hyperparameter optimization
- GPU acceleration
- Online learning

Explainability, stability, and architectural clarity take priority.

---

## Engineering Takeaways

- Data quality dominates ML performance
- Feature alignment matters more than algorithm choice
- R² must be interpreted in context
- Synthetic data should validate logic, not simulate reality perfectly

---

## Pipeline Position

```text
Raw Events
   ↓
Daily Sales Snapshots
   ↓
Feature Engineering
   ↓
Forecasting Engine
   ↓
Model Tuning & Validation  ← (Phase 6)

---

## Health Check Endpoint

### Endpoint

```http
GET /health
```

### Purpose

Provides a lightweight status check for:

* Service availability
* MongoDB connectivity
* Basic operational readiness

### Example Response

```json
{
  "service": "analytics-service",
  "status": "healthy",
  "mongo": "connected",
  "uptime_seconds": 8421
}
```

This endpoint allows the operational backend (Node.js) and deployment tools to verify service health safely.

---

## Why This Phase Is Important

Phase 5 completes the transition from **analytics pipeline** to **analytics service**.

It demonstrates:

* Cache-aware API design
* Safe ML integration into backend systems
* Clear OLTP / OLAP separation
* Production-grade service boundaries

This is the point where the system becomes **consumable, scalable, and interview-ready**.

