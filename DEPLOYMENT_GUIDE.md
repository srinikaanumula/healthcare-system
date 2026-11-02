# Healthcare Application & TestPilot Deployment Guide

This guide covers deploying both the **Healthcare System (Frontend & Backend)** and the **TestPilot AI Testing Platform** to the web so they can be accessed globally via public URLs.

---

## Architecture Overview

| Subsystem | Folder | Local Port | Default Role | Recommended Web Cloud Host |
|---|---|:---:|---|---|
| **Healthcare Backend API** | `backend/` | `5000` | Node.js Express REST API (In-Memory or MongoDB) | **Render Web Service** / **Railway** |
| **Healthcare Frontend App** | `frontend/` | `3000` | React Patient & Doctor Portal | **Render** / **Vercel** |
| **TestPilot Platform** | `testpilot/` | `8000` | AI Testing Lab, Review Board & Playwright Runner | **Render Web Service** / **Railway** |

---

## Method 1: Free Cloud Deployment via Render.com (Recommended)

Render provides free hosting for web services and static sites directly from your GitHub repository (`https://github.com/srinikaanumula/healthcare-system.git`).

We have included a pre-configured **`render.yaml`** Blueprint in the repository root that configures all 3 services automatically.

### Steps to Deploy:
1. Push your latest code changes to GitHub:
   ```bash
   git add .
   git commit -m "Add web deployment configurations"
   git push origin main
   ```
2. Go to [https://dashboard.render.com](https://dashboard.render.com) and sign in with your GitHub account.
3. In the Render Dashboard, click **New +** $\rightarrow$ **Blueprint**.
4. Connect your GitHub repository: `srinikaanumula/healthcare-system`.
5. Render will detect `render.yaml` and display the 3 services:
   - **`healthcare-backend`** (Web Service)
   - **`healthcare-frontend`** (Web Service)
   - **`testpilot-platform`** (Web Service)
6. Click **Apply**.
7. Once deployed, Render provides public HTTPS URLs for each service:
   - Frontend: `https://healthcare-frontend-xxxx.onrender.com`
   - Backend: `https://healthcare-backend-xxxx.onrender.com`
   - TestPilot: `https://testpilot-platform-xxxx.onrender.com`

---

## Method 2: Deploy Frontend on Vercel + Backend on Render

If you prefer deploying the React frontend on **Vercel** for optimal CDN performance:

### Step 1: Deploy Backend on Render
1. Go to [Render Dashboard](https://dashboard.render.com) $\rightarrow$ **New +** $\rightarrow$ **Web Service**.
2. Select your repository `healthcare-system`.
3. Set the following fields:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. Click **Deploy Web Service**.
5. Copy your live backend URL (e.g., `https://healthcare-backend.onrender.com`).

### Step 2: Deploy Frontend on Vercel
1. Go to [https://vercel.com](https://vercel.com) and sign in with GitHub.
2. Click **Add New Project** $\rightarrow$ Import `healthcare-system`.
3. Configure project settings:
   - **Root Directory**: Click edit and select `frontend`.
   - **Framework Preset**: Create React App.
   - **Environment Variables**:
     - Key: `REACT_APP_SERVER_URL`
     - Value: `https://healthcare-backend.onrender.com` (Your live Render backend URL)
4. Click **Deploy**. Vercel will provide an instant HTTPS URL (e.g., `https://healthcare-system.vercel.app`).

### Step 3: Deploy TestPilot on Render
1. In Render Dashboard $\rightarrow$ **New +** $\rightarrow$ **Web Service**.
2. Select repository `healthcare-system`.
   - **Root Directory**: `testpilot`
   - **Build Command**: `npm install`
   - **Start Command**: `node server/server.js`
3. Click **Deploy Web Service**.

---

## Method 3: Instant Live Web URLs via Tunnels (No Cloud Sign-Up Needed)

If you need public HTTPS URLs right away to share for a live demo, faculty review, or quick remote access without setting up cloud accounts:

1. **Start all 3 services locally**:
   ```cmd
   run_all.bat
   ```
2. **Open a new terminal and generate public URLs using `localtunnel`**:
   ```cmd
   # Terminal 1: Public URL for Healthcare Frontend (Port 3000)
   npx localtunnel --port 3000

   # Terminal 2: Public URL for Healthcare Backend (Port 5000)
   npx localtunnel --port 5000

   # Terminal 3: Public URL for TestPilot QA Platform (Port 8000)
   npx localtunnel --port 8000
   ```
3. Each command prints a public HTTPS URL (e.g. `https://neat-frog-82.loca.lt`) accessible from any phone, laptop, or evaluator's browser anywhere in the world!

---

## Method 4: Docker & Docker Compose (Any Cloud VPS / Server)

We have provided `Dockerfile`s for each component and a root `docker-compose.yml`.

### Single-Command Launch:
```bash
docker compose up -d --build
```

### Services launched:
* `http://localhost:3000` — Healthcare Frontend
* `http://localhost:5000` — Healthcare Backend
* `http://localhost:8000` — TestPilot AI Platform

---

## Verifying the Web Deployment

1. **Healthcare App**:
   - Open your deployed frontend URL.
   - Click **"Register as Patient"** or log in as a patient.
   - Log in as doctor (`/doctorlogin`) with username `test` / `test` (or `dr_shwetha` / `password123`) to view consultation schedules.
2. **TestPilot QA Platform**:
   - Open your deployed TestPilot URL.
   - In **Settings**, update the **Target AUT Frontend URL** and **Target AUT Backend URL** with your live cloud URLs.
   - Click **"Execute Approved Test Cases"** to run automated Playwright tests against your live web app!
