# TestPilot: Local Deployment and Quickstart Guide

This guide walks you through deploying both the **Reference Healthcare Application (Application Under Test - AUT)** and the **TestPilot AI Test Generation Platform**.

---

## 1. Quick Start (One-Click Launch)

To start both the Healthcare Platform and TestPilot simultaneously, run:

```cmd
run_all.bat
```

Or start the individual subsystems:

- **Start TestPilot Platform**: `start_testpilot.bat` (Opens on `http://localhost:8000`)
- **Start Healthcare AUT**: `start_aut.bat` (Frontend on `http://localhost:3000`, Backend on `http://localhost:5000`)

---

## 2. Port and Service Allocation

| Component | Port | Description | Health Endpoint |
|---|:---:|---|---|
| **TestPilot Web Interface & API** | `8000` | AI Prompt Lab, Review Board, Dashboard | `http://localhost:8000/api/health` |
| **Healthcare AUT Frontend** | `3000` | React Patient & Doctor Portal | `http://localhost:3000` |
| **Healthcare AUT Backend** | `5000` | Express REST API (In-Memory/MongoDB) | `http://localhost:5000/doctors` |

---

## 3. Manual Step-by-Step Deployment

### Step 1: Deploy Healthcare Backend (Port 5000)
1. Open a terminal in `healthcare-appointment-scheduling-app`:
   ```cmd
   cd backend
   node server.js
   ```
2. You should see:
   ```text
   [Notice] Using In-Memory Healthcare Data Mode (No external MongoDB Atlas required).
   Listening on port 5000
   ```
   *Note: If you have an external MongoDB Atlas cluster, set `ATLAS_URI` in `backend/.env`.*

### Step 2: Deploy Healthcare Frontend (Port 3000)
1. Open a second terminal:
   ```cmd
   cd frontend
   node serve-build.js
   ```
2. You should see:
   ```text
   Healthcare App Frontend RUNNING on http://localhost:3000
   ```

### Step 3: Deploy TestPilot Platform (Port 8000)
1. Open a third terminal:
   ```cmd
   cd testpilot
   npm start
   ```
2. You should see:
   ```text
   TestPilot AI Test Generation Platform is RUNNING
   Web Interface & API: http://localhost:8000
   ```
3. Open your browser to **`http://localhost:8000`**.

---

## 4. Key Verification & Test Execution Walkthrough

1. **Verify Healthcare Status**:
   - Check the top header on `http://localhost:8000`. Both `AUT Frontend (3000)` and `AUT Backend (5000)` should display green **ONLINE** indicators.
2. **Explore 17 User Stories**:
   - Navigate to **"1. User Stories & Scope"**. Filter by Patient, Doctor, or Admin roles.
3. **Generate Tests with Prompt Engineering**:
   - Click **"Generate Tests"** on any story (e.g. `US-PAT-005` or `US-DOC-002`).
   - In **"2. Prompt Engineering Lab"**, choose your strategy: *Chain-of-Thought Healthcare QA*, *Few-Shot Schema Grounded*, or *Boundary & Edge-Case Specialist*.
   - Adjust temperature (0.0 to 1.0) and click **"Generate Structured Test Cases"**.
4. **Human Review & Approval**:
   - Navigate to **"3. Human Review & Approval"**.
   - Inspect generated test cases. Click **"Edit Steps"** to refine steps, or click **"Flag Gaps"** to record clinical audit notes.
   - Click **"Approve"** on the test cases.
5. **Run Automated Playwright Tests**:
   - Navigate to **"4. Playwright Test Execution"**.
   - Click **"Execute Approved Test Cases"**.
   - Playwright Chromium launches headlessly, interacts with `http://localhost:3000`, evaluates assertions, and captures screenshots.
   - Inspect pass/fail metrics and screenshot evidence.
6. **Faculty Experiment Log**:
   - Navigate to **"5. Prompt Experiment Log"** to inspect the 10 documented iterations with 1–5 ratings across Completeness, Accuracy, and Domain Relevance.
   - Click **"Download Faculty Report (.md)"** to export the markdown deliverable.

---

## 5. Reference User Credentials

* **Doctor Portal (`/doctorlogin`)**:
  - **Username**: `test`
  - **Password**: `test`
* **Patient Portal**:
  - Click **"Login As A Patient"** on landing page.
