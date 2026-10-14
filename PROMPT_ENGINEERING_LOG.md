# TestPilot: Prompt Engineering Experiment Log

**Institution**: Birla Institute of Technology & Science, Pilani (BITS Pilani)  
**Programme**: Work Integrated Learning Programmes Division (WILPD)  
**Degree**: BSc Design and Computing  
**Course**: BSDCH ZC229T Design Project  
**Project Title**: TestPilot – AI-Assisted Test Case Generation for a Full-Stack Healthcare Platform  
**Faculty Deliverable**: Comprehensive 10-Iteration Prompt Engineering Experiment Log across 3 Target User Stories  

---

## 1. Executive Summary & Experimental Methodology

The primary academic objective of **TestPilot** is to explore how Large Language Models (LLMs) can accelerate software test case generation in high-stakes domains like healthcare, while instilling the professional habit of critical evaluation. Healthcare software has zero tolerance for hallucinated workflows, data leakage, or race-condition double-booking.

We conducted **10 systematic prompt engineering iterations** evaluated across three representative healthcare user stories spanning Patient, Doctor, and Administrative Security roles:
- **Story A**: *US-PAT-005: Time Slot Selection & Collision Prevention (Patient books an appointment with a doctor)*
- **Story B**: *US-DOC-002: Doctor Today's Consultation Schedule View (Doctor logs in and manages schedule)*
- **Story C**: *US-SEC-001: Role-Based Access Control and Route Protection (Unauthorised user attempts to access a restricted page)*

Each iteration was evaluated against three quantitative quality dimensions (1–5 Likert scale):
1. **Completeness (1–5)**: Coverage of happy paths, negative validation flows, and boundary/edge-case conditions.
2. **Accuracy (1–5)**: Syntactic schema correctness, feasibility of step actions, deterministic assertions, and zero hallucinated elements.
3. **Healthcare Domain Relevance (1–5)**: Understanding of medical concurrency, clinical safety, HIPAA/PII boundary rules, and doctor consultation mechanics.

---

## 2. Iteration Summary & Comparison Matrix

| Iter # | Target Story | Strategy Employed | Model | Temp | Completeness | Accuracy | Domain Rel. | Overall | Hallucination Detected? |
|:---:|:---|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **1** | US-PAT-005 (Patient Booking) | Naive Zero-Shot Baseline | GPT-4o-mini | 0.7 | 2/5 | 2/5 | 2/5 | **2.0** | YES (One-click booking assumed) |
| **2** | US-PAT-005 (Patient Booking) | Role & Persona Grounded | GPT-4o-mini | 0.5 | 3/5 | 3/5 | 3/5 | **3.0** | Minor (Missing slot intervals) |
| **3** | US-PAT-005 (Patient Booking) | Few-Shot Schema Grounded | GPT-4o-mini | 0.3 | 4/5 | 4/5 | 4/5 | **4.0** | NO (Strict schema followed) |
| **4** | US-PAT-005 (Patient Booking) | Chain-of-Thought (CoT) Concurrency | GPT-4o | 0.2 | 5/5 | 5/5 | 5/5 | **5.0** | NO (Full race-condition analysis) |
| **5** | US-DOC-002 (Doctor Schedule) | Zero-Shot Baseline | GPT-4o-mini | 0.7 | 2/5 | 2/5 | 2/5 | **2.0** | YES (Hallucinated drag-and-drop calendar) |
| **6** | US-DOC-002 (Doctor Schedule) | Codebase & Route Grounded | GPT-4o-mini | 0.3 | 4/5 | 4/5 | 4/5 | **4.0** | NO (Accurate routes & slots) |
| **7** | US-DOC-002 (Doctor Schedule) | CoT Edge Case & Defensive State | GPT-4o | 0.2 | 5/5 | 5/5 | 5/5 | **5.0** | NO (Empty states & session expiry) |
| **8** | US-SEC-001 (Unauthorized Access) | Zero-Shot Security Baseline | GPT-4o-mini | 0.7 | 2/5 | 3/5 | 2/5 | **2.3** | Generic (OWASP XSS/DDoS miss RBAC) |
| **9** | US-SEC-001 (Unauthorized Access) | Healthcare RBAC Matrix-Guided | GPT-4o-mini | 0.3 | 4/5 | 4/5 | 4/5 | **4.0** | NO (Targeted role boundary checks) |
| **10** | US-SEC-001 (Unauthorized Access) | Adversarial Token Tampering CoT | GPT-4o | 0.2 | 5/5 | 5/5 | 5/5 | **5.0** | NO (Crypto signature & session hijacking) |

---

## 3. Detailed Iteration Logs

### Story A: Patient Appointment Booking (US-PAT-005)

#### Iteration 1: Naive Zero-Shot Baseline
* **System Prompt**: `You are a test case generator. Write test cases for the user story provided.`
* **User Prompt**: `Generate test cases for: As a patient, I want to book an appointment with a doctor so that I can receive a consultation.`
* **LLM Output**:
  ```text
  Test Case 1: Book Appointment
  Step 1: Open website.
  Step 2: Click book appointment.
  Step 3: Select doctor.
  Step 4: Click confirm.
  Expected: Appointment is booked.

  Test Case 2: Cancel Appointment
  Step 1: Click cancel.
  Expected: Appointment cancelled.
  ```
* **Ratings**: Completeness: 2/5 | Accuracy: 2/5 | Healthcare Domain Relevance: 2/5 | **Overall Score: 2.0/5**
* **What Changed & Why**: Initial baseline without domain constraints.
* **Faculty Review Analysis**: High degree of under-specification. Output assumes a trivial 1-click booking without doctor schedule checks, calendar dates, or payment gateways. Completely misses negative flows and concurrency.

---

#### Iteration 2: Role & Persona Grounded Prompt
* **System Prompt**: `You are a Senior Healthcare QA Engineer specializing in hospital management software, EHR systems, and HIPAA compliance.`
* **User Prompt**: `As a patient, I want to book an appointment with a doctor so that I can receive a consultation. Generate positive and negative test cases including preconditions and step-by-step actions.`
* **LLM Output**:
  ```text
  TC-01: Successful Appointment Booking (Positive)
  Preconditions: Patient is logged in; doctor has active schedule.
  Steps: 1. Go to search doctor; 2. Choose doctor; 3. Pick date; 4. Pick time slot; 5. Pay fee.
  Expected: Appointment confirmed with confirmation receipt.

  TC-02: Booking when no slots are free (Negative)
  Preconditions: Doctor schedule has all slots booked.
  Steps: 1. Select doctor; 2. Select date.
  Expected: Error shown that doctor is unavailable for selected date.
  ```
* **Ratings**: Completeness: 3/5 | Accuracy: 3/5 | Healthcare Domain Relevance: 3/5 | **Overall Score: 3.0/5**
* **What Changed & Why**: Injected a domain persona ("Senior Healthcare QA Engineer") and requested positive/negative categorization.
* **Faculty Review Analysis**: Notable improvement in test coverage. The persona immediately stimulated negative path testing (unavailable slots) and financial checkout acknowledgement. However, output lacks structured machine-parseable schema and fails to test boundary conditions (e.g. past dates).

---

#### Iteration 3: Few-Shot Schema Grounded Prompt
* **System Prompt**: `You are an automated test designer. Return ONLY a valid JSON array of test cases conforming exactly to the provided schema with id, title, scenarioType, priority, preconditions, steps array [{stepNumber, action, testData, expectedResult}], and expectedResult.`
* **User Prompt**: `User Story: US-PAT-005 Time Slot Selection & Collision Prevention. Given the reference JSON schema with 2 few-shot examples, generate 4 test cases.`
* **LLM Output**: Valid JSON array with 4 test cases covering positive booking, missing date validation, unauthenticated booking block, and invalid phone format.
* **Ratings**: Completeness: 4/5 | Accuracy: 4/5 | Healthcare Domain Relevance: 4/5 | **Overall Score: 4.0/5**
* **What Changed & Why**: Injected two complete few-shot JSON examples demonstrating step arrays with `testData` and `expectedResult`.
* **Faculty Review Analysis**: Syntactic hallucinations dropped to 0%. The LLM produced machine-executable test structures ready for direct translation into Playwright automation.

---

#### Iteration 4: Chain-of-Thought (CoT) Clinical Concurrency Specialist
* **System Prompt**: `You are a Principal Healthcare Software Test Architect. Before outputting test cases, perform step-by-step reasoning on: 1) Medical safety risks; 2) Concurrent race conditions (e.g. two patients booking 09:00:00 simultaneously); 3) Payment session drop-offs; 4) Timezone and past date constraints. Then output structured JSON test cases covering Positive, Negative, and Edge Cases.`
* **User Prompt**: `Generate a comprehensive test suite for US-PAT-005 targeting our MERN healthcare application.`
* **LLM Output**:
  - Reasoning Trace: Evaluated race conditions, atomic database locks, and payment gateway rollbacks.
  - Test Suite: 6 structured cases including millisecond slot collision rejection (HTTP 409 Conflict), past date calendar restriction, and session drop-off slot release.
* **Ratings**: Completeness: 5/5 | Accuracy: 5/5 | Healthcare Domain Relevance: 5/5 | **Overall Score: 5.0/5**
* **What Changed & Why**: Integrated a mandatory Chain-of-Thought reasoning phase compelling the model to analyze clinical safety and race conditions before generating JSON.
* **Faculty Review Analysis**: Exemplary test suite. The model successfully uncovered deep clinical concurrency vulnerabilities that junior manual QA engineers frequently overlook.

---

### Story B: Doctor Consultation Schedule Management (US-DOC-002)

#### Iteration 5: Zero-Shot Baseline (Doctor Role)
* **System Prompt**: `Generate test cases for doctor login and schedule management.`
* **User Prompt**: `As a doctor I want to log in and see today's schedule.`
* **LLM Output**: Included a test case instructing the doctor to "Drag and drop appointment from 9am to 2pm on the interactive calendar."
* **Ratings**: Completeness: 2/5 | Accuracy: 2/5 | Healthcare Domain Relevance: 2/5 | **Overall Score: 2.0/5**
* **What Changed & Why**: Baseline unconstrained prompt applied to doctor role.
* **Faculty Review Analysis**: **Critical Hallucination Detected**: The LLM invented a complex drag-and-drop calendar rescheduling feature that does not exist in the codebase. Demonstrates danger of ungrounded generative AI in testing.

---

#### Iteration 6: Codebase & Route Grounded Context
* **System Prompt**: `You are a QA automation engineer testing a React + Express hospital app. System routes: POST /doctors/login, GET /doctor, GET /doctor/perosnaldetails, POST /doctors/get-slots. Database uses fixed slots: 09:00:00, 12:00:00, 15:00:00.`
* **User Prompt**: `Generate structured tests for doctor login and schedule review conforming strictly to the known routes and slot times.`
* **LLM Output**: 4 test cases testing valid login with password hashing, invalid password notification, today's schedule table rendering with meet links, and fee update persistence.
* **Ratings**: Completeness: 4/5 | Accuracy: 4/5 | Healthcare Domain Relevance: 4/5 | **Overall Score: 4.0/5**
* **What Changed & Why**: Injected architectural reality (Express routes, fixed slot schema, bcrypt hashing).
* **Faculty Review Analysis**: Hallucinated drag-and-drop disappeared completely. Every generated test case strictly exercised real routes and UI selectors.

---

#### Iteration 7: CoT Edge Case & Defensive State Enforcement
* **System Prompt**: `You are a Principal Test Automation Architect. Analyze doctor schedule edge cases: 1) Doctor with zero appointments booked for today; 2) Doctor session expired while on schedule view; 3) Meet link generation failure. Generate comprehensive JSON test cases.`
* **User Prompt**: `Generate test suite covering US-DOC-002 with full positive, negative, and edge-case coverage.`
* **LLM Output**: 5 test cases including empty schedule graceful banner rendering, active Google Meet tab launch with `rel="noopener noreferrer"`, expired JWT auto-redirect, and sequential chronological sorting.
* **Ratings**: Completeness: 5/5 | Accuracy: 5/5 | Healthcare Domain Relevance: 5/5 | **Overall Score: 5.0/5**
* **What Changed & Why**: Prompt instructed the model to consider zero-data empty states and security token invalidation mid-shift.
* **Faculty Review Analysis**: Exceptional defensive test coverage ensuring doctor UI never crashes on blank schedules or expired sessions.

---

### Story C: Security & Role-Based Access Control (US-SEC-001)

#### Iteration 8: Zero-Shot Security Baseline
* **System Prompt**: `Generate security tests for a web application.`
* **User Prompt**: `Write security tests for unauthorized user accessing restricted pages in a hospital app.`
* **LLM Output**: Tests for SQL injection in search bar, XSS alert popups, and DDoS flooding.
* **Ratings**: Completeness: 2/5 | Accuracy: 3/5 | Healthcare Domain Relevance: 2/5 | **Overall Score: 2.3/5**
* **What Changed & Why**: Generic security prompt.
* **Faculty Review Analysis**: Generic web exploits defaulted from general knowledge. Missed healthcare authorization entirely (e.g. patients viewing other patients' medical notes or accessing doctor schedules).

---

#### Iteration 9: Healthcare RBAC Matrix-Guided Prompt
* **System Prompt**: `You are a Healthcare Cybersecurity & QA Compliance Auditor. Role access rules: Unauthenticated users: ONLY '/' and '/doctorlogin'. Patients: '/patient/*', NEVER '/doctor/*'. Doctors: '/doctor/*', NEVER patient booking. Return structured JSON test cases.`
* **User Prompt**: `Generate RBAC authorization test cases verifying that privilege boundaries are strictly enforced across all routes.`
* **LLM Output**: 4 test cases verifying unauthenticated direct URL navigation redirection, patient token rejection on `/doctors/update`, and localStorage clearing on logout.
* **Ratings**: Completeness: 4/5 | Accuracy: 4/5 | Healthcare Domain Relevance: 4/5 | **Overall Score: 4.0/5**
* **What Changed & Why**: Injected the formal Role-Based Access Control (RBAC) permission matrix.
* **Faculty Review Analysis**: Successfully transformed generic attacks into high-value medical access control compliance assertions.

---

#### Iteration 10: Adversarial Token Tampering & Session Hijacking CoT
* **System Prompt**: `You are a Principal Security Test Architect for HIPAA-regulated platforms. Reason step-by-step through: 1) Malformed JWT signature injection; 2) LocalStorage token tampering (changing role payload); 3) Concurrent multi-tab session expiration; 4) CSRF and CORS origin spoofing. Generate executable test cases with exact assertions.`
* **User Prompt**: `Generate advanced security test suite for US-SEC-001 covering adversarial access attempts against the healthcare backend and frontend.`
* **LLM Output**: 6 advanced test cases covering tampered JWT signatures, doctor ID spoofing in requests, unauthenticated route guards, patient token cross-role invocation blocking, and token purging.
* **Ratings**: Completeness: 5/5 | Accuracy: 5/5 | Healthcare Domain Relevance: 5/5 | **Overall Score: 5.0/5**
* **What Changed & Why**: Combined adversarial cryptographic threat modeling with Chain-of-Thought reasoning.
* **Faculty Review Analysis**: Production-grade penetration testing suite that verifies compliance with HIPAA Security Rule (§ 164.312) technical safeguards.

---

## 4. Key Academic Findings & Faculty Takeaways

1. **Evolution of Prompt Strategies**:
   - Moving from **Naive Zero-Shot (2.0/5)** to **Few-Shot Grounded (4.0/5)** eliminated schema syntax errors.
   - Advancing from **Few-Shot** to **Chain-of-Thought (5.0/5)** unlocked deep domain discovery (concurrency race conditions, empty roster states, token spoofing).
2. **The Necessity of the Human-in-the-Loop**:
   - Generative LLMs without architectural grounding hallucinate non-existent features (e.g. Iteration 5's drag-and-drop calendar).
   - TestPilot's **Human Review and Approval Board** empowers QA engineers to catch hallucinations, edit steps, and flag coverage gaps prior to test execution.
3. **Execution Feasibility**:
   - Machine-parseable step arrays produced by Grounded Prompts map directly to Playwright automation, enabling continuous verification of full-stack healthcare platforms.
