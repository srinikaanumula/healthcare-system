# TestPilot: Requirements and User Stories Documentation

**Project Title**: TestPilot – AI-Assisted Test Case Generation for a Full-Stack Healthcare Platform  
**Academic Division**: BITS Pilani – Work Integrated Learning Programmes Division  
**Degree & Course**: BSc Design and Computing | BSDCH ZC229T Design Project Proposal  
**Application Under Test (AUT)**: Full-Stack Healthcare Appointment Scheduling Application (React, Express, Node.js, MongoDB/In-Memory)

---

## 1. System Overview & Scope

The application under test is an open-source full-stack healthcare platform designed to streamline doctor discovery, calendar schedule reservation, appointment booking, telehealth consultation routing, and clinical feedback. The system enforces strict role-based separation across three primary user classes:

1. **Patient**: Discovers specialists, books available time slots, submits consultation payments, joins virtual teleconsultation sessions, and submits post-care ratings.
2. **Doctor**: Authenticates securely via credential hashing, inspects daily consultation rosters, updates profile fees and contact numbers, tracks historical earnings, and reviews patient feedback.
3. **Administrator / Security Officer**: Onboards credentialed healthcare providers, manages slot capacity, and enforces HIPAA-compliant Role-Based Access Control (RBAC).

---

## 2. Role-Based Access Control (RBAC) Matrix

| Route / Capability | Unauthenticated Visitor | Registered Patient | Licensed Doctor | Hospital Administrator |
|---|:---:|:---:|:---:|:---:|
| Landing Page (`/`) | Allowed | Allowed | Allowed | Allowed |
| Doctor Login (`/doctorlogin`) | Allowed | Allowed | Allowed | Allowed |
| Patient Dashboard (`/patient`) | Denied (Redirect) | Allowed | Denied | Denied |
| Search Doctors (`/patient/searchdoctor`) | Denied | Allowed | Denied | Allowed |
| Slot Booking (`/patient/book-slot`) | Denied | Allowed | Denied | Denied |
| Fee Checkout (`/patient/payment`) | Denied | Allowed | Denied | Denied |
| Doctor Dashboard (`/doctor`) | Denied (401) | Denied (403) | Allowed | Allowed |
| Update Profile / Fees (`/doctor/perosnaldetails`) | Denied | Denied | Allowed | Allowed |
| Doctor Onboarding (`POST /doctors/add`) | Denied | Denied | Denied | Allowed |

---

## 3. Key User Flows

### Flow 1: Patient Appointment Booking & Telehealth Reservation
```
[Patient] -> Search Doctor by Specialty -> Select Date from Calendar -> 
Select Available Slot (09:00 / 12:00 / 15:00) -> Checkout & Payment -> 
Receive Google Meet Link -> Stored in Previous Appointments
```

### Flow 2: Doctor Credential Authentication & Schedule Inspection
```
[Doctor] -> Doctor Login (/doctorlogin) -> Enter Username & Password -> 
JWT Token (HS256) Issued -> Doctor Dashboard (/doctor) -> 
Inspect Today's Schedule -> Launch Google Meet
```

### Flow 3: Post-Consultation Clinical Feedback Loop
```
[Patient] -> Concluded Appointment -> Access Feedback Form -> 
Select 1-5 Stars -> Enter Review Title & Narrative -> Submit -> 
Doctor Inspects Rating & Review in Previous Appointments
```

---

## 4. Comprehensive Agile User Stories (17 Total)

### Patient Role Stories

#### **US-PAT-001**: Patient Registration and Profile Initialization
* **User Story**: As a new patient, I want to create an account with my basic contact information so that I can schedule medical consultations.
* **Acceptance Criteria**:
  1. The system shall accept patient name, contact email, and valid phone number.
  2. The system shall prevent duplicate registration with the same contact identifier.
  3. The patient profile shall be stored in the database with an initial unverified status until first login.
  4. A confirmation greeting and default profile dashboard shall be displayed upon successful creation.
* **Preconditions**: User is on landing page; email is not already registered.
* **Priority**: High | **Module**: Authentication

#### **US-PAT-002**: Patient Google OAuth Login
* **User Story**: As a registered patient, I want to log in using my Google account so that I can securely and seamlessly access my patient portal without remembering extra passwords.
* **Acceptance Criteria**:
  1. Clicking 'Login As A Patient' initiates the Google OAuth 2.0 authorization sequence.
  2. System decodes JWT payload (`sub`, `name`, `email`, `picture`) using configured secret.
  3. Successful authentication redirects patient to Patient Dashboard (`/patient`).
  4. Invalid or cancelled logins display a graceful notification without breaking client state.
* **Preconditions**: Patient has an active Google account.
* **Priority**: Critical | **Module**: Authentication

#### **US-PAT-003**: Search and Browse Doctors by Specialty
* **User Story**: As a patient, I want to search and filter doctors by medical specialization (e.g., Cardiology, Dermatology, Pathology) so that I find the right healthcare specialist for my symptoms.
* **Acceptance Criteria**:
  1. Search input supports dynamic auto-complete matching specialization and doctor name.
  2. Matching doctor cards display full name, specialty, phone contact, and fee per session.
  3. A 'Book' call-to-action button is visible on each qualified doctor card.
  4. If no doctor matches the query, a friendly 'No specialist found' fallback message is shown.
* **Preconditions**: At least one active doctor exists in the database.
* **Priority**: High | **Module**: Doctor Discovery

#### **US-PAT-004**: Doctor Consultation Date Selection
* **User Story**: As a patient, I want to browse an interactive calendar and pick a future consultation date so that I can schedule a visit at my convenience.
* **Acceptance Criteria**:
  1. The calendar visually disables and prevents selection of past dates.
  2. Clicking a valid future date highlights the day and persists the chosen date string (`YYYY-MM-DD`).
  3. 'Confirm And Go to Next Step' button remains disabled until a valid date is picked.
  4. Confirming transitions the user to the Slot Selection screen.
* **Preconditions**: Patient has selected a doctor.
* **Priority**: High | **Module**: Appointment Booking

#### **US-PAT-005**: Time Slot Selection & Collision Prevention
* **User Story**: As a patient, I want to view available consultation slots (09:00:00, 12:00:00, 15:00:00) for my selected doctor and date, and book an open slot so that I am assured consultation time.
* **Acceptance Criteria**:
  1. System queries the doctor's `dateSchedule` and displays slot statuses in real time.
  2. Available slots display an active 'Book Slot' button.
  3. Already booked slots (`isBooked: true`) are disabled and visually distinguished.
  4. Selecting an open slot temporarily reserves it and transitions to the Payment stage.
* **Preconditions**: Doctor has active slot schedule for the selected date.
* **Priority**: Critical | **Module**: Appointment Booking

#### **US-PAT-006**: Consultation Fee Payment Checkout
* **User Story**: As a patient, I want to pay the consultation fee through a secure online payment interface so that my appointment booking is officially confirmed.
* **Acceptance Criteria**:
  1. Receipt itemizes Doctor Name, Specialization, Base Fee, Tax, and Grand Total.
  2. Clicking 'Pay Now' launches the secured Stripe checkout modal.
  3. Card validation requires valid card numbers and postal codes.
  4. Successful charge writes the appointment record to the database with a transaction identifier.
* **Preconditions**: Patient has selected an open slot.
* **Priority**: High | **Module**: Billing & Payment

#### **US-PAT-007**: Virtual Meeting Link Generation & Appointment Confirmation
* **User Story**: As a patient, I want to receive an appointment confirmation with a Google Meet or teleconsultation link so that I can join the remote doctor consultation.
* **Acceptance Criteria**:
  1. Unique teleconsultation URL is generated and attached to the appointment.
  2. Link appears under 'Appointment Status' on the Patient Dashboard.
  3. Clicking 'Join Meet' launches the meeting in a new browser tab with `rel="noopener noreferrer"`.
* **Preconditions**: Payment has been successfully verified.
* **Priority**: High | **Module**: Telehealth

#### **US-PAT-008**: Appointment History & Status Tracking
* **User Story**: As a patient, I want to view a chronological history of my previous appointments and active bookings so that I can keep track of my medical history.
* **Acceptance Criteria**:
  1. 'Appointment Status' view lists active and upcoming bookings with date, time, and doctor name.
  2. 'Previous Appointments' view lists past consultations with feedback links.
* **Preconditions**: Patient has past or current bookings.
* **Priority**: Medium | **Module**: Patient Records

#### **US-PAT-009**: Patient Feedback & Star Rating Submission
* **User Story**: As a patient, I want to submit a 1 to 5 star rating and written review for a completed consultation so that I can evaluate the care provided.
* **Acceptance Criteria**:
  1. Feedback form is accessible only for concluded appointments.
  2. Accepts star rating (1–5), title, and detailed review text.
  3. Submitting updates the appointment record (`feedback.given = true`).
  4. Prevents duplicate feedback submission for the same appointment.
* **Preconditions**: Concluded appointment exists without existing feedback.
* **Priority**: Medium | **Module**: Quality & Feedback

#### **US-PAT-010**: Patient Contact Phone Number Update
* **User Story**: As a patient, I want to update my contact phone number on my profile so that doctors and hospital staff can reach me in case of urgent consultation rescheduling.
* **Acceptance Criteria**:
  1. Validates phone number to exactly 10 digits.
  2. Issues `PUT /patients/update-phone` and updates state immediately.
  3. Invalid numbers display inline validation errors.
* **Preconditions**: Patient is logged in.
* **Priority**: Medium | **Module**: Profile Management

---

### Doctor Role Stories

#### **US-DOC-001**: Doctor Secure Credential Login
* **User Story**: As a medical doctor, I want to authenticate using my clinical username and password so that I can access my daily appointments and patient schedule.
* **Acceptance Criteria**:
  1. Doctor Login (`/doctorlogin`) accepts username and password.
  2. Valid credentials (`test` / `test`) return signed JWT token.
  3. Token is stored in `localStorage` and user redirected to Doctor Dashboard (`/doctor`).
  4. Invalid credentials display 'wrong username or password' without exposing internal errors.
* **Preconditions**: Doctor record exists in database.
* **Priority**: Critical | **Module**: Authentication

#### **US-DOC-002**: Doctor Today's Consultation Schedule View
* **User Story**: As a doctor, I want to view a timeline of all patient appointments scheduled for today so that I can prepare for my consultations.
* **Acceptance Criteria**:
  1. Dashboard displays Today's Schedule with Date, Time Slot, Patient Name, and Meet Link.
  2. Chronological ordering by slot time (`09:00:00`, `12:00:00`, `15:00:00`).
  3. If no bookings exist, renders 'No appointments scheduled today'.
  4. 'Join Meet' launches patient teleconsultation room.
* **Preconditions**: Doctor is authenticated.
* **Priority**: Critical | **Module**: Clinical Schedule

#### **US-DOC-003**: Doctor Profile & Fee Management
* **User Story**: As a doctor, I want to inspect and update my personal details, phone number, medical specialty, and consultation fee per session so that patients see current information.
* **Acceptance Criteria**:
  1. 'Personal Details' view displays current doctor credentials and fees.
  2. Updating fees persists to database via `PUT /doctors/update`.
  3. Updated fee immediately takes effect for new patient slot reservations.
* **Preconditions**: Doctor is logged in.
* **Priority**: Medium | **Module**: Doctor Profile

#### **US-DOC-004**: Doctor Appointment History & Earnings Summary
* **User Story**: As a doctor, I want to review previous appointments and track total revenue earned from completed sessions so that I can manage my practice finances.
* **Acceptance Criteria**:
  1. Lists completed patient sessions with consultation date, slot time, and feedback score.
  2. Computes aggregate revenue based on completed sessions and session fee.
* **Preconditions**: Doctor has completed historical appointments.
* **Priority**: Medium | **Module**: Financial History

#### **US-DOC-005**: Doctor Patient Feedback Inspection
* **User Story**: As a doctor, I want to inspect detailed patient reviews and star ratings for each past appointment so that I can assess patient satisfaction.
* **Acceptance Criteria**:
  1. Displays 1–5 star icons next to historical appointments.
  2. Clicking details navigates to `/doctor/feedback/:id`.
  3. Renders review title, rating, and patient comments.
* **Preconditions**: Feedback has been submitted by patient.
* **Priority**: Low | **Module**: Patient Reviews

---

### Admin & Security Stories

#### **US-ADM-001**: Admin Doctor Onboarding & Credential Verification
* **User Story**: As a hospital administrator, I want to register and verify new doctors in the hospital database so that only licensed medical professionals can accept appointments.
* **Acceptance Criteria**:
  1. Accepts username, password, name, phone, specialization, and session fee.
  2. Enforces unique username constraint across system.
  3. Automatically creates default daily slot templates (`09:00`, `12:00`, `15:00`).
  4. Newly registered doctors immediately appear in the patient search directory.
* **Preconditions**: Admin is authenticated.
* **Priority**: High | **Module**: Hospital Administration

#### **US-SEC-001**: Role-Based Access Control & Route Protection
* **User Story**: As a security administrator, I want unauthenticated or unauthorized users to be denied access to clinical portals (`/doctor`, `/patient`) so that sensitive medical records remain confidential.
* **Acceptance Criteria**:
  1. Navigating directly to `/doctor` without a valid token redirects to `/doctorlogin`.
  2. Patient JWT token is rejected on doctor-only endpoints (`/doctors/update`).
  3. Tampered or expired JWT tokens return 401 Unauthorized.
  4. Logging out cleanses `localStorage` and revokes route access.
* **Preconditions**: System is running.
* **Priority**: Critical | **Module**: Security & RBAC
