import React, { useState, useEffect } from "react";
import { Link, useHistory } from "react-router-dom";
import Navbar from "../Basic/Navbar";
import LeftsidePatient from "../Dashbaord/LeftsidePatient";
import Axios from "axios";

const BookingSlots = (props) => {
  const history = useHistory();
  const stateData = (props.location && props.location.state) || {};
  const { date, doctor } = stateData;

  const [dateId, setdateId] = useState();
  const [Slots, setSlots] = useState([]);

  useEffect(() => {
    if (!doctor || !date) return;

    const fetchDate = async (dateToPost) => {
      try {
        const { data } = await Axios.post(
          `${process.env.REACT_APP_SERVER_URL || 'http://localhost:5000'}/doctors/get-slots/`,
          {
            doctorId: doctor._id,
            date: dateToPost
          }
        );
        if (data) {
          setdateId(data._id);
          setSlots(data.slots || []);
        }
      } catch (err) {
        console.error("Error fetching slots:", err);
      }
    };

    function getDateString() {
      let finalDate = date.getFullYear().toString();
      const month = date.getMonth() + 1;
      const day = date.getDate();

      if (month < 10) {
        finalDate += ('-0' + month.toString());
      } else {
        finalDate += '-' + month.toString();
      }

      if (day < 10) {
        finalDate += ('-0' + day.toString());
      } else {
        finalDate += '-' + day.toString();
      }

      return finalDate;
    }

    const dateToSend = getDateString();
    fetchDate(dateToSend);
  }, [date, doctor]);

  if (!doctor || !date) {
    return (
      <div className="bg-dark text-white text-center p-5" style={{ height: "100vh" }}>
        <Navbar />
        <div className="container mt-5">
          <h3>No Consultation Date Selected</h3>
          <p className="text-muted">Please select a doctor and appointment date to view available time slots.</p>
          <button className="btn btn-primary mt-3" onClick={() => history.push("/patient/searchdoctor")}>
            Back to Doctor Directory
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dark" style={{ minHeight: "100vh" }}>
      <Navbar />
      <div>
        <div className="row m-4" style={{ maxWidth: "100%" }}>
          <div className="col-12 col-md-3 p-4 bg-white mb-3" style={{ minHeight: "80vh", borderRadius: "10px" }}>
            <LeftsidePatient />
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
            <div className="d-flex justify-content-between align-items-center mb-4 text-white">
              <div>
                <h4 className="mb-0">Available Consultation Slots</h4>
                <small className="text-warning">
                  Dr. {doctor.name} ({doctor.specialization}) &bull; Date: {date.toLocaleDateString ? date.toLocaleDateString() : date.toString()}
                </small>
              </div>
              <span className="badge badge-info p-2">Fee: ₹{doctor.feesPerSession}/session</span>
            </div>

            <div className="table-responsive">
              <table className="table table-hover table-dark">
                <thead>
                  <tr>
                    <th scope="col">Time Slot</th>
                    <th scope="col">Status</th>
                    <th scope="col" className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {Slots.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="text-center text-muted p-4">
                        Loading consultation slots...
                      </td>
                    </tr>
                  ) : (
                    Slots.map((slot) => (
                      <tr key={slot._id}>
                        <th scope="row" className="align-middle">
                          🕒 {slot.time}
                        </th>
                        <td className="align-middle">
                          {slot.isBooked ? (
                            <span className="badge badge-danger p-2">Already Booked</span>
                          ) : (
                            <span className="badge badge-success p-2">Available</span>
                          )}
                        </td>
                        <td className="text-right align-middle">
                          {slot.isBooked ? (
                            <button className="btn btn-secondary btn-sm" disabled>
                              Unavailable
                            </button>
                          ) : (
                            <Link
                              to={{
                                pathname: "/patient/payment",
                                data: {
                                  dateId: dateId,
                                  doctor: doctor,
                                  slotId: slot._id,
                                },
                              }}
                              className="btn btn-primary btn-sm font-weight-bold"
                            >
                              Book Slot (Pay Online / Pay Later) &rarr;
                            </Link>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSlots;
