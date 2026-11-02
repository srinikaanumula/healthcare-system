import React from "react";
import Navbar from "../Basic/Navbar";
import Leftside from "../Dashbaord/LeftsideDoctor";
import TodaysSchedule from "../Doctor/TodaysSchedule";
import "../Dashbaord/dashboard.css";

const DoctorDashboard = () => {
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
            <TodaysSchedule />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
