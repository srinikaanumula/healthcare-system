import React, { useState, useEffect, useMemo, useCallback } from "react";
import Axios from "axios";
import jwt_decode from "jwt-decode";
import { Link } from "react-router-dom";
import StarPicker from "../Basic/StarPicker";

const ScheduleViewer = ({ initialTab = "today" }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchTerm, setSearchTerm] = useState("");
  const [appointments, setAppointments] = useState({
    today: [],
    future: [],
    previous: [],
    all: []
  });
  const [isLoading, setIsLoading] = useState(true);

  // Sync activeTab if prop changes
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const fetchAllDoctorSchedules = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return;
      const decoded = jwt_decode(token);
      const doctorId = decoded._id || decoded.username;
      const serverUrl = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';

      const [todayRes, futureRes, prevRes, allRes] = await Promise.all([
        Axios.post(`${serverUrl}/doctors/todays-appointments`, { doctorId }).catch(() => ({ data: [] })),
        Axios.post(`${serverUrl}/doctors/future-appointments`, { doctorId }).catch(() => ({ data: [] })),
        Axios.post(`${serverUrl}/doctors/previous-appointments`, { doctorId }).catch(() => ({ data: [] })),
        Axios.post(`${serverUrl}/doctors/all-appointments`, { doctorId }).catch(() => ({ data: [] }))
      ]);

      setAppointments({
        today: todayRes.data || [],
        future: futureRes.data || [],
        previous: prevRes.data || [],
        all: allRes.data || []
      });
    } catch (err) {
      console.error("Error fetching doctor schedules:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllDoctorSchedules();
  }, [fetchAllDoctorSchedules]);

  // Current list based on activeTab
  const currentList = useMemo(() => {
    let list = appointments[activeTab] || [];
    if (!searchTerm.trim()) return list;
    const term = searchTerm.toLowerCase();
    return list.filter(item => 
      (item.patientName && item.patientName.toLowerCase().includes(term)) ||
      (item.date && item.date.includes(term)) ||
      (item.slotTime && item.slotTime.includes(term)) ||
      (item.paymentStatus && item.paymentStatus.toLowerCase().includes(term))
    );
  }, [appointments, activeTab, searchTerm]);

  function getScheduleBadge(dateStr, slotTime) {
    if (!dateStr) return null;
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    
    if (dateStr === todayStr) {
      return <span className="badge badge-info p-1 px-2">Today</span>;
    } else if (dateStr > todayStr) {
      return <span className="badge badge-primary p-1 px-2">Upcoming</span>;
    } else {
      return <span className="badge badge-secondary p-1 px-2">Concluded</span>;
    }
  }

  return (
    <div className="text-white">
      {/* Header & KPI Summary Cards */}
      <div className="d-flex flex-wrap justify-content-between align-items-center border-bottom pb-3 mb-3">
        <div>
          <h3 className="text-warning mb-1 font-weight-bold">Doctor Consultation Schedules</h3>
          <small className="text-muted">Manage your daily, future upcoming, and historical patient appointments</small>
        </div>
        <button 
          onClick={fetchAllDoctorSchedules} 
          className="btn btn-sm btn-outline-warning mt-2 mt-md-0"
          title="Refresh Schedules"
        >
          🔄 Refresh
        </button>
      </div>

      {/* KPI Counters */}
      <div className="row mb-3">
        <div className="col-6 col-md-3 mb-2">
          <div 
            onClick={() => setActiveTab("today")}
            className={`p-3 rounded text-center cursor-pointer border ${activeTab === 'today' ? 'bg-info text-white border-light' : 'bg-dark text-white border-secondary'}`}
            style={{ cursor: "pointer", transition: "0.2s" }}
          >
            <span className="small text-uppercase d-block text-white-50">Today's Schedule</span>
            <span className="h4 font-weight-bold">{appointments.today.length}</span>
          </div>
        </div>

        <div className="col-6 col-md-3 mb-2">
          <div 
            onClick={() => setActiveTab("future")}
            className={`p-3 rounded text-center cursor-pointer border ${activeTab === 'future' ? 'bg-primary text-white border-light' : 'bg-dark text-white border-secondary'}`}
            style={{ cursor: "pointer", transition: "0.2s" }}
          >
            <span className="small text-uppercase d-block text-white-50">Future Schedules</span>
            <span className="h4 font-weight-bold">{appointments.future.length}</span>
          </div>
        </div>

        <div className="col-6 col-md-3 mb-2">
          <div 
            onClick={() => setActiveTab("previous")}
            className={`p-3 rounded text-center cursor-pointer border ${activeTab === 'previous' ? 'bg-success text-white border-light' : 'bg-dark text-white border-secondary'}`}
            style={{ cursor: "pointer", transition: "0.2s" }}
          >
            <span className="small text-uppercase d-block text-white-50">Previous Schedules</span>
            <span className="h4 font-weight-bold">{appointments.previous.length}</span>
          </div>
        </div>

        <div className="col-6 col-md-3 mb-2">
          <div 
            onClick={() => setActiveTab("all")}
            className={`p-3 rounded text-center cursor-pointer border ${activeTab === 'all' ? 'bg-warning text-dark border-light font-weight-bold' : 'bg-dark text-white border-secondary'}`}
            style={{ cursor: "pointer", transition: "0.2s" }}
          >
            <span className="small text-uppercase d-block opacity-75">All Schedules</span>
            <span className="h4 font-weight-bold">{appointments.all.length}</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs and Search */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
        <ul className="nav nav-pills">
          <li className="nav-item mr-2 mb-2">
            <button
              onClick={() => setActiveTab("today")}
              className={`nav-link btn btn-sm font-weight-bold ${activeTab === "today" ? "btn-info text-white active" : "btn-outline-light text-white"}`}
            >
              🕒 Today's Schedule ({appointments.today.length})
            </button>
          </li>
          <li className="nav-item mr-2 mb-2">
            <button
              onClick={() => setActiveTab("future")}
              className={`nav-link btn btn-sm font-weight-bold ${activeTab === "future" ? "btn-primary text-white active" : "btn-outline-light text-white"}`}
            >
              📅 Future Schedules ({appointments.future.length})
            </button>
          </li>
          <li className="nav-item mr-2 mb-2">
            <button
              onClick={() => setActiveTab("previous")}
              className={`nav-link btn btn-sm font-weight-bold ${activeTab === "previous" ? "btn-success text-white active" : "btn-outline-light text-white"}`}
            >
              📜 Previous Schedules ({appointments.previous.length})
            </button>
          </li>
          <li className="nav-item mb-2">
            <button
              onClick={() => setActiveTab("all")}
              className={`nav-link btn btn-sm font-weight-bold ${activeTab === "all" ? "btn-warning text-dark active" : "btn-outline-light text-white"}`}
            >
              🌐 All ({appointments.all.length})
            </button>
          </li>
        </ul>

        {/* Search Filter */}
        <div className="mb-2" style={{ minWidth: "220px" }}>
          <input
            type="text"
            className="form-control form-control-sm bg-dark text-white border-secondary"
            placeholder="Search patient, date, slot..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Main Schedule Table */}
      {isLoading ? (
        <div className="text-center p-5">
          <div className="spinner-border text-warning" role="status">
            <span className="sr-only">Loading schedules...</span>
          </div>
          <p className="mt-2 text-muted">Retrieving doctor consultation schedule...</p>
        </div>
      ) : currentList.length === 0 ? (
        <div className="alert alert-secondary text-center p-4 bg-dark text-white border-secondary">
          <h5 className="mb-1">No appointments found in this view</h5>
          <p className="text-muted small mb-0">
            {activeTab === 'today' && "You have no appointments scheduled for today."}
            {activeTab === 'future' && "No upcoming future appointments scheduled yet. As patients book slots, they will appear here."}
            {activeTab === 'previous' && "No completed past appointments recorded."}
            {activeTab === 'all' && "No consultation appointments found for this doctor."}
          </p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover table-dark table-striped">
            <thead>
              <tr className="text-warning">
                <th scope="col">Date</th>
                <th scope="col">Time</th>
                <th scope="col">Patient Name</th>
                <th scope="col">Status</th>
                <th scope="col">Payment</th>
                <th scope="col">Action / Meeting</th>
                {activeTab === "previous" && <th scope="col">Feedback</th>}
              </tr>
            </thead>
            <tbody>
              {currentList.map((appointment) => (
                <tr key={appointment._id}>
                  <td className="align-middle font-weight-bold">
                    {appointment.date}
                  </td>
                  <td className="align-middle">
                    🕒 {appointment.slotTime}
                  </td>
                  <td className="align-middle">
                    <strong>{appointment.patientName}</strong>
                  </td>
                  <td className="align-middle">
                    {getScheduleBadge(appointment.date, appointment.slotTime)}
                  </td>
                  <td className="align-middle">
                    {appointment.paymentStatus === "Pay Later" ? (
                      <span className="badge badge-warning text-dark px-2 py-1 font-weight-bold">
                        ⏳ Pay Later (Due)
                      </span>
                    ) : (
                      <span className="badge badge-success px-2 py-1">
                        ✓ Paid Online
                      </span>
                    )}
                  </td>
                  <td className="align-middle">
                    {appointment.googleMeetLink ? (
                      <a
                        href={appointment.googleMeetLink}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-sm btn-outline-info font-weight-bold"
                      >
                        📹 Join Meet
                      </a>
                    ) : (
                      <span className="text-muted small">In-person / Pending</span>
                    )}
                  </td>
                  {activeTab === "previous" && (
                    <td className="align-middle">
                      {appointment.feedback && appointment.feedback.given ? (
                        <div className="d-flex align-items-center">
                          <StarPicker value={appointment.feedback.stars} size={18} />
                          <Link 
                            to={`/doctor/feedback/${appointment._id}`}
                            className="btn btn-sm btn-link text-info ml-2"
                          >
                            Details
                          </Link>
                        </div>
                      ) : (
                        <span className="text-muted small">Pending Review</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ScheduleViewer;
