import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router';
import { authAPI, saveSession, getSession } from '../api';

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

        saveSession({ token: res.token, user: res.user, role: res.user.role });
        navigate('/dashboard');
      } else {
        const res = await authAPI.login({
          email: formData.email,
          password: formData.password
        });

        saveSession({ token: res.token, user: res.user, role: res.user.role });
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || "An error occurred during authentication");
    } finally {
      setLoading(false);
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
            </div>
          )}

          {error && (
            <div style={{ color: '#991b1b', backgroundColor: '#fee2e2', border: '1px solid #fecaca', padding: '12px', borderRadius: '8px', marginBottom: '18px', textAlign: 'center', fontSize: '0.9rem', fontWeight: '600' }}>
              {error}
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
          </div>
        </div>
      </div>
    </>
  );
}
