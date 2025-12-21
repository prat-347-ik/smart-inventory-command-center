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
