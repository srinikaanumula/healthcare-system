import getServerUrl from "../utils/url";
import React, { useContext } from "react";
import { Link, useHistory } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import logo from "../image/navbaricon1.png";
import { AuthContext } from "../Auth/AuthContext";
import axios from "axios";

const Navbar = () => {
  const { token, setToken, googleId, setGoogleId } = useContext(AuthContext);
  const history = useHistory();

  async function loginWithGoogle(e) {
    try {
      if (!window.gapi || !window.gapi.auth2) {
        history.push("/patient/register");
        return;
      }
      await window.gapi.auth2.getAuthInstance().signIn();
      const auth2 = await window.gapi.auth2.getAuthInstance();
      if (auth2.isSignedIn.get()) {
        console.log("[Google] Signed in successfully!");
        var profile = auth2.currentUser.get();
        console.log(profile);
        window.localStorage.setItem("token", profile.getAuthResponse().id_token);
        window.localStorage.setItem("googleId", profile.getId());

        const serverRes = await axios.post(
          `${getServerUrl()}/patients/google-login/`,
          {
            tokenId: profile.getAuthResponse().id_token,
          }
        );

        if (serverRes) {
          console.log(serverRes.data.phoneNumberExists);

          setToken(profile.getAuthResponse().id_token);
          setGoogleId(profile.getId());

          if (serverRes.data.phoneNumberExists === true) {
            history.push("/patient");
          } else {
            history.push("/patient/update-phone");
          }
        } else {
          const err = { err: "Server Didn't respond" };
          throw err;
        }
      }
    } catch (err) {
      console.log(`[Google] Some error occurred while signing in! ${JSON.stringify(err)}`);
    }
  }

  function signOutGoogle() {
    window.localStorage.removeItem("token");
    window.localStorage.removeItem("googleId");
    window.localStorage.removeItem("user");
    setToken(null);
    setGoogleId(null);

    try {
      if (
        window.gapi &&
        window.gapi.auth2 &&
        window.gapi.auth2.getAuthInstance() &&
        window.gapi.auth2.getAuthInstance().isSignedIn &&
        window.gapi.auth2.getAuthInstance().isSignedIn.get()
      ) {
        window.gapi.auth2.getAuthInstance().signOut().catch(() => {});
      }
    } catch (e) {
      console.log("Signout notice:", e);
    }

    history.push("/");
  }

  return (
    <nav
      className="navbar navbar-dark bg-dark navbar-expand-lg pl-4 pr-4 w-100"
      style={{ backgroundColor: "#1a1a1a" }}
    >
      <Link to="/" className="navbar-brand">
        <img
          src={logo}
          alt=""
          width="30"
          height="24"
          className="d-inline-block align-top mr-2 mt-1"
        />
        Hospital Management System
      </Link>
      <button
        className="navbar-toggler"
        type="button"
        data-toggle="collapse"
        data-target="#collapsibleNavbar"
      >
        <span className="navbar-toggler-icon"></span>
      </button>
      <div className="collapse navbar-collapse" id="collapsibleNavbar">
        <ul className="navbar-nav ml-auto text-light bg-dark align-items-center">
          {!token && (
            <>
              <li className="nav-item mr-2 mb-2 mb-lg-0">
                <Link to="/patient/register" className="btn btn-success font-weight-bold">
                  Register as Patient
                </Link>
              </li>
              <li className="nav-item mr-2 mb-2 mb-lg-0">
                <Link to="/patient/register" className="btn btn-outline-info">
                  Patient Login
                </Link>
              </li>
              <li className="nav-item mr-2 mb-2 mb-lg-0">
                <button
                  onClick={loginWithGoogle}
                  className="btn btn-outline-primary"
                >
                  Google Sign-In
                </button>
              </li>
              <li className="nav-item mb-2 mb-lg-0">
                <Link to="/doctorlogin" className="btn btn-outline-secondary">
                  Doctor Login
                </Link>
              </li>
            </>
          )}
          {token && (
            <>
              {googleId ? (
                <li className="nav-item mr-2 mb-2 mb-lg-0">
                  <Link to="/patient" className="btn btn-outline-light">
                    My Dashboard
                  </Link>
                </li>
              ) : (
                <li className="nav-item mr-2 mb-2 mb-lg-0">
                  <Link to="/doctor" className="btn btn-outline-light">
                    Doctor Dashboard
                  </Link>
                </li>
              )}
              <li className="nav-item mb-2 mb-lg-0">
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={signOutGoogle}
                >
                  Logout
                </button>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
