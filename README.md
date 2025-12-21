
# 🧠 Intelligent Supply Chain / Inventory Command Center

> **Status:** MVP Complete (Dockerized Backend)
> **Stack:** Node.js (OLTP), Python (OLAP), MongoDB Atlas, Docker, Socket.io

## 📖 Overview

A microservices-based inventory analytics platform that separates real-time operations
from analytical and forecasting workloads.

The system mirrors real-world enterprise inventory architectures using **event-driven design**, **data warehousing**, and **explainable machine learning principles**.

---

## 🏗️ Architecture

The system follows a **Microservices** pattern with two distinct services sharing a data layer, fully orchestrated via Docker.

| Service | Technology | Responsibility |
| :--- | :--- | :--- |
| **Service A (Operational)** | Node.js + Express | Handles high-throughput CRUD (Orders, Products), Auth, and Real-time WebSockets. |
| **Service B (Analytics)** | Python + FastAPI | Listens to data changes asynchronously to retrain models and generate forecasts. |
| **Infrastructure** | Docker Compose | Orchestrates services with internal networking and environment injection. |
| **Database** | MongoDB Atlas | Shared persistence layer with logical OLTP / OLAP separation. |

This design ensures heavy analytical workloads never block real-time user actions.

---

## 🚀 How to Run (Docker)

The entire backend infrastructure is containerized. You do not need Node.js or Python installed locally, only Docker.

### 1. Prerequisites
* **Docker Desktop** installed & running.
* A `.env` file in the `infrastructure/` folder containing your `MONGO_URI`.

### 2. Start the System
```bash
cd infrastructure
docker-compose up --build -d

```

### 3. Verify Connectivity

* **Operational API (Node):** `http://localhost:4000/health` (or check logs)
* **Analytics API (Python):** `http://localhost:8000/health` (via internal Docker network)

> **Note:** Service B (Python) is accessible to Service A via the internal hostname `http://service-analytics:8000`.

---

## ✅ Current Implementation Status

### Completed

✔ Event-driven analytics pipeline (CDC via MongoDB Change Streams)
✔ Immutable raw sales events data lake
✔ Daily aggregated sales fact table (OLAP)
✔ Feature engineering layer (ML-ready signals)
✔ **Forecasting engine with explainable ML (Phase 4)**
✔ **Forecast persistence & read-optimized API**
✔ **Full Dockerization of Backend Services**

---

## 📊 Analytics Pipeline (Deep Dive)

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

## 🛠️ Feature Engineering (Phase 3)

The feature engineering layer converts aggregated business data into **explainable numerical signals** suitable for machine learning.

### Implemented Features

* **Lag features (1, 7, 14 days):** Capture short-term memory, weekly seasonality, and medium-term momentum.
* **7-day rolling mean (leakage-safe):** Smooths daily noise using past-only data.
* **Trend index (directionality):** Captures demand momentum using recent historical change.

### Guarantees

* Stateless & deterministic processing
* No database access
* No data leakage
* Numeric-only, non-null ML-ready output

> **"Features matter more than algorithms."**

---

## 🔮 Forecasting Engine (Phase 4)

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

## 📡 Forecast API (Read Path)

Forecasts are exposed via a **read-only, low-latency API**.

```http
GET /api/forecast/{sku}

```

### Behavior

* Returns the latest persisted forecast
* Does not trigger model training
* Ensures consistent, reproducible results for dashboards

---

## 🔄 Model Lifecycle & Design Decisions

### Model Training & Persistence

For the current MVP implementation:

* **On-the-fly Training:** Forecasting models are trained per SKU when a forecast is generated.
* **No Model Storage:** Trained models are not persisted; only the **forecast outputs** (predictions + confidence score) are stored.

**Why?**

* Keeps the system simple and explainable.
* Avoids premature model registry complexity.
* Supports rapid iteration during development.

### Forecast Triggering Strategy

* **Current:** Forecast generation is triggered manually or via script to allow controlled testing of the pipeline (OLAP read → feature engineering → ML → persistence).
* **Future (Production):** Automated using a scheduler (e.g., cron jobs, Airflow) to run periodically.

---

## 💻 Tech Stack

### Infrastructure

* **Docker & Docker Compose**
* **MongoDB Atlas** (Replica Set + Change Streams)

### Service A (Operational)

* Node.js
* Express
* Socket.io (Real-time updates)
* Mongoose

### Service B (Analytics)

* Python 3.11 (Slim Image)
* FastAPI
* Motor (Async MongoDB)
* Pandas, NumPy
* Scikit-Learn (Linear Regression)

---

## 🎯 Project Philosophy

* **Finish MVP cleanly** before adding complexity.
* **Prefer explainable models** over black-box accuracy.
* **Separate** data ingestion, transformation, and prediction clearly.
* **Treat documentation** and architecture as first-class deliverables.

---

