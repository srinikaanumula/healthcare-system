import React, { useState, useEffect } from "react";
import Axios from "axios";
import Navbar from "../Basic/Navbar";
import "../Dashbaord/dashboard.css";
import Leftside from "../Dashbaord/LeftsidePatient";

const AppointmentStatus = () => {
    const [appointments, setAppointments] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsLoading(true);

        const fetchAppointments = async () => {
            try {
                let googleId = localStorage.getItem("googleId");
                const userStr = localStorage.getItem("user");
                if (!googleId && userStr) {
                    try {
                        const u = JSON.parse(userStr);
                        googleId = u._id || u.googleId || "";
                    } catch (e) {
                        // ignore
                    }
                }

                const { data } = await Axios.post(
                    `${process.env.REACT_APP_SERVER_URL || 'http://localhost:5000'}/patients/upcoming-appointments/`,
                    {
                        googleId: googleId,
                    }
                );
                setAppointments(data || []);
            } catch (err) {
                console.error("Error fetching upcoming appointments:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAppointments();
    }, []);

    return (
        <div className="bg-dark" style={{ minHeight: "100vh" }}>
            <Navbar />
            <div className="row m-4" style={{ maxWidth: "100%" }}>
                <div
                    className="col-12 col-md-3 p-4 bg-white mb-3"
                    style={{ minHeight: "80vh", borderRadius: "10px" }}
                >
                    <Leftside />
                </div>
                <div
                    className="col-12 col-md-9 p-4"
                    style={{
                        border: "10px solid #ffc107",
                        minHeight: "80vh",
                        backgroundColor: "#495057",
                        borderRadius: "10px",
                    }}
                >
                    <h4 className="text-white mb-4">Upcoming Appointments</h4>
                    {isLoading ? (
                        <div className="row justify-content-center position-relative my-5">
                            <div
                                className="spinner-border text-warning align-middle d-flex justify-content-center"
                                style={{ width: "4rem", height: "4rem" }}
                                role="status"
                            ></div>
                        </div>
                    ) : appointments.length === 0 ? (
                        <div className="alert alert-secondary text-center p-4">
                            <h5>No upcoming appointments scheduled</h5>
                            <p className="text-muted mb-0">Use "Search Doctor" to find a specialist and book a consultation slot.</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover table-dark">
                                <thead>
                                    <tr>
                                        <th scope="col">Date</th>
                                        <th scope="col">Time</th>
                                        <th scope="col">Doctor Name</th>
                                        <th scope="col">Payment Status</th>
                                        <th scope="col">Meet Link</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {appointments.map((Appointment) => (
                                        <tr key={Appointment._id}>
                                            <th scope="row" className="align-middle">{Appointment.date}</th>
                                            <td className="align-middle">🕒 {Appointment.slotTime}</td>
                                            <td className="align-middle">Dr. {Appointment.doctorName}</td>
                                            <td className="align-middle">
                                                {Appointment.paymentStatus === "Pay Later" ? (
                                                    <span className="badge badge-warning text-dark font-weight-bold px-2 py-1">
                                                        ⏳ Pay Later (Due at Clinic)
                                                    </span>
                                                ) : (
                                                    <span className="badge badge-success px-2 py-1">
                                                        ✓ Paid Online
                                                    </span>
                                                )}
                                            </td>
                                            <td className="align-middle">
                                                {Appointment.googleMeetLink ? (
                                                    <a
                                                        href={Appointment.googleMeetLink}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="btn btn-outline-info btn-sm"
                                                    >
                                                        📹 Join Meet
                                                    </a>
                                                ) : (
                                                    <span className="text-muted">In-person / Pending Link</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AppointmentStatus;
