import React, { useState, useContext } from 'react';
import { useHistory, Link, Redirect } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../Basic/Navbar';
import Footer from '../Basic/Footer';
import { AuthContext } from '../Auth/AuthContext';
import {
  Container,
  Row,
  Col,
  Card,
  CardHeader,
  CardBody,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Alert
} from 'reactstrap';

const PatientRegister = () => {
  const [activeTab, setActiveTab] = useState('1');
  const { token, setToken, googleId, setGoogleId } = useContext(AuthContext);
  const history = useHistory();

  // Registration state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  // Login state (for existing patients)
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const toggleTab = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
      setRegError('');
      setRegSuccess('');
      setLoginError('');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    if (!regName.trim() || !regEmail.trim()) {
      setRegError('Please provide your name and email address.');
      return;
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(regEmail.trim())) {
      setRegError('Please enter a valid email address.');
      return;
    }

    setRegLoading(true);

    try {
      const serverUrl = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';
      const payload = {
        name: regName.trim(),
        email: regEmail.trim(),
        phoneNumber: regPhone.trim(),
        password: regPassword,
        googleId: regEmail.trim().toLowerCase()
      };

      const res = await axios.post(`${serverUrl}/patients/register`, payload);

      if (res.status === 200 || res.status === 201) {
        setRegSuccess('Account created successfully! Logging you in...');
        
        const receivedToken = res.data.token;
        const patientId = res.data.googleId || regEmail.trim().toLowerCase();
        const patientData = res.data.patient || payload;

        window.localStorage.setItem('token', receivedToken);
        window.localStorage.setItem('googleId', patientId);
        window.localStorage.setItem('user', JSON.stringify(patientData));

        setToken(receivedToken);
        setGoogleId(patientId);

        setTimeout(() => {
          history.push('/patient');
        }, 1200);
      }
    } catch (err) {
      console.error('Registration error:', err);
      const errMsg =
        err.response?.data?.message ||
        err.response?.data ||
        'Unable to register patient account. Please try again.';
      setRegError(typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg));
    } finally {
      setRegLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');

    if (!loginEmail.trim()) {
      setLoginError('Please enter your registered email address.');
      return;
    }

    setLoginLoading(true);

    try {
      const serverUrl = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';
      const payload = {
        email: loginEmail.trim(),
        password: loginPassword
      };

      const res = await axios.post(`${serverUrl}/patients/login`, payload);

      if (res.status === 200) {
        const receivedToken = res.data.token;
        const patientId = res.data.googleId || loginEmail.trim().toLowerCase();
        const patientData = res.data.patient || { email: loginEmail.trim(), name: 'Patient' };

        window.localStorage.setItem('token', receivedToken);
        window.localStorage.setItem('googleId', patientId);
        window.localStorage.setItem('user', JSON.stringify(patientData));

        setToken(receivedToken);
        setGoogleId(patientId);

        history.push('/patient');
      }
    } catch (err) {
      console.error('Login error:', err);
      const errMsg =
        err.response?.data?.message ||
        err.response?.data ||
        'Invalid login credentials. Please check your email and password.';
      setLoginError(typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg));
    } finally {
      setLoginLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      if (!window.gapi || !window.gapi.auth2) {
        alert('Google Sign-In is not initialized or configured in this environment. Please register using the form above.');
        return;
      }
      await window.gapi.auth2.getAuthInstance().signIn();
      const auth2 = window.gapi.auth2.getAuthInstance();
      if (auth2.isSignedIn.get()) {
        const profile = auth2.currentUser.get();
        const idToken = profile.getAuthResponse().id_token;
        const pId = profile.getId();

        window.localStorage.setItem('token', idToken);
        window.localStorage.setItem('googleId', pId);

        const serverUrl = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';
        const serverRes = await axios.post(`${serverUrl}/patients/google-login/`, {
          tokenId: idToken
        });

        setToken(idToken);
        setGoogleId(pId);

        if (serverRes.data.phoneNumberExists === true) {
          history.push('/patient');
        } else {
          history.push('/patient/update-phone');
        }
      }
    } catch (err) {
      console.error('Google Sign-In error:', err);
    }
  };

  if (token && googleId) {
    return <Redirect to="/patient" />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8f9fa' }}>
      <Navbar />

      <Container className="my-5 flex-grow-1">
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="shadow-lg border-0 rounded-lg">
              <CardHeader className="bg-primary text-white text-center py-3">
                <h4 className="mb-0 font-weight-bold">Patient Portal Access</h4>
                <small className="text-light">Create a new account or log in to manage your appointments</small>
              </CardHeader>

              <Nav tabs className="nav-fill bg-light border-bottom">
                <NavItem>
                  <NavLink
                    className={`py-3 font-weight-bold ${activeTab === '1' ? 'active bg-white text-primary' : 'text-muted'}`}
                    style={{ cursor: 'pointer', borderTop: activeTab === '1' ? '3px solid #007bff' : 'none' }}
                    onClick={() => toggleTab('1')}
                  >
                    <i className="fa fa-user-plus mr-2"></i> Register New Patient
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={`py-3 font-weight-bold ${activeTab === '2' ? 'active bg-white text-primary' : 'text-muted'}`}
                    style={{ cursor: 'pointer', borderTop: activeTab === '2' ? '3px solid #007bff' : 'none' }}
                    onClick={() => toggleTab('2')}
                  >
                    <i className="fa fa-sign-in mr-2"></i> Patient Login
                  </NavLink>
                </NavItem>
              </Nav>

              <CardBody className="p-4">
                <TabContent activeTab={activeTab}>
                  {/* TAB 1: REGISTRATION */}
                  <TabPane tabId="1">
                    {regError && <Alert color="danger">{regError}</Alert>}
                    {regSuccess && <Alert color="success">{regSuccess}</Alert>}

                    <Form onSubmit={handleRegister}>
                      <FormGroup>
                        <Label for="regName" className="font-weight-semibold">Full Name *</Label>
                        <Input
                          type="text"
                          id="regName"
                          placeholder="e.g. John Doe"
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          required
                        />
                      </FormGroup>

                      <FormGroup>
                        <Label for="regEmail" className="font-weight-semibold">Email Address *</Label>
                        <Input
                          type="email"
                          id="regEmail"
                          placeholder="name@example.com"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          required
                        />
                        <small className="text-muted">This will be your primary contact and login ID</small>
                      </FormGroup>

                      <FormGroup>
                        <Label for="regPhone" className="font-weight-semibold">Contact Phone Number *</Label>
                        <Input
                          type="tel"
                          id="regPhone"
                          placeholder="e.g. 9876543210"
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          required
                        />
                      </FormGroup>

                      <FormGroup>
                        <Label for="regPassword" className="font-weight-semibold">Password</Label>
                        <Input
                          type="password"
                          id="regPassword"
                          placeholder="Create a password for your account"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                        />
                      </FormGroup>

                      <Button
                        type="submit"
                        color="success"
                        size="lg"
                        block
                        className="mt-4 font-weight-bold"
                        disabled={regLoading}
                      >
                        {regLoading ? 'Creating Account...' : 'Create Patient Account'}
                      </Button>
                    </Form>
                  </TabPane>

                  {/* TAB 2: PATIENT LOGIN */}
                  <TabPane tabId="2">
                    {loginError && <Alert color="danger">{loginError}</Alert>}

                    <Form onSubmit={handleLogin}>
                      <FormGroup>
                        <Label for="loginEmail" className="font-weight-semibold">Email Address *</Label>
                        <Input
                          type="email"
                          id="loginEmail"
                          placeholder="name@example.com"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          required
                        />
                      </FormGroup>

                      <FormGroup>
                        <Label for="loginPassword" className="font-weight-semibold">Password</Label>
                        <Input
                          type="password"
                          id="loginPassword"
                          placeholder="Enter your account password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                        />
                      </FormGroup>

                      <Button
                        type="submit"
                        color="primary"
                        size="lg"
                        block
                        className="mt-4 font-weight-bold"
                        disabled={loginLoading}
                      >
                        {loginLoading ? 'Signing In...' : 'Log In as Patient'}
                      </Button>
                    </Form>
                  </TabPane>
                </TabContent>

                <hr className="my-4" />

                {/* Google Sign-In Alternative */}
                <div className="text-center">
                  <p className="text-muted small mb-3">Or sign in instantly with Google OAuth</p>
                  <Button
                    color="outline-secondary"
                    block
                    onClick={handleGoogleSignIn}
                    className="d-flex align-items-center justify-content-center"
                  >
                    <svg className="mr-2" width="18" height="18" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    Continue with Google
                  </Button>
                </div>

                <div className="text-center mt-3">
                  <small className="text-muted">
                    Are you a doctor?{' '}
                    <Link to="/doctorlogin" className="text-primary font-weight-bold">
                      Doctor Login Here
                    </Link>
                  </small>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      <Footer />
    </div>
  );
};

export default PatientRegister;
