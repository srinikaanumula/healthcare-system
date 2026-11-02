const router = require('express').Router();
const Patient = require('../models/patient.model');
const appointmentImport = require('../models/appointment.model');
const jwt = require('jsonwebtoken');
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY || "dummy_stripe_secret_key");
const { v4: uuidv4 } = require('uuid');
const { Appointment } = appointmentImport;

// To get all the patients
// ** ONLY FOR TESTING **
router.route('/').get((req, res) => {
    Patient.find().then(patients => {
        res.status(200).json(patients);
    }).catch((err) => {
        res.status(400).json(`Error : ${err}`);
    })
})

// To add a patient
router.route('/add').post((req, res) => {
    const googleId = req.body.googleId;
    const name = req.body.name;
    const picture = req.body.picture;

    const newPatient = new Patient({
        googleId, name, picture
    })

    newPatient.save().then(() => {
        res.status(200).json('Patient added');
    }).catch(err => {
        res.status(400).json(`Error : ${err}`);
    })
})

// Patient Registration
router.route('/register').post(async (req, res) => {
    try {
        const { name, email, phoneNumber, password } = req.body;
        let { googleId } = req.body;

        if (!name || !email) {
            return res.status(400).json({ message: "Name and email are required" });
        }

        const normalizedEmail = email.toLowerCase().trim();
        if (!googleId) {
            googleId = normalizedEmail;
        }

        let existingPatient = await Patient.findOne({
            $or: [{ googleId: googleId }, { email: normalizedEmail }]
        });

        if (existingPatient) {
            return res.status(400).json({ message: "A patient with this email already exists" });
        }

        const newPatient = new Patient({
            googleId,
            email: normalizedEmail,
            name: name.trim(),
            phoneNumber: (phoneNumber || '').trim(),
            password: password || '',
            picture: req.body.picture || 'https://via.placeholder.com/150',
            isVerified: true
        });

        const savedPatient = await newPatient.save();
        const jwtSecret = process.env.KEY || 'SECRETKEY';
        const token = jwt.sign(
            { googleId: savedPatient.googleId, email: savedPatient.email, name: savedPatient.name },
            jwtSecret,
            { algorithm: process.env.ALGORITHM || 'HS256' }
        );

        return res.status(201).json({
            message: "Patient registered successfully!",
            token,
            googleId: savedPatient.googleId,
            patient: savedPatient,
            phoneNumberExists: Boolean(savedPatient.phoneNumber)
        });
    } catch (err) {
        console.error("Registration error:", err);
        return res.status(500).json({ message: "Registration failed: " + (err.message || err) });
    }
});

// Patient direct login (email + password)
router.route('/login').post(async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const patient = await Patient.findOne({
            $or: [{ email: normalizedEmail }, { googleId: normalizedEmail }]
        });

        if (!patient) {
            return res.status(404).json({ message: "Patient account not found. Please register." });
        }

        if (patient.password && password && patient.password !== password) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const jwtSecret = process.env.KEY || 'SECRETKEY';
        const token = jwt.sign(
            { googleId: patient.googleId, email: patient.email, name: patient.name },
            jwtSecret,
            { algorithm: process.env.ALGORITHM || 'HS256' }
        );

        return res.status(200).json({
            token,
            googleId: patient.googleId,
            patient,
            phoneNumberExists: Boolean(patient.phoneNumber)
        });
    } catch (err) {
        console.error("Patient login error:", err);
        return res.status(500).json({ message: "Login failed: " + (err.message || err) });
    }
});

// To update a patient's phone number
router.route('/update-phone').put((req, res) => {
    const googleId = req.body.googleId;

    Patient.findOne({ googleId: googleId }).then(patient => {
        if (patient) {
            patient.phoneNumber = req.body.phoneNumber;

            patient.save().then(() => {
                res.status(200).json('Patient\'s phone number updated');
            }).catch(err => {
                res.status(400).json({ message: `Error : ${err}` });
            });
        }
    })
})

router.route('/google-login').post(async (req, res) => {
    try {
        const tokenId = req.body.tokenId;
        const jwtSecret = process.env.KEY || 'SECRETKEY';

        // Decode the jwt
        const decoded = tokenId ? jwt.decode(tokenId, jwtSecret) : null;
        const googleId = decoded && (decoded.sub || decoded.googleId || decoded.email);

        if (!googleId) {
            return res.status(400).json({ message: 'Invalid Google token' });
        }

        // Check if the user already exists in the database
        let patient = await Patient.findOne({ googleId: googleId });

        // If the patient is not found
        if (patient === null) {
            const { email, name, picture } = decoded || {};
            const newPatient = new Patient({
                googleId, email, name, picture
            })
            const savedPromise = await newPatient.save();
            if (savedPromise) {
                return res.status(200).json({ phoneNumberExists: false });
            }
            else {
                throw savedPromise;
            }
        }

        // If the phone number is not present in the database
        else if (!patient.phoneNumber) {
            return res.status(200).json({ phoneNumberExists: false });
        }

        // Patient's phone number already exists in the database
        else {
            return res.status(200).json({ phoneNumberExists: true })
        }
    }
    catch (err) {
        console.log(err);
        return res.status(400).json(err);
    }
})

router.route('/getPatientDetails/:googleId').get(async (req, res) => {
    try {
        const googleId = req.params.googleId;
        const patient = await Patient.findOne({
            $or: [{ googleId: googleId }, { email: googleId.toLowerCase() }]
        });

        if (patient) {
            return res.status(200).json(patient);
        }
        else {
            return res.status(201).json({ message: "Patient not found!" });
        }
    }
    catch (err) {
        console.log(err);
        res.status(400).json({ message: err });
    }
})

router.route('/previous-appointments').post(async (req, res) => {
    try {
        const googleId = req.body.googleId;
        const appointments = await Appointment.find({ patientId: googleId });

        // Get current dateTime
        const date = new Date()
        let currDateTime = date.getFullYear().toString()
        const month = date.getMonth() + 1
        const day = date.getDate()
        const hour = date.getHours()
        const minutes = date.getMinutes()
        const seconds = date.getSeconds()

        currDateTime += month < 10 ? ('-0' + month.toString()) : '-' + month.toString()
        currDateTime += day < 10 ? ('-0' + day.toString()) : '-' + day.toString()
        currDateTime += hour < 10 ? ('T0' + hour.toString()) : 'T' + hour.toString()
        currDateTime += minutes < 10 ? (':0' + minutes.toString()) : ':' + minutes.toString()
        currDateTime += seconds < 10 ? (':0' + seconds.toString()) : ':' + seconds.toString()

        const filteredAppointments = appointments.filter((appointment) => {
            return Date.parse(currDateTime) >= Date.parse(appointment.date + 'T' + appointment.slotTime)
        })

        const sortedAppointments = filteredAppointments.sort((a, b) => {
            return Date.parse(b.date + 'T' + b.slotTime) - Date.parse(a.date + 'T' + a.slotTime)
        })

        res.status(200).json(sortedAppointments);
    }
    catch (err) {
        console.log(err)
        res.status(400).json(err)
    }
})

router.route('/upcoming-appointments').post(async (req, res) => {
    try {
        const googleId = req.body.googleId;
        const appointments = await Appointment.find({ patientId: googleId });

        // Get current dateTime
        const date = new Date()
        let currDateTime = date.getFullYear().toString()
        const month = date.getMonth() + 1
        const day = date.getDate()
        const hour = date.getHours()
        const minutes = date.getMinutes()
        const seconds = date.getSeconds()

        currDateTime += month < 10 ? ('-0' + month.toString()) : '-' + month.toString()
        currDateTime += day < 10 ? ('-0' + day.toString()) : '-' + day.toString()
        currDateTime += hour < 10 ? ('T0' + hour.toString()) : 'T' + hour.toString()
        currDateTime += minutes < 10 ? (':0' + minutes.toString()) : ':' + minutes.toString()
        currDateTime += seconds < 10 ? (':0' + seconds.toString()) : ':' + seconds.toString()

        const filteredAppointments = appointments.filter((appointment) => {
            return Date.parse(currDateTime) <= Date.parse(appointment.date + 'T' + appointment.slotTime)
        })

        const sortedAppointments = filteredAppointments.sort((a, b) => {
            return Date.parse(a.date + 'T' + a.slotTime) - Date.parse(b.date + 'T' + b.slotTime)
        })

        res.status(200).json(sortedAppointments);
    }
    catch (err) {
        console.log(err)
        res.status(400).json(err)
    }
})

router.route("/payment").post(async (req, res) => {
    const { finalBalnce, token } = req.body;
    // console.log(product);
    const idempotencyKey = uuidv4();

    return stripe.customers
        .create({
            email: token.email,
            source: token.id
        })
        .then(customer => {
            stripe.charges
                .create(
                    {
                        amount: finalBalnce * 100,
                        currency: 'usd',
                        customer: customer.id,
                        receipt_email: token.email,
                        description: `Booked Appointement Successfully`,
                        shipping: {
                            name: token.card.name,
                            address: {
                                line1: token.card.address_line1,
                                line2: token.card.address_line2,
                                city: token.card.address_city,
                                country: token.card.address_country,
                                postal_code: token.card.address_zip
                            }
                        }
                    },
                    {
                        idempotencyKey
                    }
                )
                .then(result => res.status(200).json(result))
                .catch(err => {
                    console.log(`Error : ${err}`);
                    res.status(400).json(err);
                });
        })
        .catch((err) => {
            console.log(err);
            res.status(400).json(err);
        });
})


module.exports = router;