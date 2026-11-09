import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router';
import { authAPI, saveSession, getSession, setCustomBaseURL, getBaseURL } from '../api';

export default function AuthModule({ initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode); // 'login' or 'register'
  const [role, setRole] = useState('student'); // 'student', 'faculty', 'admin'
  const navigate = useNavigate();
  const location = useLocation();

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    usn: '',
    branch: 'SoCSE',
    year: '1',
    empId: '',
    department: 'SoCSE'
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Backend connection & demo mode states
  const [backendUrl, setBackendUrl] = useState(() => {
    return localStorage.getItem('campus_connect_api_url') || '';
  });
  const [showBackendConfig, setShowBackendConfig] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionFeedback, setConnectionFeedback] = useState(null);

  // Sync mode whenever initialMode prop or location changes
  useEffect(() => {
    setMode(initialMode);
    setError(null);

    // If query param specifies role, set it
    const params = new URLSearchParams(location.search);
    const queryRole = params.get('role');
    if (queryRole && ['student', 'faculty', 'admin'].includes(queryRole)) {
      setRole(queryRole);
    }
  }, [initialMode, location]);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    const session = getSession();
    if (session && session.user) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const fillDemoAccount = (roleType) => {
    if (roleType === 'student') {
      setFormData((prev) => ({ ...prev, email: 'student@rvu.edu.in', password: 'password123' }));
    } else if (roleType === 'faculty') {
      setFormData((prev) => ({ ...prev, email: 'faculty@rvu.edu.in', password: 'faculty123' }));
    } else if (roleType === 'admin') {
      setFormData((prev) => ({ ...prev, email: 'admin@rvu.edu.in', password: 'admin123' }));
    }
  };

  const handleSelectPreloadedUser = (e) => {
    const val = e.target.value;
    if (!val) return;
    const [userEmail, pwd] = val.split('|');
    setFormData((prev) => ({ ...prev, email: userEmail, password: pwd }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'register') {
        if (formData.password !== formData.confirmPassword) {
          throw new Error("Passwords do not match");
        }
        if (!termsAccepted) {
          throw new Error("You must accept the terms and conditions");
        }

        const res = await authAPI.register({
          ...formData,
          role
        });

        if (!res || typeof res !== 'object' || !res.token || !res.user) {
          throw new Error(
            typeof res === 'string' && res.includes('<!DOCTYPE')
              ? 'API server unreachable or returned HTML. Please ensure backend is running.'
              : res?.error || 'Registration failed. Please check your details.'
          );
        }

        saveSession({ token: res.token, user: res.user, role: res.user.role || role });
        navigate('/dashboard');
      } else {
        const res = await authAPI.login({
          email: formData.email,
          password: formData.password
        });

        if (!res || typeof res !== 'object' || !res.token || !res.user) {
          throw new Error(
            typeof res === 'string' && res.includes('<!DOCTYPE')
              ? 'API endpoint unreachable or returned HTML. If using Vercel, please check your backend connection.'
              : res?.error || 'Invalid credentials or server unavailable.'
          );
        }

        saveSession({ token: res.token, user: res.user, role: res.user.role });
        navigate('/dashboard');
      }
    } catch (err) {
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        setError('Server cold-start in progress. Free cloud servers take 30-45 seconds to wake up. You can wait 10 seconds or continue in Instant Demo Mode.');
        setShowBackendConfig(true);
      } else if (err.isHtmlResponse || err.message?.includes('unreachable') || err.message?.includes('HTML') || err.message?.includes('Network Error') || err.code === 'ERR_NETWORK') {
        setError('Cannot reach backend server. If hosted on Vercel, connect your Render backend URL below or continue in Instant Demo Mode.');
        setShowBackendConfig(true);
      } else {
        setError(err.response?.data?.error || err.message || "An error occurred during authentication");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInstantDemoAccess = (targetRole = null) => {
    let effectiveRole = targetRole || role;
    if (!targetRole) {
      if (formData.email?.toLowerCase().includes('admin')) effectiveRole = 'admin';
      else if (formData.email?.toLowerCase().includes('faculty')) effectiveRole = 'faculty';
      else if (formData.email?.toLowerCase().includes('student')) effectiveRole = 'student';
    }

    const session = authAPI.loginDemo(effectiveRole);
    navigate('/dashboard');
  };

  const handleTestAndSaveBackend = async () => {
    if (!backendUrl.trim()) {
      setConnectionFeedback({ success: false, message: 'Please enter a valid backend URL (e.g. https://your-service.onrender.com).' });
      return;
    }
    setTestingConnection(true);
    setConnectionFeedback(null);
    try {
      await authAPI.checkHealth(backendUrl.trim());
      setCustomBaseURL(backendUrl.trim());
      setConnectionFeedback({ success: true, message: 'Backend connected successfully! Retrying authentication...' });
      setError(null);
      setTimeout(() => {
        handleSubmit(new Event('submit'));
      }, 700);
    } catch (err) {
      setConnectionFeedback({
        success: false,
        message: 'Could not connect to this URL. Please verify your Render service is running and retry.'
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const switchToRegister = () => {
    setMode('register');
    setError(null);
    navigate('/register');
  };

  const switchToLogin = () => {
    setMode('login');
    setError(null);
    navigate('/login');
  };

  return (
    <>
      <header className="navbar">
        <div className="logo-group">
          <div className="brand-badge">RV</div>
          <div>
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              <h1 className="university-name">RV UNIVERSITY<sup>®</sup></h1>
            </Link>
          </div>
        </div>
        <div className="nav-actions">
          <Link to="/" className="btn-secondary">Home</Link>
          {mode === 'login' ? (
            <button onClick={switchToRegister} className="btn-primary">Register</button>
          ) : (
            <button onClick={switchToLogin} className="btn-primary">Login</button>
          )}
        </div>
      </header>

      <div className="auth-container">
        <div className="auth-card">
          <h2>{mode === 'login' ? 'Campus Portal Login' : 'Create an Account'}</h2>

          {/* Quick Demo Credentials Autofill Banner (Only on Login) */}
          {mode === 'login' && (
            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', marginBottom: '22px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', textAlign: 'center' }}>
                Quick Demo Credentials (Click to fill)
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => fillDemoAccount('student')}
                  style={{ fontSize: '0.75rem', padding: '5px 12px', borderRadius: '20px', border: '1px solid #16a34a', backgroundColor: 'white', color: '#166534', cursor: 'pointer', fontWeight: '700' }}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoAccount('faculty')}
                  style={{ fontSize: '0.75rem', padding: '5px 12px', borderRadius: '20px', border: '1px solid #2563eb', backgroundColor: 'white', color: '#1e40af', cursor: 'pointer', fontWeight: '700' }}
                >
                  Faculty
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoAccount('admin')}
                  style={{ fontSize: '0.75rem', padding: '5px 12px', borderRadius: '20px', border: '1px solid #dc2626', backgroundColor: 'white', color: '#991b1b', cursor: 'pointer', fontWeight: '700' }}
                >
                  Administrator
                </button>
              </div>

              <div style={{ marginTop: '10px' }}>
                <select
                  onChange={handleSelectPreloadedUser}
                  defaultValue=""
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.78rem',
                    fontWeight: '600',
                    color: '#334155',
                    backgroundColor: '#ffffff',
                    cursor: 'pointer'
                  }}
                >
                  <option value="" disabled>Or pick any preloaded RVU account...</option>
                  <optgroup label="Student Accounts">
                    <option value="student@rvu.edu.in|password123">Test Student (student@rvu.edu.in)</option>
                    <option value="patelnishitkumarbsc24@rvu.edu.in|password123">Nishit Patel - 1RUA24SCS0068 (patelnishitkumarbsc24@rvu.edu.in)</option>
                    <option value="aarav.sharma@rvu.edu.in|password123">Aarav Sharma - 1RV22CS014 (aarav.sharma@rvu.edu.in)</option>
                    <option value="diya.reddy@rvu.edu.in|password123">Diya Reddy - 1RV22CS032 (diya.reddy@rvu.edu.in)</option>
                    <option value="rohan.verma@rvu.edu.in|password123">Rohan Verma - 1RV22CS085 (rohan.verma@rvu.edu.in)</option>
                    <option value="ananya.deshmukh@rvu.edu.in|password123">Ananya Deshmukh - AI & ML (ananya.deshmukh@rvu.edu.in)</option>
                    <option value="meera.iyer@rvu.edu.in|password123">Meera Iyer - School of Business (meera.iyer@rvu.edu.in)</option>
                    <option value="tanvi.joshi@rvu.edu.in|password123">Tanvi Joshi - School of Design (tanvi.joshi@rvu.edu.in)</option>
                  </optgroup>
                  <optgroup label="Faculty Instructors">
                    <option value="faculty@rvu.edu.in|faculty123">Dr. Ramesh Kumar - Web Tech (faculty@rvu.edu.in)</option>
                    <option value="ananya.sharma@rvu.edu.in|faculty123">Prof. Ananya Sharma - DBMS (ananya.sharma@rvu.edu.in)</option>
                    <option value="arvind.rao@rvu.edu.in|faculty123">Dr. Arvind Rao - Networks & Security (arvind.rao@rvu.edu.in)</option>
                    <option value="priya.sundaram@rvu.edu.in|faculty123">Dr. Priya Sundaram - AI/ML (priya.sundaram@rvu.edu.in)</option>
                    <option value="vikram.nambiar@rvu.edu.in|faculty123">Prof. Vikram Nambiar - UI/UX (vikram.nambiar@rvu.edu.in)</option>
                  </optgroup>
                  <optgroup label="University Administration">
                    <option value="admin@rvu.edu.in|admin123">Campus IT Administrator (admin@rvu.edu.in)</option>
                    <option value="dean.academics@rvu.edu.in|admin123">Dr. K. S. Sridhar - Academic Dean (dean.academics@rvu.edu.in)</option>
                    <option value="registrar@rvu.edu.in|admin123">Dr. D. P. Nagaraj - Registrar (registrar@rvu.edu.in)</option>
                  </optgroup>
                </select>
              </div>
            </div>
          )}

          {error && (
            <div style={{ color: '#991b1b', backgroundColor: '#fee2e2', border: '1px solid #fecaca', padding: '12px', borderRadius: '8px', marginBottom: '18px', textAlign: 'center', fontSize: '0.9rem', fontWeight: '600' }}>
              {error}
            </div>
          )}

          {/* Dynamic Backend Connector & Instant Demo Panel */}
          {showBackendConfig && (
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1.5px solid #cbd5e1',
              borderRadius: '10px',
              padding: '16px',
              marginBottom: '20px',
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#1e293b' }}>
                  Cloud Backend & Demo Settings
                </span>
                <button
                  type="button"
                  onClick={() => setShowBackendConfig(false)}
                  style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold' }}
                >
                  ×
                </button>
              </div>
              <p style={{ margin: '0 0 10px 0', fontSize: '0.8rem', color: '#475569', lineHeight: '1.4' }}>
                If using Vercel, paste your live Render Web Service URL below (e.g. <code>https://campus-connect-xxxx.onrender.com</code>), or explore the portal right now in Instant Demo Mode:
              </p>

              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input
                  type="text"
                  placeholder="https://your-service.onrender.com"
                  value={backendUrl}
                  onChange={(e) => setBackendUrl(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '8px 10px',
                    fontSize: '0.82rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontFamily: 'monospace'
                  }}
                />
                <button
                  type="button"
                  disabled={testingConnection}
                  onClick={handleTestAndSaveBackend}
                  style={{
                    padding: '8px 14px',
                    fontSize: '0.82rem',
                    fontWeight: '700',
                    borderRadius: '6px',
                    backgroundColor: '#0f766e',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {testingConnection ? 'Testing...' : 'Connect'}
                </button>
              </div>

              {connectionFeedback && (
                <div style={{
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  color: connectionFeedback.success ? '#166534' : '#991b1b',
                  marginBottom: '10px',
                  backgroundColor: connectionFeedback.success ? '#dcfce7' : '#fee2e2',
                  padding: '6px 10px',
                  borderRadius: '6px'
                }}>
                  {connectionFeedback.message}
                </div>
              )}

              <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => handleInstantDemoAccess()}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '6px',
                    backgroundColor: '#166534',
                    color: 'white',
                    fontWeight: '700',
                    fontSize: '0.85rem',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <span>Continue in Standalone Demo Mode (Instant Access)</span>
                </button>
              </div>
            </div>
          )}

          {mode === 'register' && (
            <div className="role-selector">
              <button
                type="button"
                className={`role-btn ${role === 'student' ? 'active' : ''}`}
                onClick={() => setRole('student')}
              >
                Student
              </button>
              <button
                type="button"
                className={`role-btn ${role === 'faculty' ? 'active' : ''}`}
                onClick={() => setRole('faculty')}
              >
                Faculty
              </button>
              <button
                type="button"
                className={`role-btn ${role === 'admin' ? 'active' : ''}`}
                onClick={() => setRole('admin')}
              >
                Administrator
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  required
                  placeholder="e.g. Nishit Sharma"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">University Email Address</label>
              <input
                type="email"
                id="email"
                required
                placeholder="e.g. name@rvu.edu.in"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            {mode === 'register' && role === 'student' && (
              <div className="student-fields active">
                <div className="form-group">
                  <label htmlFor="usn">USN (University Seat Number)</label>
                  <input
                    type="text"
                    id="usn"
                    required
                    placeholder="e.g. 1RV21CS001"
                    value={formData.usn}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="branch">School / Branch</label>
                  <select id="branch" value={formData.branch} onChange={handleChange}>
                    <option value="SoCSE">School of Computer Science & Engineering</option>
                    <option value="SoB">School of Business</option>
                    <option value="SoDI">School of Design and Innovation</option>
                    <option value="SoE">School of Economics</option>
                    <option value="SoLAS">School of Liberal Arts and Sciences</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="year">Year of Study</label>
                  <select id="year" value={formData.year} onChange={handleChange}>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>
              </div>
            )}

            {mode === 'register' && (role === 'faculty' || role === 'admin') && (
              <div className="teacher-fields active">
                <div className="form-group">
                  <label htmlFor="empId">{role === 'admin' ? 'Staff ID' : 'Faculty Employee ID'}</label>
                  <input
                    type="text"
                    id="empId"
                    required
                    placeholder={role === 'admin' ? 'e.g. RVU-ADM-01' : 'e.g. RVU-FAC-104'}
                    value={formData.empId}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="department">Department</label>
                  <select id="department" value={formData.department} onChange={handleChange}>
                    <option value="SoCSE">School of Computer Science & Engineering</option>
                    <option value="SoB">School of Business</option>
                    <option value="SoDI">School of Design and Innovation</option>
                    <option value="SoE">School of Economics</option>
                    <option value="SoLAS">School of Liberal Arts and Sciences</option>
                    {role === 'admin' && <option value="Central IT Administration">Central IT Administration</option>}
                  </select>
                </div>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                required
                placeholder={mode === 'login' ? 'Enter your password' : 'Create a secure password'}
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            {mode === 'register' && (
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  required
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            )}

            {mode === 'login' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', fontSize: '0.85rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', fontWeight: '500', cursor: 'pointer', color: '#475569' }}>
                  <input
                    type="checkbox"
                    style={{ width: 'auto', marginRight: '8px' }}
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  Remember me
                </label>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Please contact campus IT admin at support@rvu.edu.in to reset your password.'); }} style={{ color: 'var(--btn-green)', textDecoration: 'none', fontWeight: '600' }}>
                  Forgot Password?
                </a>
              </div>
            )}

            {mode === 'register' && (
              <div style={{ marginBottom: '20px', fontSize: '0.85rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', fontWeight: '500', cursor: 'pointer', color: '#475569' }}>
                  <input
                    type="checkbox"
                    style={{ width: 'auto', marginRight: '8px' }}
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                  />
                  I accept the RV University IT policy & academic regulations
                </label>
              </div>
            )}

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Authenticating...' : (mode === 'login' ? 'Sign In to Portal' : 'Create Account')}
            </button>
          </form>

          <div className="auth-links">
            {mode === 'login' ? (
              <p>
                Don't have an account?{' '}
                <span
                  style={{ color: 'var(--btn-green)', cursor: 'pointer', textDecoration: 'underline', fontWeight: '700' }}
                  onClick={switchToRegister}
                >
                  Register here
                </span>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <span
                  style={{ color: 'var(--btn-green)', cursor: 'pointer', textDecoration: 'underline', fontWeight: '700' }}
                  onClick={switchToLogin}
                >
                  Login here
                </span>
              </p>
            )}
            <p style={{ marginTop: '16px' }}>
              <Link to="/" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.85rem' }}>
                ← Back to Campus Home
              </Link>
            </p>
            <p style={{ marginTop: '12px' }}>
              <button
                type="button"
                onClick={() => setShowBackendConfig(!showBackendConfig)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  fontSize: '0.78rem',
                  textDecoration: 'underline',
                  cursor: 'pointer'
                }}
              >
                {showBackendConfig ? 'Hide Server Connection Settings' : 'Configure Backend Server / Offline Mode'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
