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