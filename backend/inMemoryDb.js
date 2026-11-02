const router = require('express').Router();
const jwt = require('jsonwebtoken');
require('dotenv').config();

function getFormattedDate(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function createDoctorInitialSchedule(prefix) {
  return [
    {
      _id: `date_${prefix}_today`,
      date: getFormattedDate(0),
      slots: [
        { _id: `slot_${prefix}_t1`, time: "09:00:00", isBooked: false },
        { _id: `slot_${prefix}_t2`, time: "12:00:00", isBooked: false },
        { _id: `slot_${prefix}_t3`, time: "15:00:00", isBooked: false }
      ]
    },
    {
      _id: `date_${prefix}_tomorrow`,
      date: getFormattedDate(1),
      slots: [
        { _id: `slot_${prefix}_m1`, time: "09:00:00", isBooked: false },
        { _id: `slot_${prefix}_m2`, time: "12:00:00", isBooked: false },
        { _id: `slot_${prefix}_m3`, time: "15:00:00", isBooked: false }
      ]
    },
    {
      _id: `date_${prefix}_dayafter`,
      date: getFormattedDate(2),
      slots: [
        { _id: `slot_${prefix}_d1`, time: "09:00:00", isBooked: false },
        { _id: `slot_${prefix}_d2`, time: "12:00:00", isBooked: false },
        { _id: `slot_${prefix}_d3`, time: "15:00:00", isBooked: false }
      ]
    }
  ];
}

// 5 Diverse Specialist Doctors + Compatibility Test Doctor
let doctors = [
  {
    _id: "606460d2e0dd28cc76d9b0f1",
    username: "test",
    password: "test",
    name: "Dr. Test Doctor",
    email: "testdoctor@hospital.com",
    phoneNumber: "9876543210",
    specialization: "surgery",
    feesPerSession: "500",
    dates: createDoctorInitialSchedule("test")
  },
  {
    _id: "606460d2e0dd28cc76d9b0f2",
    username: "dr_aarav",
    password: "password123",
    name: "Dr. Aarav Sharma",
    email: "dr.aarav.sharma@hospital.com",
    phoneNumber: "+91 98765 43211",
    specialization: "surgery",
    feesPerSession: "900",
    dates: createDoctorInitialSchedule("aarav")
  },
  {
    _id: "606460d2e0dd28cc76d9b0f3",
    username: "dr_sneha",
    password: "password123",
    name: "Dr. Sneha Reddy",
    email: "dr.sneha.reddy@hospital.com",
    phoneNumber: "+91 98765 43212",
    specialization: "dermatology",
    feesPerSession: "750",
    dates: createDoctorInitialSchedule("sneha")
  },
  {
    _id: "606460d2e0dd28cc76d9b0f4",
    username: "dr_vikram",
    password: "password123",
    name: "Dr. Vikram Malhotra",
    email: "dr.vikram.malhotra@hospital.com",
    phoneNumber: "+91 98765 43213",
    specialization: "pediatrics and child health",
    feesPerSession: "650",
    dates: createDoctorInitialSchedule("vikram")
  },
  {
    _id: "606460d2e0dd28cc76d9b0f5",
    username: "dr_meera",
    password: "password123",
    name: "Dr. Meera Iyer",
    email: "dr.meera.iyer@hospital.com",
    phoneNumber: "+91 98765 43214",
    specialization: "obstetrics and gynecology",
    feesPerSession: "800",
    dates: createDoctorInitialSchedule("meera")
  },
  {
    _id: "606460d2e0dd28cc76d9b0f6",
    username: "dr_rohan",
    password: "password123",
    name: "Dr. Rohan Deshmukh",
    email: "dr.rohan.deshmukh@hospital.com",
    phoneNumber: "+91 98765 43215",
    specialization: "general practice",
    feesPerSession: "500",
    dates: createDoctorInitialSchedule("rohan")
  },
  {
    _id: "606460d2e0dd28cc76d9b0f7",
    username: "dr_shwetha",
    password: "password123",
    name: "Dr. Shwetha Tanugula",
    email: "dr.shwetha.tanugula@hospital.com",
    phoneNumber: "+91 98765 43216",
    specialization: "physician",
    feesPerSession: "800",
    dates: createDoctorInitialSchedule("shwetha")
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
  // 1. Previous Completed Consultations (Past)
  {
    _id: "app_past_001",
    doctorId: "606460d2e0dd28cc76d9b0f1",
    patientId: "google_patient_123",
    date: getFormattedDate(-7),
    slotTime: "09:00:00",
    doctorName: "Dr. Test Doctor",
    patientName: "Siddhesh Kothadi",
    doctorEmail: "testdoctor@hospital.com",
    paymentStatus: "Paid Online",
    paymentMode: "Online Card",
    amount: 590,
    googleMeetLink: "https://meet.google.com/hms-telehealth-session",
    feedback: {
      given: true,
      stars: 5,
      title: "Excellent diagnosis and care",
      review: "Very knowledgeable specialist, answered all questions patiently."
    }
  },
  {
    _id: "app_past_002",
    doctorId: "606460d2e0dd28cc76d9b0f1",
    patientId: "pat_002",
    date: getFormattedDate(-3),
    slotTime: "12:00:00",
    doctorName: "Dr. Test Doctor",
    patientName: "Ananya Sharma",
    doctorEmail: "testdoctor@hospital.com",
    paymentStatus: "Paid Online",
    paymentMode: "Online Card",
    amount: 590,
    googleMeetLink: "https://meet.google.com/hms-telehealth-session",
    feedback: {
      given: true,
      stars: 4,
      title: "Helpful follow-up visit",
      review: "Quick and effective treatment plan prescribed."
    }
  },
  // 2. Today's Consultations (Present)
  {
    _id: "app_today_001",
    doctorId: "606460d2e0dd28cc76d9b0f1",
    patientId: "google_patient_123",
    date: getFormattedDate(0),
    slotTime: "09:00:00",
    doctorName: "Dr. Test Doctor",
    patientName: "Rahul Verma",
    doctorEmail: "testdoctor@hospital.com",
    paymentStatus: "Paid Online",
    paymentMode: "Online Card",
    amount: 590,
    googleMeetLink: "https://meet.google.com/hms-today-telehealth-09",
    feedback: { given: false, stars: 0, title: "", review: "" }
  },
  {
    _id: "app_today_002",
    doctorId: "606460d2e0dd28cc76d9b0f1",
    patientId: "pat_003",
    date: getFormattedDate(0),
    slotTime: "12:00:00",
    doctorName: "Dr. Test Doctor",
    patientName: "Pooja Hegde",
    doctorEmail: "testdoctor@hospital.com",
    paymentStatus: "Pay Later",
    paymentMode: "Cash on Visit (Clinic)",
    amount: 590,
    googleMeetLink: "https://meet.google.com/hms-today-telehealth-12",
    feedback: { given: false, stars: 0, title: "", review: "" }
  },
  // 3. Future Consultations (Upcoming Schedules)
  {
    _id: "app_future_001",
    doctorId: "606460d2e0dd28cc76d9b0f1",
    patientId: "pat_004",
    date: getFormattedDate(1),
    slotTime: "09:00:00",
    doctorName: "Dr. Test Doctor",
    patientName: "Vikram Sen",
    doctorEmail: "testdoctor@hospital.com",
    paymentStatus: "Paid Online",
    paymentMode: "Online Card",
    amount: 590,
    googleMeetLink: "https://meet.google.com/hms-future-session-01",
    feedback: { given: false, stars: 0, title: "", review: "" }
  },
  {
    _id: "app_future_002",
    doctorId: "606460d2e0dd28cc76d9b0f1",
    patientId: "pat_005",
    date: getFormattedDate(2),
    slotTime: "15:00:00",
    doctorName: "Dr. Test Doctor",
    patientName: "Deepak Patel",
    doctorEmail: "testdoctor@hospital.com",
    paymentStatus: "Pay Later",
    paymentMode: "Cash on Visit (Clinic)",
    amount: 590,
    googleMeetLink: "https://meet.google.com/hms-future-session-02",
    feedback: { given: false, stars: 0, title: "", review: "" }
  },
  {
    _id: "app_future_003",
    doctorId: "606460d2e0dd28cc76d9b0f1",
    patientId: "pat_006",
    date: getFormattedDate(5),
    slotTime: "12:00:00",
    doctorName: "Dr. Test Doctor",
    patientName: "Meenakshi Sundaram",
    doctorEmail: "testdoctor@hospital.com",
    paymentStatus: "Paid Online",
    paymentMode: "Online Card",
    amount: 590,
    googleMeetLink: "https://meet.google.com/hms-future-session-03",
    feedback: { given: false, stars: 0, title: "", review: "" }
  },
  // Consultations for Dr. Shwetha Tanugula
  {
    _id: "app_shwetha_today",
    doctorId: "606460d2e0dd28cc76d9b0f7",
    patientId: "pat_001",
    date: getFormattedDate(0),
    slotTime: "09:00:00",
    doctorName: "Dr. Shwetha Tanugula",
    patientName: "Siddhesh Kothadi",
    doctorEmail: "dr.shwetha.tanugula@hospital.com",
    paymentStatus: "Paid Online",
    paymentMode: "Online Card",
    amount: 944,
    googleMeetLink: "https://meet.google.com/hms-shwetha-today",
    feedback: { given: false, stars: 0, title: "", review: "" }
  },
  {
    _id: "app_shwetha_future",
    doctorId: "606460d2e0dd28cc76d9b0f7",
    patientId: "pat_002",
    date: getFormattedDate(2),
    slotTime: "12:00:00",
    doctorName: "Dr. Shwetha Tanugula",
    patientName: "Ananya Sharma",
    doctorEmail: "dr.shwetha.tanugula@hospital.com",
    paymentStatus: "Pay Later",
    paymentMode: "Cash on Visit (Clinic)",
    amount: 944,
    googleMeetLink: "https://meet.google.com/hms-shwetha-future",
    feedback: { given: false, stars: 0, title: "", review: "" }
  },
  {
    _id: "app_shwetha_past",
    doctorId: "606460d2e0dd28cc76d9b0f7",
    patientId: "pat_003",
    date: getFormattedDate(-4),
    slotTime: "15:00:00",
    doctorName: "Dr. Shwetha Tanugula",
    patientName: "Rahul Verma",
    doctorEmail: "dr.shwetha.tanugula@hospital.com",
    paymentStatus: "Paid Online",
    paymentMode: "Online Card",
    amount: 944,
    googleMeetLink: "https://meet.google.com/hms-shwetha-past",
    feedback: {
      given: true,
      stars: 5,
      title: "Extremely attentive and thorough",
      review: "Dr. Shwetha provided clear guidance and a comprehensive health assessment."
    }
  }
];

function setupInMemoryRoutes(app) {
  console.log("[Notice] Using In-Memory Healthcare Data Mode (No external MongoDB Atlas required).");
  const jwtSecret = process.env.KEY || 'SECRETKEY';
  const jwtAlgorithm = process.env.ALGORITHM || 'HS256';

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
    const token = jwt.sign(JSON.stringify(doctor), jwtSecret, {
      algorithm: jwtAlgorithm
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
    const { doctorId, dateId, slotId, patientId, googleId, patientName, paymentStatus, paymentMode, payLater, amount } = req.body;
    const patientIdentifier = googleId || patientId || "patient_guest";
    const doctor = doctors.find(d => d._id === doctorId);
    if (doctor) {
      const date = doctor.dates.find(d => d._id === dateId);
      if (date) {
        const slot = date.slots.find(s => s._id === slotId);
        if (slot) {
          if (slot.isBooked) {
            return res.status(400).json({ message: "Slot already booked" });
          }
          slot.isBooked = true;
          const chosenStatus = paymentStatus || (payLater ? "Pay Later" : "Paid");
          const chosenMode = paymentMode || (payLater ? "Pay Later (At Hospital)" : "Online Card");
          const newApp = {
            _id: `app_${Date.now()}`,
            doctorId: doctor._id,
            patientId: patientIdentifier,
            date: date.date,
            slotTime: slot.time,
            doctorName: doctor.name,
            doctorEmail: doctor.email || "testdoctor@hospital.com",
            patientName: patientName || "Patient",
            paymentStatus: chosenStatus,
            paymentMode: chosenMode,
            amount: amount || (doctor.feesPerSession ? doctor.feesPerSession * 1.18 : 0),
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
    const did = req.params.doctorId;
    const docApps = appointments.filter(a => a.doctorId === did || a.doctorId === '606460d2e0dd28cc76d9b0f1');
    res.json(docApps);
  });

  // Today's schedule for doctor
  app.post('/doctors/todays-appointments', (req, res) => {
    const { doctorId } = req.body;
    const todayStr = getFormattedDate(0);
    const docApps = appointments.filter(a => 
      (a.doctorId === doctorId || a.doctorId === '606460d2e0dd28cc76d9b0f1') && 
      a.date === todayStr
    );
    docApps.sort((a, b) => Date.parse(a.date + 'T' + a.slotTime) - Date.parse(b.date + 'T' + b.slotTime));
    res.json(docApps);
  });

  // Previous schedule / appointments for doctor
  app.post('/doctors/previous-appointments', (req, res) => {
    const { doctorId } = req.body;
    const now = new Date();
    const currDateTimeStr = getFormattedDate(0);
    const docApps = appointments.filter(a => {
      if (a.doctorId !== doctorId && a.doctorId !== '606460d2e0dd28cc76d9b0f1') return false;
      if (!a.date) return false;
      if (a.date < currDateTimeStr) return true;
      if (a.date === currDateTimeStr && a.slotTime) {
        return Date.parse(a.date + 'T' + a.slotTime) < now.getTime();
      }
      return false;
    });
    docApps.sort((a, b) => Date.parse(b.date + 'T' + b.slotTime) - Date.parse(a.date + 'T' + a.slotTime));
    res.json(docApps);
  });

  // Future schedule / upcoming appointments for doctor
  app.post('/doctors/future-appointments', (req, res) => {
    const { doctorId } = req.body;
    const now = new Date();
    const currDateStr = getFormattedDate(0);
    const docApps = appointments.filter(a => {
      if (a.doctorId !== doctorId && a.doctorId !== '606460d2e0dd28cc76d9b0f1') return false;
      if (!a.date) return false;
      if (a.date > currDateStr) return true;
      if (a.date === currDateStr && a.slotTime) {
        return Date.parse(a.date + 'T' + a.slotTime) > now.getTime();
      }
      return false;
    });
    docApps.sort((a, b) => Date.parse(a.date + 'T' + a.slotTime) - Date.parse(b.date + 'T' + b.slotTime));
    res.json(docApps);
  });

  // Unified all schedules for doctor
  app.post('/doctors/all-appointments', (req, res) => {
    const { doctorId } = req.body;
    const docApps = appointments.filter(a => a.doctorId === doctorId || a.doctorId === '606460d2e0dd28cc76d9b0f1');
    docApps.sort((a, b) => Date.parse(b.date + 'T' + b.slotTime) - Date.parse(a.date + 'T' + a.slotTime));
    res.json(docApps);
  });

  app.post('/doctors/appointments', (req, res) => {
    const { doctorId } = req.body;
    const docApps = appointments.filter(a => a.doctorId === doctorId || a.doctorId === '606460d2e0dd28cc76d9b0f1');
    docApps.sort((a, b) => Date.parse(b.date + 'T' + b.slotTime) - Date.parse(a.date + 'T' + a.slotTime));
    res.json(docApps);
  });

  // PATIENTS ROUTES
  app.get('/patients', (req, res) => {
    res.json(patients);
  });

  app.post('/patients/register', (req, res) => {
    const { name, email, phoneNumber, password } = req.body;
    let { googleId } = req.body;
    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }
    const normalizedEmail = email.toLowerCase().trim();
    if (!googleId) {
      googleId = normalizedEmail;
    }
    const existing = patients.find(p => p.googleId === googleId || (p.email && p.email.toLowerCase() === normalizedEmail));
    if (existing) {
      return res.status(400).json({ message: "A patient with this email already exists" });
    }
    const newPat = {
      _id: `pat_${Date.now()}`,
      googleId,
      name: name.trim(),
      email: normalizedEmail,
      phoneNumber: (phoneNumber || '').trim(),
      password: password || '',
      picture: req.body.picture || 'https://via.placeholder.com/150',
      isVerified: true
    };
    patients.push(newPat);
    const token = jwt.sign(JSON.stringify(newPat), jwtSecret, {
      algorithm: jwtAlgorithm
    });
    return res.status(201).json({
      message: "Patient registered successfully!",
      token,
      googleId: newPat.googleId,
      patient: newPat,
      phoneNumberExists: Boolean(newPat.phoneNumber)
    });
  });

  app.post('/patients/login', (req, res) => {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    const normalizedEmail = email.toLowerCase().trim();
    const pat = patients.find(p => (p.email && p.email.toLowerCase() === normalizedEmail) || p.googleId === normalizedEmail);
    if (!pat) {
      return res.status(404).json({ message: "Patient account not found. Please register." });
    }
    if (pat.password && password && pat.password !== password) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const token = jwt.sign(JSON.stringify(pat), jwtSecret, {
      algorithm: jwtAlgorithm
    });
    return res.status(200).json({
      token,
      googleId: pat.googleId,
      patient: pat,
      phoneNumberExists: Boolean(pat.phoneNumber)
    });
  });

  app.get('/patients/getPatientDetails/:googleId', (req, res) => {
    const gid = req.params.googleId;
    const pat = patients.find(p => p.googleId === gid || (p.email && p.email.toLowerCase() === gid.toLowerCase()));
    if (pat) {
      return res.status(200).json(pat);
    }
    return res.status(201).json({ message: "Patient not found!" });
  });

  app.post('/patients/upcoming-appointments', (req, res) => {
    const gid = req.body.googleId;
    const patApps = appointments.filter(a => a.patientId === gid);
    res.json(patApps);
  });

  app.post('/patients/previous-appointments', (req, res) => {
    const gid = req.body.googleId;
    const patApps = appointments.filter(a => a.patientId === gid);
    res.json(patApps);
  });

  app.post('/patients/google-login', (req, res) => {
    const tokenId = req.body.tokenId;
    const decoded = tokenId ? jwt.decode(tokenId, jwtSecret) : null;
    const googleId = decoded && (decoded.sub || decoded.googleId || decoded.email) || req.body.googleId || patients[0]?.googleId;
    let patient = patients.find(p => p.googleId === googleId);

    if (!patient) {
      patient = {
        _id: `pat_${Date.now()}`,
        googleId,
        name: decoded?.name || 'Patient',
        picture: decoded?.picture || 'https://via.placeholder.com/150',
        phoneNumber: undefined
      };
      patients.push(patient);
    }

    const token = jwt.sign(JSON.stringify(patient), jwtSecret, {
      algorithm: jwtAlgorithm
    });
    res.status(200).json({ token, googleId: patient.googleId, phoneNumberExists: Boolean(patient.phoneNumber) });
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

  app.post('/patients/payment', (req, res) => {
    const { token, finalBalnce } = req.body;
    if (!token || !token.email || !finalBalnce) {
      return res.status(400).json({ message: 'Invalid payment payload' });
    }
    return res.status(200).json({
      paid: true,
      amount: Number(finalBalnce),
      currency: 'usd',
      email: token.email,
      id: `pay_${Date.now()}`
    });
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
