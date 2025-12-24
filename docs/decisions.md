# Architectural Decisions

## Why Change Streams Instead of API Calls
- Avoids tight coupling between services
- Ensures analytics remains eventually consistent
- No impact on operational latency

## Why Immutable Raw Events
- Supports auditing and debugging
- Enables reprocessing with new business logic
- Mirrors real-world data lake design

## Why Daily Aggregates
- Reduces data volume dramatically
- Optimized for dashboards and ML training
## Why Train Models On-Demand (Stateless ML)

- Avoids model drift caused by stale or long-lived serialized models
- Simplifies deployment by eliminating model storage and migration concerns
- Keeps ML execution deterministic and reproducible for the same input data
- Well-suited for lightweight, per-SKU forecasting models
- Reduces operational complexity during early system evolution (MVP phase)

This approach prioritizes **correctness and simplicity** over premature optimization.


## Why Recursive Forecasting

- Future ground truth is unavailable beyond the next timestep (T+1)
- Recursive prediction preserves temporal dependency between successive days
- Mirrors real-world demand forecasting constraints in production systems
- Allows multi-day horizons without introducing complex sequence models
- Keeps forecasting logic explainable and easy to reason about

Recursive forecasting trades minimal error propagation risk for **clarity and realism**.


## Why Cache Forecasts Instead of Recomputing

- Forecast generation is CPU-bound and should not run on every API request
- GET endpoints must remain fast, predictable, and idempotent
- Prevents recomputation storms under concurrent access
- Enables safe reuse of forecasts across dashboards and services
- Allows explicit control over staleness via TTL and versioning

Caching transforms forecasting from a **compute task** into a **serving task**.


## Why Linear Regression (MVP)

- Fully explainable model behavior and coefficients
- Extremely fast to train per SKU
- Stable with limited historical data
- No hyperparameter tuning required
- Keeps focus on pipeline design rather than algorithmic complexity

The goal is **ML engineering maturity**, not research-level modeling.


## Why These Decisions Matter

- This document captures **intent and tradeoffs**, not implementation details
- Interviewers and reviewers read decision logs before diving into code
- Demonstrates deliberate simplicity instead of accidental limitations
- Provides a clear foundation for future enhancements without redesign

These choices ensure the system remains **understandable, extensible, and production-aligned**.

### Phase 3 — Data Quality & Validation

**Status:** ✔ Completed  
**Objective:** Ensure the analytical dataset is clean, deterministic, and scientifically valid before entering the forecasting stage.

---

#### 1. Data Cleanup & Standardization

**Problem Identified**
- `daily_sales_snapshots` contained mixed-quality records:
  - Legacy test data dated in 2025
  - Valid synthetic data dated in 2024
  - Inconsistent schema versions

This introduced temporal leakage and made the dataset unsuitable for ML training.

**Actions Taken**
- Removed all future-dated and legacy artifacts via a cleanup script
- Enforced a strict historical window:
  - **2024-10-01 → 2024-12-31**
- Verified schema consistency across all remaining documents

**Result**
- Clean, leak-free 90-day historical dataset
- No schema conflicts
- Deterministic input for downstream phases

---

#### 2. Fleet-Wide Deterministic Data Generation

**Action**
- Scaled synthetic data generation from a single SKU to the full **7-SKU product fleet**

**Demand Profiles**
- **High Volume:** `MOU-LOG-01`, `LOGI-MX3S`
- **Mid Volume:** `Moto-Edge-50`, `SONY-XM5`
- **Low Volume:** `SAM-G9-OLED`, `Apple-G9-OLED`

**Generation Guarantees**
- Stable weekday baseline demand
- Weekend uplift
- Holiday uplift
- Light, bounded noise only
- No randomness-dominated behavior

**Outcome**
- **644 records inserted** (92 days × 7 SKUs)
- All records tagged with `aggregation_version: v2.0-fleet`
- Uniform, reproducible dataset across the fleet

---

#### 3. Scientific Validation (Data Unit Test)

**Goal**
- Prove that the dataset contains **learnable signal**, not random noise

**Method**
- Trained a Linear Regression model on a single SKU (`SONY-XM5`)
- Evaluated whether the model could rediscover the original generation rules

**Validation Results**

| Parameter        | Configured | Model Discovered | Result |
|------------------|------------|------------------|--------|
| Baseline Demand  | 30.0 units | 30.19 units      | ✅ Match |
| Weekend Lift     | +20%       | +19.4%           | ✅ Match |
| Holiday Lift     | +50%       | +51.6%           | ✅ Match |

**Conclusion**
- High signal-to-noise ratio confirmed
- Demand patterns are deterministic and ML-learnable
- Dataset is suitable for forecasting algorithms

---

#### 4. Forward Forecast Seeding (January 2025)

**Action**
- Created a dedicated `demand_forecasts` collection

**Logic**
- Projected validated demand patterns into January 2025
- Generated per-SKU forecasts
- Added ±10% upper/lower confidence bounds
- Forecasts versioned and timestamped

**Purpose**
- Enables *Actual vs Predicted* comparisons
- Allows end-to-end pipeline testing
- Supports dashboard development without live production data

---

#### Phase 3 Outcome

✔ Clean historical dataset  
✔ Fleet-wide deterministic demand signals  
✔ Scientific validation via regression recovery  
✔ Forecast-ready data foundation  

Phase 3 establishes **trust in the data**, ensuring Phase 4 evaluates model logic — not data quality.
