import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { authAPI, saveSession, getSession } from '../api';

export default function AuthModule({ initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode); // 'login' or 'register'
  const [role, setRole] = useState('student'); // 'student', 'faculty', 'admin'
  const navigate = useNavigate();

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

  // Sync mode whenever initialMode prop changes (e.g. user navigates between /login and /register)
  useEffect(() => {
    setMode(initialMode);
    setError(null);
  }, [initialMode]);

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
          <h2>{mode === 'login' ? 'Welcome Back' : 'Create an Account'}</h2>

          {/* Quick Demo Credentials Autofill Banner (Only on Login) */}
          {mode === 'login' && (
            <div style={{ backgroundColor: '#f1f8e9', border: '1px solid #c8e6c9', borderRadius: '8px', padding: '12px', marginBottom: '20px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#2e7d32', marginBottom: '8px', textAlign: 'center' }}>
                ⚡ QUICK DEMO LOGINS (Click to Auto-fill):
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => fillDemoAccount('student')}
                  style={{ fontSize: '0.75rem', padding: '5px 10px', borderRadius: '15px', border: '1px solid #2e7d32', backgroundColor: 'white', color: '#2e7d32', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  🎓 Student
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoAccount('faculty')}
                  style={{ fontSize: '0.75rem', padding: '5px 10px', borderRadius: '15px', border: '1px solid #1565c0', backgroundColor: 'white', color: '#1565c0', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  👨‍🏫 Faculty
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoAccount('admin')}
                  style={{ fontSize: '0.75rem', padding: '5px 10px', borderRadius: '15px', border: '1px solid #b71c1c', backgroundColor: 'white', color: '#b71c1c', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  🏛️ Admin
                </button>
              </div>
            </div>
          )}

          {error && (
            <div style={{ color: 'white', backgroundColor: '#e74c3c', padding: '12px', borderRadius: '6px', marginBottom: '18px', textAlign: 'center', fontSize: '0.95rem' }}>
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
                🎓 Student
              </button>
              <button
                type="button"
                className={`role-btn ${role === 'faculty' ? 'active' : ''}`}
                onClick={() => setRole('faculty')}
              >
                👨‍🏫 Faculty
              </button>
              <button
                type="button"
                className={`role-btn ${role === 'admin' ? 'active' : ''}`}
                onClick={() => setRole('admin')}
              >
                🏛️ Admin
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
              <label htmlFor="email">University Email</label>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', fontSize: '0.9rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', fontWeight: 'normal', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    style={{ width: 'auto', marginRight: '8px' }}
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  Remember me
                </label>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Please contact campus IT admin at support@rvu.edu.in to reset your password.'); }} style={{ color: 'var(--btn-green)', textDecoration: 'none' }}>
                  Forgot Password?
                </a>
              </div>
            )}

            {mode === 'register' && (
              <div style={{ marginBottom: '20px', fontSize: '0.9rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', fontWeight: 'normal', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    style={{ width: 'auto', marginRight: '8px' }}
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                  />
                  I accept the RV University IT policy & conditions
                </label>
              </div>
            )}

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Processing...' : (mode === 'login' ? 'Login' : 'Create Account')}
            </button>
          </form>

          <div className="auth-links">
            {mode === 'login' ? (
              <p>
                Don't have an account?{' '}
                <span
                  style={{ color: 'var(--btn-green)', cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold' }}
                  onClick={switchToRegister}
                >
                  Register here
                </span>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <span
                  style={{ color: 'var(--btn-green)', cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold' }}
                  onClick={switchToLogin}
                >
                  Login here
                </span>
              </p>
            )}
            <p style={{ marginTop: '15px' }}>
              <Link to="/" style={{ color: 'var(--text-gray)', textDecoration: 'none' }}>
                ← Back to Campus Home
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
