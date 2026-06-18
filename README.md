# Inventory & Order Management System (IOMS)

A containerized, production-ready full-stack Inventory & Order Management System. Built with a decoupled React frontend and Python FastAPI backend, backed by PostgreSQL. The architecture supports local orchestration via Docker Compose and independent hosting deployments.

---

## 🚀 Key Features

* **Dashboard Analytics**: High-level counters for catalog, customers, and order counts along with real-time critical low-stock alerts.
* **Product Catalog**: Add, list, edit, and delete products. Enforces SKU uniqueness and positive stock levels.
* **Customer Relations**: Register and track customers. Enforces unique email constraint.
* **Order Processing**: Create orders with a dynamic multi-product item picker. Supports real-time price totals and automatically validates stock levels before deducting inventory.
* **Stock Restoration**: Canceling/deleting an order automatically reverts product stock.
* **Decoupled Architecture**: Independent frontend and backend layers, ready to be deployed separately.

---

## 🛠 Technology Stack

* **Backend**: Python, FastAPI, SQLModel (ORM integrating SQLAlchemy & Pydantic), Uvicorn.
* **Frontend**: React, Vite, Lucide React, Premium HSL Vanilla CSS.
* **Database**: PostgreSQL (with lightweight SQLite fallback for local test suites).
* **Containerization**: Docker, Docker Compose, Nginx (frontend server).

---

## 📂 Directory Structure

```text
├── backend/                  # FastAPI Backend API
│   ├── app/
│   │   ├── config.py         # Pydantic Settings
│   │   ├── database.py       # SQLModel engine & session config
│   │   ├── models.py         # Database Tables & Pydantic DTOs
│   │   ├── crud.py           # Core business logic / DB transactions
│   │   └── main.py           # FastAPI entrypoint, middleware, routers
│   ├── tests/
│   │   └── test_backend.py   # Automated business logic validation test
│   ├── Dockerfile            # Production-grade multi-stage Python image
│   ├── requirements.txt      # Backend Python dependencies
│   ├── .dockerignore
│   └── .env.example
├── frontend/                 # React Web App Client
│   ├── src/
│   │   ├── components/       # Pages: Dashboard, Products, Customers, Orders
│   │   ├── App.jsx           # Root layout & page loader
│   │   ├── main.jsx          # Vite bootstrapper
│   │   └── index.css         # Premium Slate theme design system
│   ├── nginx.conf            # Nginx config for client router compatibility
│   ├── index.html            # Entrypoint template with Google Outfit font
│   ├── vite.config.js        # Vite compiler settings
│   ├── package.json          # Node configuration & scripts
│   ├── Dockerfile            # Multi-stage compilation & serve image
│   └── .dockerignore
├── docker-compose.yml        # Orchestration runner
├── README.md                 # Main Documentation
└── .gitignore
```

---

## ⚡ Local Setup

### Option A: Running with Docker Compose (Recommended)
You only need [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed on your machine.

1. **Spin up the stack**:
   Run the following command in the root folder:
   ```bash
   docker compose up --build
   ```

2. **Access the Application**:
   * **React Frontend**: Go to [http://localhost:3000](http://localhost:3000)
   * **FastAPI Backend (API)**: Go to [http://localhost:8000](http://localhost:8000)
   * **API Interactive Docs (Swagger UI)**: Go to [http://localhost:8000/docs](http://localhost:8000/docs)

---

### Option B: Running Locally (No Docker)

#### 1. Setup Backend
1. Go into the backend folder:
   ```bash
   cd backend
   ```
2. Create and active a python virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Install package dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the local tests to ensure your Python setup works:
   ```bash
   python -m unittest tests/test_backend.py
   ```
5. Run the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

#### 2. Setup Frontend
1. Go into the frontend folder:
   ```bash
   cd frontend
   ```
2. Install npm dependencies (requires Node.js):
   ```bash
   npm install
   ```
3. Start the Vite local development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ☁️ Independent Deployment

### Deployed Backend (Render, Railway, or Fly.io)
1. Link your GitHub repository to your cloud provider.
2. Set the build folder/context root to `backend/`.
3. Set the Dockerfile path to `backend/Dockerfile` (or build commands if running direct: `pip install -r requirements.txt` and command `uvicorn app.main:app --host 0.0.0.0 --port $PORT`).
4. Configure environment variables:
   * `DATABASE_URL`: Your production PostgreSQL connection string (provided by your hosting database).
   * `ENVIRONMENT`: `production`
   * `ALLOWED_ORIGINS`: Set to your production frontend URL (e.g. `https://your-app.vercel.app`).

### Deployed Frontend (Vercel, Netlify)
1. Link the repository to Vercel/Netlify.
2. Set the root folder option to `frontend/`.
3. Set the framework option to **Vite** (Build command: `npm run build`, Output directory: `dist/`).
4. Configure **Environment Variables**:
   * `VITE_API_URL`: Your live production backend URL (e.g. `https://your-backend-api.onrender.com`).
   * *Note: Vite environment variables must be prefixed with `VITE_` to be compiled into client assets.*
