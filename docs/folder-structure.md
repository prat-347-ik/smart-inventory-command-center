
# 🧠 High-Level Repository Structure

```bash
smart-inventory-command-center/
│
├── frontend/                  # React Dashboard (Command Center UI)
├── service-operational/       # Node.js (OLTP, Real-time, Auth)
├── service-analytics/         # Python (OLAP, Forecasting, ETL)
├── infrastructure/            # Docker, Compose, Env configs
├── scripts/                   # One-off scripts (data seeding, mocks)
├── docs/                      # Architecture diagrams & specs
├── README.md                  # Interview-facing documentation
└── .gitignore
```

This already signals **multi-service system design**.

---

# 🎨 1. Frontend (React + Vite)

```bash
frontend/
├── public/
│
├── src/
│   ├── api/                   # API abstraction layer
│   │   ├── operational.api.js
│   │   └── analytics.api.js
│   │
│   ├── components/            # Reusable UI components
│   │   ├── charts/
│   │   │   ├── SalesForecastChart.jsx
│   │   │   └── StockTrendChart.jsx
│   │   ├── tables/
│   │   │   └── InventoryTable.jsx
│   │   └── common/
│   │       ├── Loader.jsx
│   │       └── AlertBadge.jsx
│   │
│   ├── pages/                 # Route-level pages
│   │   ├── Dashboard.jsx
│   │   ├── Inventory.jsx
│   │   ├── Orders.jsx
│   │   ├── Forecast.jsx
│   │   └── Login.jsx
│   │
│   ├── context/               # Auth & global state
│   │   ├── AuthContext.jsx
│   │   └── SocketContext.jsx
│   │
│   ├── hooks/                 # Custom hooks
│   │   ├── useAuth.js
│   │   └── useSocket.js
│   │
│   ├── utils/                 # Helpers & constants
│   │   ├── roles.js
│   │   └── formatters.js
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── .env
├── vite.config.js
└── package.json
```

### 💬 Interview justification

> “I separated API access, pages, and reusable components to keep the UI scalable and testable.”

---

# ⚙️ 2. Service A — Operational Core (Node.js + Express)

```bash
service-operational/
├── src/
│   ├── app.js                 # Express app bootstrap
│   ├── server.js              # HTTP + Socket.io startup
│   │
│   ├── config/                # Environment & service config
│   │   ├── db.js
│   │   ├── redis.js
│   │   └── env.js
│   │
│   ├── models/                # OLTP Mongoose models
│   │   ├── User.model.js
│   │   ├── Product.model.js
│   │   └── Order.model.js
│   │
│   ├── routes/                # API routes
│   │   ├── auth.routes.js
│   │   ├── product.routes.js
│   │   ├── order.routes.js
│   │   └── analytics.proxy.js # Calls Python service
│   │
│   ├── controllers/           # Request handlers
│   │   ├── auth.controller.js
│   │   ├── product.controller.js
│   │   └── order.controller.js
│   │
│   ├── services/              # Business logic
│   │   ├── inventory.service.js
│   │   ├── order.service.js
│   │   └── csvIngestion.service.js
│   │
│   ├── middlewares/           # Express middleware
│   │   ├── auth.middleware.js
│   │   ├── role.middleware.js
│   │   └── error.middleware.js
│   │
│   ├── sockets/               # Socket.io logic
│   │   └── inventory.socket.js
│   │
│   ├── utils/
│   │   ├── logger.js
│   │   └── csvParser.js
│   │
│   └── constants/
│       └── roles.js
│
├── tests/
├── .env
├── Dockerfile
└── package.json
```

### 💬 Interview justification

> “Controllers handle HTTP, services contain business logic, and sockets handle real-time events — clean separation of concerns.”

---

# 🧪 3. Service B — Analytics Engine (Python + FastAPI)

```bash
service-analytics/
├── app/
│   ├── main.py                # FastAPI entry point
│   │
│   ├── api/                   # API routes
│   │   └── forecast.py
│   │
│   ├── core/
│   │   ├── config.py
│   │   └── db.py
│   │
│   ├── models/                # Pydantic schemas
│   │   ├── forecast_request.py
│   │   └── forecast_response.py
│   │
│   ├── services/
│   │   ├── etl_service.py
│   │   ├── forecasting_service.py
│   │   └── feature_engineering.py
│   │
│   ├── ml/
│   │   ├── prophet_model.py
│   │   └── regression_model.py
│   │
│   ├── workers/
│   │   └── change_stream_listener.py
│   │
│   └── utils/
│       └── logger.py
│
├── requirements.txt
├── Dockerfile
└── .env
```

### 💬 Interview justification

> “Python is isolated for analytics so CPU-heavy tasks never block real-time user operations.”

---

# 🐳 4. Infrastructure (DevOps)

```bash
infrastructure/
├── docker-compose.yml
├── mongo-init/
│   └── init.js
└── nginx/
    └── nginx.conf
```

---

# 📄 5. Docs (VERY IMPORTANT)

```bash
docs/
├── architecture-diagram.png
├── data-flow-diagram.png
└── schema-design.md
```

---

# 🧾 6. README Structure (Must Follow This)

```md
# Intelligent Supply Chain / Inventory Command Center

## Overview
## Architecture Diagram
## Tech Stack
## Data Flow
## Real-Time System
## Forecasting Engine
## How to Run (Docker)
## Scalability & Design Decisions
```

---

## 🏁 Final Advice (Very Important)

👉 **Do not overbuild** beyond this.
👉 **Finish MVP cleanly**.
👉 **Document decisions**.

This structure already screams:

> “I know how real systems are built.”

---

