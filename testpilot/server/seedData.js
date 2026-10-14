/**
 * TestPilot - Seed Data
 * Includes 17 Full-Stack Healthcare User Stories across Patient, Doctor, and Admin roles,
 * Initial Test Cases (Positive, Negative, Edge Case), and
 * 10 Prompt Engineering Experiment Iterations for Faculty Submission.
 */

const userStories = [
  {
    id: "US-PAT-001",
    role: "patient",
    module: "Authentication & Onboarding",
    title: "Patient Registration and Profile Initialization",
    story: "As a new patient, I want to create an account with my basic personal information so that I can schedule medical consultations.",
    acceptanceCriteria: [
      "The system shall accept patient name, contact email, and valid phone number.",
      "The system shall prevent duplicate registration with the same contact identifier.",
      "The patient profile shall be stored in the database with an initial unverified status until first login.",
      "A confirmation greeting and default profile dashboard shall be displayed upon successful creation."
    ],
    priority: "High",
    createdAt: "2026-10-10T10:00:00Z"
  },
  {
    id: "US-PAT-002",
    role: "patient",
    module: "Authentication",
    title: "Patient Google OAuth Login",
    story: "As a registered patient, I want to log in using my Google account so that I can securely and seamlessly access my patient portal without remembering extra passwords.",
    acceptanceCriteria: [
      "Clicking 'Login As A Patient' shall initiate the Google OAuth 2.0 authorization sequence.",
      "The system shall decode the JWT token (sub, name, email, picture) using the configured algorithm.",
      "A valid token shall transition the patient to the Patient Dashboard (/patient).",
      "If Google authentication fails or is cancelled, a clear error notification shall be rendered without system crash."
    ],
    priority: "Critical",
    createdAt: "2026-10-10T10:15:00Z"
  },
  {
    id: "US-PAT-003",
    role: "patient",
    module: "Doctor Discovery",
    title: "Search and Browse Doctors by Specialty",
    story: "As a patient, I want to search and filter doctors by medical specialization (e.g. Cardiology, Dermatology, Pathology) so that I find the right healthcare specialist for my symptoms.",
    acceptanceCriteria: [
      "The search bar shall support case-insensitive autocomplete matching doctor specialization and name.",
      "Matching doctor cards shall display full name, specialty, phone contact, and consultation fee per session.",
      "A 'Book' call-to-action button shall be visible on each qualified doctor card.",
      "If no doctor matches the query, a friendly 'No specialist found' fallback message shall be shown."
    ],
    priority: "High",
    createdAt: "2026-10-10T10:30:00Z"
  },
  {
    id: "US-PAT-004",
    role: "patient",
    module: "Appointment Booking",
    title: "Doctor Consultation Date Selection",
    story: "As a patient, I want to browse an interactive calendar and pick a future consultation date so that I can schedule a visit at my convenience.",
    acceptanceCriteria: [
      "The calendar shall visually disable and disallow selection of past dates.",
      "Clicking a valid future date shall highlight the day and persist the chosen date string (YYYY-MM-DD).",
      "A 'Confirm And Go to Next Step' button shall remain disabled until a valid date is picked.",
      "Navigating forward shall transition the user to the Slot Selection screen."
    ],
    priority: "High",
    createdAt: "2026-10-10T11:00:00Z"
  },
  {
    id: "US-PAT-005",
    role: "patient",
    module: "Appointment Booking",
    title: "Time Slot Selection & Collision Prevention",
    story: "As a patient, I want to view available consultation slots (09:00:00, 12:00:00, 15:00:00) for my selected doctor and date, and book an open slot so that I am assured consultation time.",
    acceptanceCriteria: [
      "The system shall query the doctor's dateSchedule and display slot statuses in real time.",
      "Available slots shall display an active 'Book Slot' button.",
      "Already booked slots (isBooked = true) shall be disabled or clearly marked as unavailable.",
      "Selecting an open slot shall temporarily reserve it and proceed to the Payment stage."
    ],
    priority: "Critical",
    createdAt: "2026-10-10T11:30:00Z"
  },
  {
    id: "US-PAT-006",
    role: "patient",
    module: "Billing & Payment",
    title: "Consultation Fee Payment Checkout",
    story: "As a patient, I want to pay the consultation fee through a secure online payment interface so that my appointment booking is officially confirmed.",
    acceptanceCriteria: [
      "The payment receipt shall itemize Doctor Name, Specialization, Consultation Fee, Tax, and Grand Total.",
      "Clicking 'Pay Now' shall launch the secured payment dialog.",
      "The system shall validate postal code and test card numbers before processing transaction.",
      "Upon successful charge, an appointment record shall be written to the database with a transaction identifier."
    ],
    priority: "High",
    createdAt: "2026-10-10T12:00:00Z"
  },
  {
    id: "US-PAT-007",
    role: "patient",
    module: "Telehealth & Notifications",
    title: "Virtual Meeting Link Generation & Appointment Confirmation",
    story: "As a patient, I want to receive an appointment confirmation with a Google Meet or teleconsultation link so that I can join the remote doctor consultation.",
    acceptanceCriteria: [
      "Upon successful slot booking and payment, a unique teleconsultation link shall be associated with the appointment.",
      "The link shall appear under 'Appointment Status' on the Patient Dashboard.",
      "Clicking 'Join Meet' shall open the secure meeting in a new browser tab.",
      "The consultation status shall reflect 'Scheduled' and sync with the doctor's agenda."
    ],
    priority: "High",
    createdAt: "2026-10-10T12:30:00Z"
  },
  {
    id: "US-PAT-008",
    role: "patient",
    module: "Patient Records",
    title: "Appointment History & Status Tracking",
    story: "As a patient, I want to view a chronological history of my previous appointments and active bookings so that I can keep track of my medical history.",
    acceptanceCriteria: [
      "The 'Appointment Status' sub-interface shall show current/upcoming appointments with date, time, and doctor name.",
      "The 'Previous Appointments' sub-interface shall display past appointments with consultation dates.",
      "Patients shall have an option to navigate to doctor feedback from past appointment entries."
    ],
    priority: "Medium",
    createdAt: "2026-10-10T13:00:00Z"
  },
  {
    id: "US-PAT-009",
    role: "patient",
    module: "Quality & Feedback",
    title: "Patient Feedback & Star Rating Submission",
    story: "As a patient, I want to submit a 1 to 5 star rating and written review for a completed consultation so that I can evaluate the care provided.",
    acceptanceCriteria: [
      "A feedback form shall be accessible only for previous appointments that have concluded.",
      "The form shall accept a star rating between 1 and 5, a feedback title, and detailed review text.",
      "Submitting feedback shall update the appointment record (`feedback.given = true`, `feedback.stars = X`).",
      "A patient cannot submit duplicate feedback for the same completed appointment."
    ],
    priority: "Medium",
    createdAt: "2026-10-10T13:30:00Z"
  },
  {
    id: "US-PAT-010",
    role: "patient",
    module: "Profile Management",
    title: "Patient Contact Phone Number Update",
    story: "As a patient, I want to update my contact phone number on my profile so that doctors and hospital staff can reach me in case of urgent consultation rescheduling.",
    acceptanceCriteria: [
      "The phone update sub-interface shall validate the phone number to be a valid 10-digit format.",
      "Submitting a valid number shall issue a PUT request to /patients/update-phone.",
      "The profile view shall immediately reflect the updated phone number.",
      "Invalid or empty phone inputs shall display inline validation error messages."
    ],
    priority: "Medium",
    createdAt: "2026-10-10T14:00:00Z"
  },
  {
    id: "US-DOC-001",
    role: "doctor",
    module: "Doctor Authentication",
    title: "Doctor Secure Credential Login",
    story: "As a medical doctor, I want to authenticate using my clinical username and password so that I can access my daily appointments and patient schedule.",
    acceptanceCriteria: [
      "The Doctor Login page (/doctorlogin) shall accept username and password.",
      "Entering valid credentials (e.g. username 'test', password 'test') shall return a signed JWT token.",
      "The token shall be stored in localStorage and user redirected to Doctor Dashboard (/doctor).",
      "Submitting incorrect credentials shall show 'wrong username or password' without revealing account existence."
    ],
    priority: "Critical",
    createdAt: "2026-10-10T14:30:00Z"
  },
  {
    id: "US-DOC-002",
    role: "doctor",
    module: "Clinical Schedule",
    title: "Doctor Today's Consultation Schedule View",
    story: "As a doctor, I want to view a timeline of all patient appointments scheduled for today so that I can prepare for my consultations.",
    acceptanceCriteria: [
      "The dashboard shall display Today's Schedule with Date, Time Slot, Patient Name, and Meet Link.",
      "Consultations shall be ordered chronologically by slot time (09:00, 12:00, 15:00).",
      "If no appointments are booked for today, a clear 'No appointments scheduled today' message shall appear.",
      "Clicking 'Join Meet' shall open the respective patient's virtual meeting."
    ],
    priority: "Critical",
    createdAt: "2026-10-10T15:00:00Z"
  },
  {
    id: "US-DOC-003",
    role: "doctor",
    module: "Doctor Profile",
    title: "Doctor Profile & Fee Management",
    story: "As a doctor, I want to inspect and update my personal details, phone number, medical specialty, and consultation fee per session so that patients see current information.",
    acceptanceCriteria: [
      "The 'Personal Details' view shall display Doctor Name, Specialization, Phone Number, and Fees Per Session.",
      "Updating fees or contact info shall persist to the database via /doctors/update.",
      "Updated consultation fees shall immediately apply to future patient slot bookings."
    ],
    priority: "Medium",
    createdAt: "2026-10-10T15:30:00Z"
  },
  {
    id: "US-DOC-004",
    role: "doctor",
    module: "Financial History",
    title: "Doctor Appointment History & Earnings Summary",
    story: "As a doctor, I want to review previous appointments and track total revenue earned from completed sessions so that I can manage my practice finances.",
    acceptanceCriteria: [
      "The 'Previous Appointments' view shall list all completed patient sessions.",
      "Each entry shall show consultation date, patient name, slot time, and feedback score.",
      "The interface shall aggregate total earnings based on completed appointments and doctor session fee."
    ],
    priority: "Medium",
    createdAt: "2026-10-10T16:00:00Z"
  },
  {
    id: "US-DOC-005",
    role: "doctor",
    module: "Patient Reviews",
    title: "Doctor Patient Feedback Inspection",
    story: "As a doctor, I want to inspect detailed patient reviews and star ratings for each past appointment so that I can improve my bedside manner and clinical service.",
    acceptanceCriteria: [
      "The feedback column in Previous Appointments shall render star icons corresponding to the rating.",
      "Clicking on feedback details shall navigate to /doctor/feedback/:id.",
      "The page shall render the review title, detailed narrative, and patient identity."
    ],
    priority: "Low",
    createdAt: "2026-10-10T16:30:00Z"
  },
  {
    id: "US-ADM-001",
    role: "admin",
    module: "Hospital Administration",
    title: "Admin Doctor Onboarding & Credential Verification",
    story: "As a hospital administrator, I want to register and verify new doctors in the hospital database so that only licensed medical professionals can accept appointments.",
    acceptanceCriteria: [
      "The system shall accept doctor username, encrypted password, full name, phone, specialization, and session fee.",
      "Upon creation via /doctors/add, initial appointment slot templates shall be initialized.",
      "System shall enforce uniqueness of doctor username across the platform.",
      "Newly registered doctors shall immediately appear in the patient doctor search directory."
    ],
    priority: "High",
    createdAt: "2026-10-10T17:00:00Z"
  },
  {
    id: "US-SEC-001",
    role: "admin",
    module: "Security & RBAC",
    title: "Role-Based Access Control and Unauthorized Route Protection",
    story: "As a security administrator, I want unauthenticated or unauthorized users to be denied access to clinical portals (/doctor, /patient) so that sensitive medical records remain confidential.",
    acceptanceCriteria: [
      "Navigating directly to /doctor without a valid doctor JWT shall redirect immediately to /doctorlogin.",
      "A patient JWT token shall not grant access to doctor-only endpoints (/doctors/update, /doctor).",
      "Tampered, expired, or malformed JWT tokens shall be rejected with 401 Unauthorized.",
      "Logging out shall clear localStorage tokens and invalidate the client session."
    ],
    priority: "Critical",
    createdAt: "2026-10-10T17:30:00Z"
  }
];

const testCases = [
  {
    id: "TP-TC-001",
    userStoryId: "US-DOC-001",
    userStoryTitle: "Doctor Secure Credential Login",
    title: "Doctor Login with Valid Credentials (Happy Path)",
    description: "Verify that a registered doctor can log in successfully with valid username and password, receiving a signed JWT token and landing on the doctor dashboard.",
    scenarioType: "positive",
    priority: "Critical",
    role: "doctor",
    preconditions: [
      "Healthcare backend is running on http://localhost:5000",
      "Doctor account exists with username 'test' and password 'test'",
      "Browser local storage has no preexisting doctor session"
    ],
    steps: [
      { stepNumber: 1, action: "Navigate to doctor login page", testData: "http://localhost:3000/doctorlogin", expectedResult: "Doctor login form with username and password fields is rendered" },
      { stepNumber: 2, action: "Enter valid username into username input", testData: "test", expectedResult: "Username field contains 'test'" },
      { stepNumber: 3, action: "Enter valid password into password input", testData: "test", expectedResult: "Password field contains 'test' (masked)" },
      { stepNumber: 4, action: "Click the 'Login' submit button", testData: "Click event", expectedResult: "POST request sent to /doctors/login; returns 200 with JWT token" },
      { stepNumber: 5, action: "Observe client navigation", testData: "URL transition", expectedResult: "User is redirected to /doctor dashboard with active session" }
    ],
    expectedResult: "Doctor is successfully authenticated, JWT token stored in localStorage, and Doctor Dashboard is displayed.",
    status: "approved",
    reviewNotes: "Verified against reference backend bcrypt hashing logic. Production ready.",
    flaggedGaps: [],
    promptVersion: "v3-CoT-Domain",
    generatedAt: "2026-10-11T09:00:00Z",
    updatedAt: "2026-10-11T09:15:00Z"
  },
  {
    id: "TP-TC-002",
    userStoryId: "US-DOC-001",
    userStoryTitle: "Doctor Secure Credential Login",
    title: "Doctor Login with Invalid Password (Negative Flow)",
    description: "Verify that entering an incorrect password for an existing doctor username is rejected without leaking sensitive internal details.",
    scenarioType: "negative",
    priority: "High",
    role: "doctor",
    preconditions: [
      "Healthcare backend is running on http://localhost:5000",
      "Doctor account exists with username 'test'"
    ],
    steps: [
      { stepNumber: 1, action: "Navigate to doctor login page", testData: "http://localhost:3000/doctorlogin", expectedResult: "Doctor login form is displayed" },
      { stepNumber: 2, action: "Enter valid username", testData: "test", expectedResult: "Username input populated" },
      { stepNumber: 3, action: "Enter wrong password", testData: "wrongPassword999", expectedResult: "Password input populated" },
      { stepNumber: 4, action: "Click 'Login' button", testData: "Click event", expectedResult: "POST /doctors/login returns message 'wrong username or password'" },
      { stepNumber: 5, action: "Observe UI feedback", testData: "UI Alert", expectedResult: "Error notification displayed; user remains on /doctorlogin; no token saved" }
    ],
    expectedResult: "Authentication is denied; user remains unauthenticated and protected routes remain inaccessible.",
    status: "approved",
    reviewNotes: "Essential negative test case for doctor credential protection.",
    flaggedGaps: [],
    promptVersion: "v3-CoT-Domain",
    generatedAt: "2026-10-11T09:05:00Z",
    updatedAt: "2026-10-11T09:16:00Z"
  },
  {
    id: "TP-TC-003",
    userStoryId: "US-PAT-003",
    userStoryTitle: "Search and Browse Doctors by Specialty",
    title: "Patient Doctor Search by Specialty with Auto-Complete",
    description: "Verify that entering a medical specialty filters doctor listings dynamically and reveals relevant physician cards with fees and contact details.",
    scenarioType: "positive",
    priority: "High",
    role: "patient",
    preconditions: [
      "At least 2 doctors exist in database with specialties 'Cardiology' and 'Dermatology'",
      "Patient is on search doctor page"
    ],
    steps: [
      { stepNumber: 1, action: "Navigate to search doctor page", testData: "http://localhost:3000/patient/searchdoctor", expectedResult: "Search input box is displayed" },
      { stepNumber: 2, action: "Type specialty into search box", testData: "derma", expectedResult: "Dropdown or filtered list shows Dermatology doctors" },
      { stepNumber: 3, action: "Select or search specialty", testData: "Dermatology", expectedResult: "Doctor card appears showing name, specialization, phone, and fee" },
      { stepNumber: 4, action: "Verify 'Book' button presence", testData: "Element inspection", expectedResult: "Active 'Book' button is present and clickable" }
    ],
    expectedResult: "Specialist doctors are filtered accurately and display full clinical consultation pricing.",
    status: "approved",
    reviewNotes: "Covers main discovery user flow.",
    flaggedGaps: [],
    promptVersion: "v2-FewShot",
    generatedAt: "2026-10-11T10:00:00Z",
    updatedAt: "2026-10-11T10:10:00Z"
  },
  {
    id: "TP-TC-004",
    userStoryId: "US-PAT-005",
    userStoryTitle: "Time Slot Selection & Collision Prevention",
    title: "Prevent Double Booking of Already Reserved Slot (Edge Case)",
    description: "Verify that when a time slot (e.g. 09:00:00) is booked by Patient A, Patient B attempting to reserve the identical slot is prevented and warned of slot unavailability.",
    scenarioType: "edge_case",
    priority: "Critical",
    role: "patient",
    preconditions: [
      "Doctor has a schedule for date '2026-10-20'",
      "Slot 09:00:00 has isBooked set to true"
    ],
    steps: [
      { stepNumber: 1, action: "Query available slots for doctor on date", testData: "{ doctorId: 'doc123', date: '2026-10-20' }", expectedResult: "API returns slot list including 09:00:00 marked isBooked: true" },
      { stepNumber: 2, action: "Attempt POST to /doctors/book-slot for 09:00:00", testData: "{ slotId: 'slot-0900', isBooked: true }", expectedResult: "System prevents booking or flags collision" },
      { stepNumber: 3, action: "Observe UI slot button", testData: "DOM state", expectedResult: "Button for 09:00:00 is disabled or displays 'Booked'" }
    ],
    expectedResult: "System enforces concurrency safety and prevents double-booking of doctor slots.",
    status: "approved",
    reviewNotes: "Critical clinical concurrency edge case flagged by CoT Prompt Iteration 4.",
    flaggedGaps: [],
    promptVersion: "v4-CoT-Edge",
    generatedAt: "2026-10-11T11:00:00Z",
    updatedAt: "2026-10-11T11:15:00Z"
  },
  {
    id: "TP-TC-005",
    userStoryId: "US-SEC-001",
    userStoryTitle: "Role-Based Access Control and Unauthorized Route Protection",
    title: "Unauthenticated Direct Access to Doctor Dashboard is Blocked",
    description: "Verify that an unauthenticated user attempting to directly navigate to /doctor via address bar is blocked and redirected to /doctorlogin.",
    scenarioType: "negative",
    priority: "Critical",
    role: "admin",
    preconditions: [
      "Browser localStorage has no token or invalid token"
    ],
    steps: [
      { stepNumber: 1, action: "Clear localStorage tokens", testData: "localStorage.clear()", expectedResult: "Storage is empty" },
      { stepNumber: 2, action: "Directly navigate to /doctor", testData: "http://localhost:3000/doctor", expectedResult: "Client auth guard checks token; token missing" },
      { stepNumber: 3, action: "Verify final URL location", testData: "window.location.pathname", expectedResult: "User is redirected to /doctorlogin or shows Access Denied" }
    ],
    expectedResult: "Unauthorized visitor cannot view doctor clinical schedules without valid credentials.",
    status: "approved",
    reviewNotes: "Security boundary test case validated.",
    flaggedGaps: [],
    promptVersion: "v3-CoT-Domain",
    generatedAt: "2026-10-11T11:30:00Z",
    updatedAt: "2026-10-11T11:45:00Z"
  },
  {
    id: "TP-TC-006",
    userStoryId: "US-PAT-009",
    userStoryTitle: "Patient Feedback & Star Rating Submission",
    title: "Submit 5-Star Rating and Feedback for Concluded Appointment",
    description: "Verify that a patient can rate their doctor and enter text feedback on a completed appointment, which persists into the appointment feedback document.",
    scenarioType: "positive",
    priority: "Medium",
    role: "patient",
    preconditions: [
      "An appointment exists with appointmentId 'app-7788' and feedback.given is false"
    ],
    steps: [
      { stepNumber: 1, action: "Open feedback page for appointment", testData: "/patient/feedback/app-7788", expectedResult: "Feedback form loads with 5-star selector, title, and review box" },
      { stepNumber: 2, action: "Select 5 stars rating", testData: "5", expectedResult: "All 5 stars highlighted" },
      { stepNumber: 3, action: "Enter feedback title", testData: "Excellent bedside care and prompt diagnosis", expectedResult: "Title field populated" },
      { stepNumber: 4, action: "Enter feedback review narrative", testData: "Dr. Sharma explained everything clearly. Very satisfied.", expectedResult: "Review field populated" },
      { stepNumber: 5, action: "Click Submit Feedback button", testData: "Click submit", expectedResult: "PUT to /appointments/feedback returns 200 'Feedback updated successfully!'" }
    ],
    expectedResult: "Feedback is persisted with 5 stars and feedback.given marked true.",
    status: "approved",
    reviewNotes: "Validates clinical feedback cycle.",
    flaggedGaps: [],
    promptVersion: "v3-CoT-Domain",
    generatedAt: "2026-10-11T12:00:00Z",
    updatedAt: "2026-10-11T12:15:00Z"
  }
];

const promptExperiments = [
  {
    id: "PE-EXP-001",
    iterationNumber: 1,
    targetStoryId: "US-PAT-005",
    targetStoryTitle: "Patient books an appointment with a doctor",
    role: "patient",
    promptStrategy: "Zero-Shot Naive Baseline",
    model: "gpt-4o-mini",
    temperature: 0.7,
    systemPrompt: "You are a test case generator. Write test cases for the user story provided.",
    userPrompt: "Generate test cases for: As a patient, I want to book an appointment with a doctor so that I can receive a consultation.",
    rawResponse: `Test Case 1: Book Appointment
Step 1: Open website
Step 2: Click book appointment
Step 3: Select doctor
Step 4: Click confirm
Expected: Appointment is booked.

Test Case 2: Cancel Appointment
Step 1: Click cancel
Expected: Appointment cancelled.`,
    parsedTestCasesCount: 2,
    ratings: {
      completeness: 2,
      accuracy: 2,
      healthcareRelevance: 2,
      overallScore: 2.0
    },
    whatChanged: "Baseline prompt with zero domain instructions, no persona, and unstructured prompt text.",
    whyItChanged: "Initial baseline to measure what off-the-shelf LLMs produce without prompt engineering. It produced only 2 vague tests, had no preconditions, omitted negative scenarios, and completely missed healthcare domain realities (time slots, doctor schedules, booking collisions).",
    keyFindings: "Naive zero-shot prompting leads to severe under-specification and QA hallucinations (assuming arbitrary one-click booking without slot checks).",
    createdAt: "2026-10-11T13:00:00Z"
  },
  {
    id: "PE-EXP-002",
    iterationNumber: 2,
    targetStoryId: "US-PAT-005",
    targetStoryTitle: "Patient books an appointment with a doctor",
    role: "patient",
    promptStrategy: "Role & Persona Grounded",
    model: "gpt-4o-mini",
    temperature: 0.5,
    systemPrompt: "You are a Senior Healthcare QA Engineer specializing in hospital management software, EHR systems, and HIPAA compliance.",
    userPrompt: "As a patient, I want to book an appointment with a doctor so that I can receive a consultation. Generate positive and negative test cases including preconditions and step-by-step actions.",
    rawResponse: `TC-01: Successful Appointment Booking (Positive)
Preconditions: Patient is logged in, doctor has available schedule.
Steps: 1. Go to search doctor; 2. Choose doctor; 3. Pick date; 4. Pick time slot; 5. Pay fee.
Expected: Appointment confirmed.

TC-02: Booking when no slots are free (Negative)
Preconditions: Doctor schedule has all slots booked.
Steps: 1. Select doctor; 2. Select date.
Expected: Error shown that doctor is unavailable.`,
    parsedTestCasesCount: 3,
    ratings: {
      completeness: 3,
      accuracy: 3,
      healthcareRelevance: 3,
      overallScore: 3.0
    },
    whatChanged: "Added QA persona ('Senior Healthcare QA Engineer') and requested explicit positive and negative test cases with preconditions.",
    whyItChanged: "Addressing lack of test categorization and missing preconditions from Iteration 1. The persona immediately elicited negative testing (no slots free) and recognized doctor schedule availability.",
    keyFindings: "Role grounding significantly improves test mindset, but output format remains non-standardized and lacks boundary edge cases.",
    createdAt: "2026-10-11T13:30:00Z"
  },
  {
    id: "PE-EXP-003",
    iterationNumber: 3,
    targetStoryId: "US-PAT-005",
    targetStoryTitle: "Patient books an appointment with a doctor",
    role: "patient",
    promptStrategy: "Few-Shot Schema Grounded",
    model: "gpt-4o-mini",
    temperature: 0.3,
    systemPrompt: "You are an automated test designer. Return ONLY a valid JSON array of test cases conforming exactly to the provided schema.",
    userPrompt: "User Story: US-PAT-005 Patient books appointment. Given the reference JSON schema with testId, title, scenarioType, preconditions, and steps array, generate 4 test cases.",
    rawResponse: `[
  { "id": "TC-PAT-01", "scenarioType": "positive", "title": "Book Available 09:00 Slot", "preconditions": ["Doctor has free slots"], "steps": [{"stepNumber": 1, "action": "Select 09:00", "testData": "09:00:00", "expectedResult": "Slot selected"}], "expectedResult": "Booking confirmed" },
  { "id": "TC-PAT-02", "scenarioType": "negative", "title": "Attempt to Book Without Date Selection", "preconditions": ["Patient on booking page"], "steps": [{"stepNumber": 1, "action": "Click Next Step without date", "testData": "null", "expectedResult": "Validation error displayed"}], "expectedResult": "Navigation blocked" }
]`,
    parsedTestCasesCount: 4,
    ratings: {
      completeness: 4,
      accuracy: 4,
      healthcareRelevance: 4,
      overallScore: 4.0
    },
    whatChanged: "Introduced strict JSON schema specification and two few-shot examples demonstrating step arrays with testData and expectedResult.",
    whyItChanged: "Unstructured plain text cannot be directly executed by automation runners like Playwright. Few-shot formatting forced machine-parseable JSON with 100% syntactic conformity.",
    keyFindings: "Few-shot examples with strict JSON output eliminate parsing errors and guarantee deterministic step schema.",
    createdAt: "2026-10-11T14:00:00Z"
  },
  {
    id: "PE-EXP-004",
    iterationNumber: 4,
    targetStoryId: "US-PAT-005",
    targetStoryTitle: "Patient books an appointment with a doctor",
    role: "patient",
    promptStrategy: "Chain-of-Thought (CoT) Clinical Concurrency Specialist",
    model: "gpt-4o",
    temperature: 0.2,
    systemPrompt: "You are a Principal Healthcare Software Test Architect. Before outputting test cases, perform step-by-step reasoning on: 1) Medical safety risks; 2) Concurrent race conditions (e.g. two patients booking 09:00:00 simultaneously); 3) Payment session drop-offs; 4) Timezone and past date constraints. Then output structured JSON test cases covering Positive, Negative, and Edge Cases.",
    userPrompt: "Generate a comprehensive test suite for US-PAT-005 (Time Slot Selection & Collision Prevention) targeting our MERN healthcare application.",
    rawResponse: `THINKING REASONING:
1. Medical safety: An unconfirmed appointment could lead to missed medical care.
2. Concurrency: Two patients viewing 09:00:00 simultaneously can trigger double booking unless atomic updates lock the slot.
3. Edge cases: Past dates, leap days, network timeouts during Stripe payment.
TEST CASES:
Generated 6 test cases: Happy path booking, Concurrent double booking rejection, Past date restriction, Payment timeout slot release, Autocomplete specialty miss, and Slot status persistence.`,
    parsedTestCasesCount: 6,
    ratings: {
      completeness: 5,
      accuracy: 5,
      healthcareRelevance: 5,
      overallScore: 5.0
    },
    whatChanged: "Integrated Chain-of-Thought (CoT) reasoning phase explicitly asking the LLM to analyze concurrency collisions and clinical edge cases before generating tests.",
    whyItChanged: "Addressing subtle healthcare bugs where two patients book the same doctor slot at 09:00:00. CoT compelled the model to generate concurrency edge-case tests with atomic locking assertions.",
    keyFindings: "Chain-of-Thought prompting drastically increases edge-case discovery (from 0 edge cases in Iteration 1 to 3 deep concurrency edge cases in Iteration 4).",
    createdAt: "2026-10-11T14:30:00Z"
  },
  {
    id: "PE-EXP-005",
    iterationNumber: 5,
    targetStoryId: "US-DOC-001",
    targetStoryTitle: "Doctor logs in and manages schedule",
    role: "doctor",
    promptStrategy: "Zero-Shot Naive Baseline (Doctor Role)",
    model: "gpt-4o-mini",
    temperature: 0.7,
    systemPrompt: "Generate test cases for doctor login and schedule management.",
    userPrompt: "As a doctor I want to log in and see today's schedule.",
    rawResponse: `Test 1: Doctor Login
Enter name and password, see calendar.

Test 2: Drag and drop appointment to reschedule
Click appointment and drag to 2pm.`,
    parsedTestCasesCount: 2,
    ratings: {
      completeness: 2,
      accuracy: 2,
      healthcareRelevance: 2,
      overallScore: 2.0
    },
    whatChanged: "Naive zero-shot prompt applied to Doctor user story.",
    whyItChanged: "Evaluating model hallucination tendencies on doctor workflows. The model hallucinated a drag-and-drop calendar rescheduling feature that does not exist in the reference codebase.",
    keyFindings: "Without architectural grounding, LLMs readily invent non-existent features (e.g. interactive drag-and-drop). Grounding prompt in actual routes and DB models is required.",
    createdAt: "2026-10-11T15:00:00Z"
  },
  {
    id: "PE-EXP-006",
    iterationNumber: 6,
    targetStoryId: "US-DOC-001",
    targetStoryTitle: "Doctor logs in and manages schedule",
    role: "doctor",
    promptStrategy: "Codebase & Route Grounded Context",
    model: "gpt-4o-mini",
    temperature: 0.3,
    systemPrompt: "You are a QA automation engineer testing a React + Express hospital app. System routes: POST /doctors/login, GET /doctor, GET /doctor/perosnaldetails, GET /doctors/get-slots. Database uses fixed slots: 09:00:00, 12:00:00, 15:00:00.",
    userPrompt: "Generate structured tests for doctor login and schedule review conforming to the known routes and slot times.",
    rawResponse: `TC-DOC-01: Valid Doctor Login (username: 'test', password: 'test') -> returns JWT and navigates to /doctor
TC-DOC-02: Invalid Doctor Password -> returns 201 message 'wrong username or password'
TC-DOC-03: View Today's Schedule -> fetches slots (09:00, 12:00, 15:00) and displays patient names and meet links`,
    parsedTestCasesCount: 4,
    ratings: {
      completeness: 4,
      accuracy: 4,
      healthcareRelevance: 4,
      overallScore: 4.0
    },
    whatChanged: "Provided exact system context: Express endpoints, fixed slot timings (09:00:00, 12:00:00, 15:00:00), and JWT response format.",
    whyItChanged: "Eliminated the hallucinated drag-and-drop calendar from Iteration 5. Grounding the prompt in the exact codebase yielded tests that directly mirror real backend behavior.",
    keyFindings: "API and schema grounding drops hallucination rate to near 0% while matching actual application endpoints.",
    createdAt: "2026-10-11T15:30:00Z"
  },
  {
    id: "PE-EXP-007",
    iterationNumber: 7,
    targetStoryId: "US-DOC-002",
    targetStoryTitle: "Doctor logs in and manages schedule",
    role: "doctor",
    promptStrategy: "CoT Edge Case & Defensive State Enforcement",
    model: "gpt-4o",
    temperature: 0.2,
    systemPrompt: "You are a Principal Test Automation Architect. Analyze doctor schedule edge cases: 1) Doctor with zero appointments booked for today; 2) Doctor session expired while on schedule view; 3) Meet link generation failure. Generate comprehensive JSON test cases.",
    userPrompt: "Generate test suite covering US-DOC-002 (Today's Consultation Schedule) with full positive, negative, and edge-case coverage.",
    rawResponse: `Generated 5 test cases including: Empty schedule state graceful fallback, active meet link launch with noopener noreferrer, token expiry auto-logout, and multi-slot sequential order verification.`,
    parsedTestCasesCount: 5,
    ratings: {
      completeness: 5,
      accuracy: 5,
      healthcareRelevance: 5,
      overallScore: 5.0
    },
    whatChanged: "Instructed the LLM to focus on empty clinical rosters, token expiration mid-shift, and telehealth link rendering.",
    whyItChanged: "Doctors frequently encounter days with zero bookings or prolonged shifts where tokens expire. Defensive UI testing is critical in medical environments.",
    keyFindings: "Prompting specifically for empty states and session timeouts catches defensive programming bugs that standard happy-path tests miss.",
    createdAt: "2026-10-11T16:00:00Z"
  },
  {
    id: "PE-EXP-008",
    iterationNumber: 8,
    targetStoryId: "US-SEC-001",
    targetStoryTitle: "Unauthorised user attempts to access a restricted page",
    role: "admin",
    promptStrategy: "Zero-Shot Security Baseline",
    model: "gpt-4o-mini",
    temperature: 0.7,
    systemPrompt: "Generate security tests for a web application.",
    userPrompt: "Write security tests for unauthorized user accessing restricted pages in a hospital app.",
    rawResponse: `Test 1: SQL Injection in search bar
Test 2: XSS in feedback box
Test 3: DDoS attack on server`,
    parsedTestCasesCount: 3,
    ratings: {
      completeness: 2,
      accuracy: 3,
      healthcareRelevance: 2,
      overallScore: 2.3
    },
    whatChanged: "Generic security prompt without role or route definitions.",
    whyItChanged: "Testing baseline security test generation. The model defaulted to textbook web exploits (SQLi, XSS, DDoS) and completely ignored role-based authorization boundaries (Patient vs Doctor).",
    keyFindings: "Without RBAC context, generic security prompts miss medical authorization bypass and cross-role privilege escalation.",
    createdAt: "2026-10-11T16:30:00Z"
  },
  {
    id: "PE-EXP-009",
    iterationNumber: 9,
    targetStoryId: "US-SEC-001",
    targetStoryTitle: "Unauthorised user attempts to access a restricted page",
    role: "admin",
    promptStrategy: "Healthcare RBAC Matrix-Guided Prompt",
    model: "gpt-4o-mini",
    temperature: 0.3,
    systemPrompt: "You are a Healthcare Cybersecurity & QA Compliance Auditor. Role access rules: Unauthenticated users: ONLY '/' and '/doctorlogin'. Patients: '/patient/*', NEVER '/doctor/*'. Doctors: '/doctor/*', NEVER patient booking as patient. Return structured JSON test cases.",
    userPrompt: "Generate RBAC authorization test cases verifying that privilege boundaries are strictly enforced across all routes.",
    rawResponse: `TC-SEC-01: Direct navigation to /doctor without token redirects to /doctorlogin
TC-SEC-02: Patient JWT presented to doctor update endpoint returns 401/403
TC-SEC-03: Logout cleanses localStorage and blocks back-button navigation`,
    parsedTestCasesCount: 4,
    ratings: {
      completeness: 4,
      accuracy: 4,
      healthcareRelevance: 4,
      overallScore: 4.0
    },
    whatChanged: "Provided explicit Role-Based Access Control (RBAC) matrix defining allowed and disallowed routes per role.",
    whyItChanged: "Replaced generic OWASP tests with healthcare-specific authorization tests to protect confidential patient and doctor data.",
    keyFindings: "Matrix-guided prompt structures prevent permission leakage and produce test cases that directly assert on HTTP 401/403 and client redirects.",
    createdAt: "2026-10-11T17:00:00Z"
  },
  {
    id: "PE-EXP-010",
    iterationNumber: 10,
    targetStoryId: "US-SEC-001",
    targetStoryTitle: "Unauthorised user attempts to access a restricted page",
    role: "admin",
    promptStrategy: "Adversarial Token Tampering & Session Hijacking CoT",
    model: "gpt-4o",
    temperature: 0.2,
    systemPrompt: "You are a Principal Security Test Architect for HIPAA-regulated platforms. Reason step-by-step through: 1) Malformed JWT signature injection; 2) LocalStorage token tampering (changing role payload); 3) Concurrent multi-tab session expiration; 4) CSRF and CORS origin spoofing. Generate executable test cases with exact assertions.",
    userPrompt: "Generate advanced security test suite for US-SEC-001 covering adversarial access attempts against the healthcare backend and frontend.",
    rawResponse: `Generated 6 test cases:
1. Malformed JWT signature rejection on /doctors/update
2. Tampered payload doctor ID spoofing
3. Unauthenticated direct URL navigation guard
4. Patient token cross-role invocation block
5. LocalStorage clearing on logout
6. Expired token automated session revoking`,
    parsedTestCasesCount: 6,
    ratings: {
      completeness: 5,
      accuracy: 5,
      healthcareRelevance: 5,
      overallScore: 5.0
    },
    whatChanged: "Combined adversarial security scenarios (signature tampering, ID spoofing, cross-role token replay) with CoT reasoning and concrete status assertions.",
    whyItChanged: "Ensuring compliance with healthcare data protection standards (HIPAA security rule). High-level prompts miss cryptographic and token manipulation vectors.",
    keyFindings: "Adversarial CoT prompting produces enterprise-grade penetration and authorization test suites capable of uncovering cryptographic and state vulnerabilities.",
    createdAt: "2026-10-11T17:30:00Z"
  }
];

const defaultSettings = {
  provider: "builtin", // 'builtin' | 'openai' | 'anthropic' | 'gemini'
  openaiKey: "",
  anthropicKey: "",
  geminiKey: "",
  selectedModel: "builtin-healthcare-engine",
  temperature: 0.3,
  targetAutFrontendUrl: "http://localhost:3000",
  targetAutBackendUrl: "http://localhost:5000",
  headless: true
};

module.exports = {
  userStories,
  testCases,
  promptExperiments,
  defaultSettings
};
