const router = require('express').Router();
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Default seed doctors
let doctors = [
  {
    _id: "606460d2e0dd28cc76d9b0f1",
    username: "test",
    password: "test", // Plaintext matches bcrypt.hash('test', salt)
    name: "Dr. Test Doctor",
    phoneNumber: "12345678",
    specialization: "Dentist",
    feesPerSession: "500",
    dates: [
      {
        _id: "date_001",
        date: "2026-10-20",
        slots: [
          { _id: "slot_001", time: "09:00:00", isBooked: false },
          { _id: "slot_002", time: "12:00:00", isBooked: false },
          { _id: "slot_003", time: "15:00:00", isBooked: false }
        ]
      }
    ]
  },
  {
    _id: "606460d2e0dd28cc76d9b0f2",
    username: "atanwar",
    password: "password123",
    name: "Dr. Akanksha Tanwar",
    phoneNumber: "1234567892",
    specialization: "anaesthesia",
    feesPerSession: "400",
    dates: []
  },
  {
    _id: "606460d2e0dd28cc76d9b0f3",
    username: "pkhanna",
    password: "password123",
    name: "Dr. Priyank Khanna",
    phoneNumber: "1234567893",
    specialization: "dermatology",
    feesPerSession: "800",
    dates: []
  },
  {
    _id: "606460d2e0dd28cc76d9b0f4",
    username: "dabrahams",
    password: "password123",
    name: "Dr. Daniel Abrahams",
    phoneNumber: "1234567894",
    specialization: "emergency medicine",
    feesPerSession: "800",
    dates: []
  },
  {
    _id: "606460d2e0dd28cc76d9b0f5",
    username: "pshah",
    password: "password123",
    name: "Dr. Prashant Shah",
    phoneNumber: "1234567895",
    specialization: "general practice",
    feesPerSession: "300",
    dates: []
  },
  {
    _id: "606460d2e0dd28cc76d9b0f6",
    username: "amaheshwar",
    password: "password123",
    name: "Dr. Anubha Maheshwar",
    phoneNumber: "1234567896",
    specialization: "intensive care medicine",
    feesPerSession: "2000",
    dates: []
  }
];

let patients = [
  {
    _id: "pat_001",
    googleId: "google_patient_123",
    name: "Siddhesh Kothadi",
    picture: "https://via.placeholder.com/150",
    phoneNumber: "9876543210"
  }
];

let appointments = [
  {
    _id: "app_001",
    doctorId: "606460d2e0dd28cc76d9b0f1",
    patientId: "google_patient_123",
    date: "2026-10-14",
    slotTime: "09:00:00",
    doctorName: "Dr. Test Doctor",
    patientName: "Siddhesh Kothadi",
    doctorEmail: "testdoctor@hospital.com",
    googleMeetLink: "https://meet.google.com/test-meet-link",
    feedback: {
      given: true,
      stars: 5,
      title: "Excellent consultation",
      review: "Very professional and helpful advice."
    }
  }
];

function setupInMemoryRoutes(app) {
  console.log("[Notice] Using In-Memory Healthcare Data Mode (No external MongoDB Atlas required).");

  // DOCTORS ROUTES
  app.get('/doctors', (req, res) => {
    res.json(doctors);
  });

  app.post('/doctors/login', (req, res) => {
    const { username, password } = req.body;
    const doctor = doctors.find(d => d.username === username && d.password === password);
    if (!doctor) {
      return res.status(201).json({ message: "wrong username or password" });
    }
    const token = jwt.sign(JSON.stringify(doctor), process.env.KEY || 'SECRETKEY', {
      algorithm: process.env.ALGORITHM || 'HS256'
    });
    res.status(200).json({ token });
  });

  app.post('/doctors/add', (req, res) => {
    const newDoc = {
      _id: `doc_${Date.now()}`,
      username: req.body.username,
      password: req.body.password,
      name: req.body.name,
      phoneNumber: req.body.phoneNumber,
      specialization: req.body.specialization,
      feesPerSession: req.body.feesPerSession,
      dates: []
    };
    doctors.push(newDoc);
    res.json("Doctor added");
  });

  app.put('/doctors/update', (req, res) => {
    const { username, name, phoneNumber, specialization, feesPerSession } = req.body;
    const doc = doctors.find(d => d.username === username);
    if (doc) {
      if (name) doc.name = name;
      if (phoneNumber) doc.phoneNumber = phoneNumber;
      if (specialization) doc.specialization = specialization;
      if (feesPerSession) doc.feesPerSession = feesPerSession;
      return res.json("Doctor updated");
    }
    res.status(404).json("Doctor not found");
  });

  app.post('/doctors/get-slots', (req, res) => {
    const { doctorId, date } = req.body;
    const doctor = doctors.find(d => d._id === doctorId || d.username === doctorId);
    if (!doctor) {
      return res.status(201).json({ message: "Doctor not found in the database!" });
    }
    let dateSchedule = doctor.dates.find(d => d.date === date);
    if (!dateSchedule) {
      dateSchedule = {
        _id: `date_${Date.now()}`,
        date: date,
        slots: [
          { _id: `slot_${Date.now()}_1`, time: "09:00:00", isBooked: false },
          { _id: `slot_${Date.now()}_2`, time: "12:00:00", isBooked: false },
          { _id: `slot_${Date.now()}_3`, time: "15:00:00", isBooked: false }
        ]
      };
      doctor.dates.push(dateSchedule);
    }
    res.status(200).json(dateSchedule);
  });

  app.post('/doctors/book-slot', (req, res) => {
    const { doctorId, dateId, slotId, patientId, patientName } = req.body;
    const doctor = doctors.find(d => d._id === doctorId);
    if (doctor) {
      const date = doctor.dates.find(d => d._id === dateId);
      if (date) {
        const slot = date.slots.find(s => s._id === slotId);
        if (slot) {
          slot.isBooked = true;
          const newApp = {
            _id: `app_${Date.now()}`,
            doctorId: doctor._id,
            patientId: patientId || "patient_guest",
            date: date.date,
            slotTime: slot.time,
            doctorName: doctor.name,
            patientName: patientName || "Patient",
            googleMeetLink: "https://meet.google.com/hms-telehealth-session",
            feedback: { given: false }
          };
          appointments.push(newApp);
          return res.status(200).json(newApp);
        }
      }
    }
    res.status(400).json({ message: "Could not book slot" });
  });

  app.get('/doctors/appointments/:doctorId', (req, res) => {
    const docApps = appointments.filter(a => a.doctorId === req.params.doctorId);
    res.json(docApps);
  });

  // PATIENTS ROUTES
  app.get('/patients', (req, res) => {
    res.json(patients);
  });

  app.post('/patients/google-login', (req, res) => {
    const token = jwt.sign(JSON.stringify(patients[0]), process.env.KEY || 'SECRETKEY', {
      algorithm: process.env.ALGORITHM || 'HS256'
    });
    res.status(200).json({ token, googleId: patients[0].googleId });
  });

  app.put('/patients/update-phone', (req, res) => {
    const { googleId, phoneNumber } = req.body;
    const pat = patients.find(p => p.googleId === googleId);
    if (pat) {
      pat.phoneNumber = phoneNumber;
      return res.status(200).json("Patient's phone number updated");
    }
    res.status(404).json("Patient not found");
  });

  app.get('/patients/appointments/:googleId', (req, res) => {
    const patApps = appointments.filter(a => a.patientId === req.params.googleId);
    res.json(patApps);
  });

  app.get('/patients/previousappointments/:googleId', (req, res) => {
    const patApps = appointments.filter(a => a.patientId === req.params.googleId);
    res.json(patApps);
  });

  // APPOINTMENTS ROUTES
  app.put('/appointments/add-meet-link', (req, res) => {
    const { appointmentId, meetLink } = req.body;
    const appItem = appointments.find(a => a._id === appointmentId);
    if (appItem) {
      appItem.googleMeetLink = meetLink;
      return res.status(200).json({ message: "Meet link updated!" });
    }
    res.status(404).json({ message: "Appointment not found" });
  });

  app.put('/appointments/feedback', (req, res) => {
    const { appointmentId, stars, title, review } = req.body;
    const appItem = appointments.find(a => a._id === appointmentId);
    if (appItem) {
      appItem.feedback = {
        stars,
        title,
        review,
        given: true
      };
      return res.status(200).json({ message: "Feedback updated successfully!" });
    }
    res.status(404).json({ message: "Appointment not found" });
  });
}

module.exports = { setupInMemoryRoutes };
