# Analytics Service Architecture (Service B)

## Overview
Service B is the analytical engine of the Intelligent Inventory Command Center.
It is responsible for historical data processing, aggregation, and future demand forecasting.

The service is fully decoupled from real-time operations handled by Service A (Node.js).

## Responsibilities
- Listen to MongoDB Change Streams from the orders collection
- Persist immutable raw sales events
- Aggregate transactional data into analytical fact tables
- Prepare data for machine learning models
- Serve forecast results via internal APIs

## Architectural Pattern
- Microservices-lite
- Event-driven (Change Data Capture)
- Dual-world data model (OLTP vs OLAP)

## Why Python + FastAPI
- Python ecosystem for analytics and ML
- FastAPI for async I/O and internal service communication
- CPU-heavy tasks isolated from real-time traffic
