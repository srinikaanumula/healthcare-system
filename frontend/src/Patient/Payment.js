import getServerUrl from "../utils/url";
import React, { useState, useEffect } from "react";
import Axios from "axios";
import { useHistory } from "react-router-dom";

import Navbar from "../Basic/Navbar";
import Leftside from "../Dashbaord/LeftsidePatient";
import StripeCheckoutButton from "react-stripe-checkout";
import { toast } from "react-toastify";

function getEndDateTime(dateTime) {
  const hrs = (parseInt(dateTime.split("T")[1].split(":")[0], 10) + 1)
    .toString()
    .padStart(2, "0");
  const time = hrs + ":00:00";
  const date = dateTime.split("T")[0];
  return date + "T" + time;
}

const Payment = (props) => {
  const [finalBalnce, setFinalBalnce] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const history = useHistory();

  const bookingData = (props.location && (props.location.data || props.location.state)) || {};
  const { dateId, doctor, slotId } = bookingData;

  function createEvent(id, dateTime, doctorEmail) {
    if (!window.gapi || !window.gapi.client || !window.gapi.client.calendar) {
      return;
    }
    const virtualEvent = {
      id: id,
      summary: "Appointment",
      location: "Virtual",
      description: "Doctor-Patient appointment",
      start: {
        dateTime: dateTime,
        timeZone: "Asia/Kolkata",
      },
      end: {
        dateTime: getEndDateTime(dateTime),
        timeZone: "Asia/Kolkata",
      },
      conferenceData: {
        createRequest: {
          requestId: "7qxalsvy0e",
        },
      },
      attendees: [{ email: doctorEmail }],
      guestsCanModify: true,
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 24 * 60 },
          { method: "popup", minutes: 15 },
        ],
      },
    };

    try {
      const request = window.gapi.client.calendar.events.insert({
        calendarId: "primary",
        resource: virtualEvent,
        sendUpdates: "all",
        supportsAttachments: true,
        conferenceDataVersion: 1,
      });

      request.execute(function (event) {
        if (event && event.hangoutLink) {
          Axios.put(
            `${getServerUrl()}/appointments/add-meet-link`,
            {
              appointmentId: id,
              meetLink: event.hangoutLink
            }
          ).then(() => {
            console.log("Updated Meet Link!");
          }).catch(console.error);
        }
      });
    } catch (e) {
      console.warn("Could not insert calendar event:", e);
    }
  }

  const bookSlot = async (paymentStatus = "Paid", paymentMode = "Online Card") => {
    let patientName = "Patient";
    let googleId = localStorage.getItem("googleId") || "";

    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const parsed = JSON.parse(userStr);
        patientName = parsed.name || patientName;
        if (!googleId) googleId = parsed._id || parsed.googleId || "";
      } catch (e) {
        // ignore
      }
    }

    const { data } = await Axios.post(
      `${getServerUrl()}/doctors/book-slot/`,
      {
        googleId: googleId,
        patientName: patientName,
        slotId: slotId,
        dateId: dateId,
        doctorId: doctor._id,
        paymentStatus: paymentStatus,
        paymentMode: paymentMode,
        payLater: paymentStatus === "Pay Later",
        amount: finalBalnce,
      }
    );

    if (data && data.doctorEmail) {
      createEvent(data._id, data.date + "T" + data.slotTime, data.doctorEmail);
    }

    return data;
  };

  useEffect(() => {
    if (doctor && doctor.feesPerSession) {
      setFinalBalnce(1.18 * doctor.feesPerSession);
    }
  }, [doctor]);

  // Online Payment via Stripe
  const makePayment = async (token) => {
    setIsProcessing(true);
    try {
      const { data } = await Axios.post(
        `${getServerUrl()}/patients/payment`,
        {
          token,
          finalBalnce,
        }
      );

      if (data) {
        await bookSlot("Paid", "Stripe Online Card");
        setFinalBalnce(0);
        toast("Appointment booked and paid successfully!", {
          type: "success"
        });
        history.push("/patient/appointment-status");
      }
    } catch (err) {
      console.error(err);
      toast(err.response?.data?.message || "Payment failed, please try again.", {
        type: "error"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Pay Later at Hospital / Clinic
  const handlePayLater = async () => {
    setIsProcessing(true);
    try {
      await bookSlot("Pay Later", "Cash on Visit (Clinic)");
      setFinalBalnce(0);
      toast("Appointment booked successfully! Payment status: Pay Later (Due at Clinic).", {
        type: "success"
      });
      history.push("/patient/appointment-status");
    } catch (err) {
      console.error(err);
      toast(err.response?.data?.message || "Failed to book slot with Pay Later option.", {
        type: "error"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!doctor) {
    return (
      <div className="bg-dark text-white text-center p-5" style={{ height: "100vh" }}>
        <Navbar />
        <div className="container mt-5">
          <h3>No Consultation Slot Selected</h3>
          <p className="text-muted">Please select a doctor and consultation slot to proceed to appointment booking.</p>
          <button className="btn btn-primary mt-3" onClick={() => history.push("/patient/searchdoctor")}>
            Browse Available Doctors
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
            <div className="container text-white">
              <div className="row justify-content-center">
                <div className="col-12 col-md-8 bg-dark p-4 rounded shadow">
                  <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
                    <div>
                      <h4 className="text-warning mb-0">Healthcare Consultation</h4>
                      <small className="text-muted">Appointment Booking & Invoice</small>
                    </div>
                    <div className="text-right">
                      <span className="badge badge-info p-2 font-weight-normal">
                        Date: {new Date().toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="table-responsive">
                    <table className="table table-hover text-white">
                      <thead>
                        <tr>
                          <th>Doctor Name</th>
                          <th>Specialization</th>
                          <th className="text-right">Session Fee</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td><strong>Dr. {doctor.name}</strong></td>
                          <td><span className="badge badge-secondary">{doctor.specialization}</span></td>
                          <td className="text-right">₹{doctor.feesPerSession}</td>
                        </tr>
                        <tr>
                          <td colSpan="2" className="text-right text-muted">Subtotal:</td>
                          <td className="text-right">₹{doctor.feesPerSession}</td>
                        </tr>
                        <tr>
                          <td colSpan="2" className="text-right text-muted">Service Tax & GST (18%):</td>
                          <td className="text-right">₹{(0.18 * doctor.feesPerSession).toFixed(2)}</td>
                        </tr>
                        <tr className="border-top border-warning">
                          <td colSpan="2" className="text-right">
                            <h5 className="text-warning mb-0">Total Payable Amount:</h5>
                          </td>
                          <td className="text-right">
                            <h5 className="text-warning font-weight-bold mb-0">₹{finalBalnce.toFixed(2)}</h5>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Payment Options */}
                  <div className="mt-4 pt-3 border-top">
                    <h6 className="text-light mb-3">Select Payment Method:</h6>
                    <div className="row">
                      {/* Option 1: Pay Online via Card */}
                      <div className="col-12 col-sm-6 mb-3">
                        <StripeCheckoutButton
                          stripeKey="pk_test_51IabQNSCj4BydkZ3VIEbtfIJoWfSESvGSia3mSOfCYPWiyGxNxyr42IRvpmi8f8WbnhzCYBIZMyshg540TErXG3500fbHzRzLc"
                          token={makePayment}
                          amount={finalBalnce * 100}
                          name="Place Appointment"
                          shippingAddress
                          billingAddress
                        >
                          <button
                            type="button"
                            className="btn btn-success btn-lg btn-block font-weight-bold"
                            disabled={isProcessing}
                            style={{ height: "55px" }}
                          >
                            💳 Pay Online Now
                          </button>
                        </StripeCheckoutButton>
                        <small className="form-text text-muted text-center mt-1">
                          Instant card checkout via Stripe
                        </small>
                      </div>

                      {/* Option 2: Pay Later (At Hospital / Clinic) */}
                      <div className="col-12 col-sm-6 mb-3">
                        <button
                          type="button"
                          className="btn btn-warning btn-lg btn-block text-dark font-weight-bold"
                          onClick={handlePayLater}
                          disabled={isProcessing}
                          style={{ height: "55px" }}
                        >
                          {isProcessing ? "Confirming Slot..." : "⏳ Pay Later (At Clinic)"}
                        </button>
                        <small className="form-text text-muted text-center mt-1">
                          Reserve slot now & pay cash/card upon visit
                        </small>
                      </div>
                    </div>

                    {/* Pay Later Information Callout */}
                    <div className="alert alert-secondary text-dark mt-3 p-3" style={{ fontSize: "13px", borderRadius: "8px" }}>
                      <strong>ℹ️ About "Pay Later":</strong> Choosing <em>Pay Later</em> immediately books and confirms your consultation slot. You can pay the consultation fee of <strong>₹{finalBalnce.toFixed(2)}</strong> at the hospital reception counter before or during your appointment.
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
