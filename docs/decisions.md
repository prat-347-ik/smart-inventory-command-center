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
