/**
 * Healthcare System - Doctor Profiles Seeder
 * Populates 5 distinct medical specialist doctor profiles into the database.
 */

require('dotenv').config({ path: './app.env' });
require('dotenv').config();
const mongoose = require('mongoose');
const { Doctor, Slot, DateSchedule } = require('./models/doctor.model');

function getFormattedDate(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function buildInitialDates(prefix) {
  return [
    new DateSchedule({
      date: getFormattedDate(0),
      slots: [
        new Slot({ time: "09:00:00", isBooked: false }),
        new Slot({ time: "12:00:00", isBooked: false }),
        new Slot({ time: "15:00:00", isBooked: false })
      ]
    }),
    new DateSchedule({
      date: getFormattedDate(1),
      slots: [
        new Slot({ time: "09:00:00", isBooked: false }),
        new Slot({ time: "12:00:00", isBooked: false }),
        new Slot({ time: "15:00:00", isBooked: false })
      ]
    }),
    new DateSchedule({
      date: getFormattedDate(2),
      slots: [
        new Slot({ time: "09:00:00", isBooked: false }),
        new Slot({ time: "12:00:00", isBooked: false }),
        new Slot({ time: "15:00:00", isBooked: false })
      ]
    })
  ];
}

const doctorSeedData = [
  {
    username: "test",
    password: "test",
    name: "Dr. Test Doctor",
    email: "testdoctor@hospital.com",
    phoneNumber: "9876543210",
    specialization: "surgery",
    feesPerSession: "500",
  },
  {
    username: "dr_aarav",
    password: "password123",
    name: "Dr. Aarav Sharma",
    email: "dr.aarav.sharma@hospital.com",
    phoneNumber: "9876543211",
    specialization: "surgery",
    feesPerSession: "900",
  },
  {
    username: "dr_sneha",
    password: "password123",
    name: "Dr. Sneha Reddy",
    email: "dr.sneha.reddy@hospital.com",
    phoneNumber: "9876543212",
    specialization: "dermatology",
    feesPerSession: "750",
  },
  {
    username: "dr_vikram",
    password: "password123",
    name: "Dr. Vikram Malhotra",
    email: "dr.vikram.malhotra@hospital.com",
    phoneNumber: "9876543213",
    specialization: "pediatrics and child health",
    feesPerSession: "650",
  },
  {
    username: "dr_meera",
    password: "password123",
    name: "Dr. Meera Iyer",
    email: "dr.meera.iyer@hospital.com",
    phoneNumber: "9876543214",
    specialization: "obstetrics and gynecology",
    feesPerSession: "800",
  },
  {
    username: "dr_rohan",
    password: "password123",
    name: "Dr. Rohan Deshmukh",
    email: "dr.rohan.deshmukh@hospital.com",
    phoneNumber: "9876543215",
    specialization: "general practice",
    feesPerSession: "500",
  },
  {
    username: "dr_shwetha",
    password: "password123",
    name: "Dr. Shwetha Tanugula",
    email: "dr.shwetha.tanugula@hospital.com",
    phoneNumber: "+91 98765 43216",
    specialization: "physician",
    feesPerSession: "800",
  }
];

async function autoSeedDoctors() {
  for (const docData of doctorSeedData) {
    const existing = await Doctor.findOne({ username: docData.username });
    if (!existing) {
      const doc = new Doctor({
        ...docData,
        dates: buildInitialDates(docData.username)
      });
      await doc.save();
      console.log(`[Doctor Seeded] Created: ${docData.name} (${docData.specialization})`);
    } else {
      existing.name = docData.name;
      existing.email = docData.email;
      existing.phoneNumber = docData.phoneNumber;
      existing.specialization = docData.specialization;
      existing.feesPerSession = docData.feesPerSession;
      if (!existing.dates || existing.dates.length === 0) {
        existing.dates = buildInitialDates(docData.username);
      }
      await existing.save();
      console.log(`[Doctor Updated] Synchronized: ${docData.name} (${docData.specialization})`);
    }
  }
}

// Standalone execution support: node seedDoctors.js
if (require.main === module) {
  const uri = process.env.ATLAS_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/healthcare';
  mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverSelectionTimeoutMS: 5000 })
    .then(async () => {
      console.log("Connected to MongoDB for doctor seeding...");
      await autoSeedDoctors();
      console.log("All doctor profiles seeded successfully!");
      process.exit(0);
    })
    .catch((err) => {
      console.log("Standalone MongoDB seed skipped (no active MongoDB connection):", err.message);
      process.exit(0);
    });
}

module.exports = {
  doctorSeedData,
  autoSeedDoctors
};
