# TestPilot: System Architecture & Technical Design Report

**Project Title**: TestPilot – AI-Assisted Test Case Generation for a Full-Stack Healthcare Platform  
**Academic Division**: BITS Pilani – Work Integrated Learning Programmes Division  
**Course**: BSDCH ZC229T Design Project Proposal  
**Authors**: Team TestPilot | BITS Pilani  

---

## 1. Executive Summary

**TestPilot** is a specialized test engineering web platform designed to accelerate, structure, and automate software quality assurance for modern full-stack healthcare platforms. Rather than relying on unstructured, ad-hoc generative AI prompts, TestPilot implements a disciplined **Prompt Engineering Layer**, a strict **Human-in-the-Loop Review and Approval Interface**, and a headless **Playwright Browser Test Execution Engine**.

The reference Application Under Test (AUT) is an open-source full-stack healthcare scheduling system comprising:
- **Frontend**: React 17 SPA with React Router, Bootstrap, and Redux Toolkit.
- **Backend**: Node.js & Express REST API with JWT (HS256) session security and bcrypt hashing.
- **Database**: Dual-mode MongoDB Atlas with zero-dependency embedded In-Memory database compatibility.

---

## 2. High-Level System Architecture

```
+-----------------------------------------------------------------------------------+
|                                TESTPILOT PLATFORM                                 |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  [ User Story Studio ] <---> [ Prompt Engineering Lab ] <---> [ Human Review Board]|
|        |                               |                                |         |
|        | (17 Preloaded Stories)        | (CoT / Few-Shot Prompts)       | (Approve|
|        v                               v                                v  /Edit) |
|  +----------------------------------------------------------------------------+   |
|  |                   TestPilot Backend Engine (Port 8000)                     |   |
|  |  * SQLite / JSON Persistent Database Store (testpilot.json)                |   |
|  |  * Multi-Provider LLM Integration (OpenAI, Claude, Gemini, Built-In Engine)|   |
|  |  * Quality Scorecard Calculator (Completeness, Accuracy, Domain Rel.)     |   |
|  +----------------------------------------------------------------------------+   |
|                                       |                                           |
|                                       v                                           |
|                     [ Playwright Browser Test Runner ]                            |
|                                       |                                           |
+---------------------------------------|-------------------------------------------+
                                        | (Automated Headless Chromium Actions)
                                        v
+-----------------------------------------------------------------------------------+
|                    APPLICATION UNDER TEST (AUT - HEALTHCARE)                      |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|    +-----------------------------+             +-------------------------------+  |
|    | Healthcare Frontend (:3000) | <---------> | Healthcare Backend (:5000)    |  |
|    | React 17 / Bootstrap        |  HTTP REST  | Express / Mongoose / InMemory |  |
|    +-----------------------------+             +-------------------------------+  |
|                                                                                   |
+-----------------------------------------------------------------------------------+
```

---

## 3. Subsystem Breakdown

### 3.1. User Story Input & Requirements Engine
* **Purpose**: Serves as the domain input surface for test case synthesis.
* **Capabilities**:
  - Preloaded catalog of **17 comprehensive healthcare user stories** categorized by role (Patient, Doctor, Admin) and functional area (Authentication, Discovery, Booking, Payment, Telehealth, Feedback, Security).
  - Agile formatting: Persona definition ("As a..."), capability statement ("I want..."), and business justification ("so that...").
  - Explicit Acceptance Criteria checklists and precondition definitions.
  - Interactive modal for authoring and tagging custom user stories.

### 3.2. Prompt Engineering Layer
* **Purpose**: Bridges natural-language user stories with rigorous, deterministic test specifications.
* **Prompt Strategies**:
  1. **Zero-Shot Naive Baseline**: Unconstrained prompt used for baseline benchmarking and demonstrating hallucination risks.
  2. **Few-Shot Schema Grounded**: Injects structured JSON examples with exact schema types (`testId`, `steps`, `expectedResult`).
  3. **Chain-of-Thought (CoT) Clinical QA**: Compels the model to analyze clinical safety, slot race conditions, and payment rollbacks prior to test output.
  4. **Boundary & Concurrency Edge-Case Specialist**: Targets millisecond slot collisions, date boundary anomalies, and state recovery.
  5. **Role-Based Security & Permissions Specialist**: Enforces strict RBAC matrices and token verification.
* **LLM Providers**:
  - External: OpenAI (`gpt-4o`, `gpt-4o-mini`), Anthropic Claude, and Google Gemini via configurable API keys.
  - Internal: **High-Fidelity Built-In Clinical Engine** capable of generating structured test cases locally and offline without external network or API keys.

### 3.3. Human-in-the-Loop Review and Approval Interface
* **Academic Rationale**: Software testing in healthcare cannot rely solely on autonomous AI. QA engineers must inspect and validate every AI-generated scenario.
* **Capabilities**:
  - Test case card and tabular inspection views.
  - Inline step editor: add, delete, or reorder test steps, adjust preconditions, and modify expected outcomes.
  - **Flag Gaps**: Annotate test cases with reviewer concerns (e.g. missing network drop recovery).
  - **Review Actions**: Approve, Reject (with mandatory rationale), or Edit.
  - Batch approval and Playwright JavaScript test specification export (`.spec.js`).

### 3.4. Playwright Automated Test Runner
* **Purpose**: Executes approved test cases directly against the deployed healthcare application.
* **Execution Flow**:
  1. Launches Playwright Chromium in headless (or headed) mode.
  2. Navigates to target AUT frontend routes (`http://localhost:3000/doctorlogin`, `/patient/searchdoctor`).
  3. Translates step actions into DOM interactions (filling inputs, clicking buttons, evaluating route transitions).
  4. Verifies negative security guards (unauthenticated access redirection).
  5. Captures full-page verification and failure screenshots saved to `testpilot/screenshots/`.
  6. Compiles execution duration, logs, and pass/fail statuses.

### 3.5. Test Results Dashboard & Reporting
* **Key Performance Indicators (KPIs)**:
  - Total Tests Executed
  - Total Passed & Failed
  - Pass Rate Percentage (%)
  - Execution Duration (seconds)
* **Evidence Gallery**:
  - Chronological run history.
  - Per-test step logs with browser console and network telemetry.
  - Direct links to captured screenshot artifacts.
  - One-click export of faculty experiment logs and Playwright test suites.

---

## 4. Academic Centerpiece: AI vs Human QA Analysis

| Evaluation Metric | AI-Assisted Test Generation | Manual Human QA Authoring | Hybrid TestPilot Workflow |
|---|:---|:---|:---|
| **Authoring Speed** | ~1.5 seconds per 5 test cases | 30–45 minutes per story | **Instant generation + 2-min review** |
| **Boundary Discovery** | High (identifies leap years, race conditions) | Moderate (depends on tester seniority) | **Optimal (AI discovers, human validates)** |
| **Hallucination Risk** | High in naive prompts (inventing UI) | Negligible | **Zero (Human catches & rejects)** |
| **Schema Uniformity** | 100% deterministic with few-shot | Variable across engineers | **Standardized machine-executable JSON** |
| **Domain Safety** | High with CoT healthcare reasoning | High | **Double-layered verification** |

---

## 5. Technology Stack Summary

* **Frontend**: Vanilla ES6 Modules, Tailwind CSS, Lucide Icons (Zero-build friction, instant rendering).
* **Backend**: Node.js v24, Express v5 REST API.
* **Database**: Persistent JSON/SQLite data engine with ACID atomic write guards.
* **Test Automation**: Playwright v1.50+ (Chromium headless engine).
* **AUT Stack**: React 17, Express 4, Mongoose / InMemory compatibility, Bootstrap 4.
