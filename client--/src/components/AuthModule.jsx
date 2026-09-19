import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { authAPI, saveSession } from '../api';

export default function AuthModule({ initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode); // 'login' or 'register'
  const [role, setRole] = useState('student'); // 'student' or 'faculty'
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

  React.useEffect(() => {
    const session = getSession();
    if (session && session.user) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
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
      setError(err.response?.data?.error || err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header className="navbar">
        <div className="logo-group">
          <div className="brand-badge">RV</div>
          <div>
            <a href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                <h1 className="university-name">RV UNIVERSITY<sup>®</sup></h1>
            </a>
          </div>
        </div>
      </header>

      <div className="auth-container">
        <div className="auth-card">
          <h2>{mode === 'login' ? 'Welcome Back' : 'Create an Account'}</h2>
          
          {error && <div style={{ color: 'white', backgroundColor: '#e74c3c', padding: '10px', borderRadius: '4px', marginBottom: '15px', textAlign: 'center' }}>{error}</div>}

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
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input type="text" id="name" required placeholder="Enter your full name" value={formData.name} onChange={handleChange} />
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" required placeholder="Enter your email" value={formData.email} onChange={handleChange} />
            </div>
            
            {mode === 'register' && role === 'student' && (
              <div className="student-fields active">
                <div className="form-group">
                  <label htmlFor="usn">USN (University Seat Number)</label>
                  <input type="text" id="usn" required placeholder="e.g. 1RV21CS001" value={formData.usn} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label htmlFor="branch">Branch</label>
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

            {mode === 'register' && role === 'faculty' && (
              <div className="teacher-fields active">
                <div className="form-group">
                  <label htmlFor="empId">Employee ID</label>
                  <input type="text" id="empId" required placeholder="Enter Employee ID" value={formData.empId} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label htmlFor="department">Department</label>
                  <select id="department" value={formData.department} onChange={handleChange}>
                    <option value="SoCSE">School of Computer Science & Engineering</option>
                    <option value="SoB">School of Business</option>
                    <option value="SoDI">School of Design and Innovation</option>
                    <option value="SoE">School of Economics</option>
                    <option value="SoLAS">School of Liberal Arts and Sciences</option>
                  </select>
                </div>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input type="password" id="password" required placeholder={mode === 'login' ? 'Enter your password' : 'Create a password'} value={formData.password} onChange={handleChange} />
            </div>

            {mode === 'register' && (
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input type="password" id="confirmPassword" required placeholder="Confirm your password" value={formData.confirmPassword} onChange={handleChange} />
              </div>
            )}
            
            {mode === 'login' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '0.9rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', fontWeight: 'normal' }}>
                  <input type="checkbox" style={{ width: 'auto', marginRight: '8px' }} checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                  Remember me
                </label>
                <a href="#" style={{ color: 'var(--btn-green)', textDecoration: 'none' }}>Forgot Password?</a>
              </div>
            )}

            {mode === 'register' && (
              <div style={{ marginBottom: '20px', fontSize: '0.9rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', fontWeight: 'normal' }}>
                  <input type="checkbox" style={{ width: 'auto', marginRight: '8px' }} checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} />
                  I accept the Terms and Conditions
                </label>
              </div>
            )}
            
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Processing...' : (mode === 'login' ? 'Login' : 'Register')}
            </button>
          </form>
          
          <div className="auth-links">
            {mode === 'login' ? (
              <p>Don't have an account? <span style={{color: 'var(--btn-green)', cursor: 'pointer', textDecoration: 'underline'}} onClick={() => {setMode('register'); setError(null);}}>Register here</span></p>
            ) : (
              <p>Already have an account? <span style={{color: 'var(--btn-green)', cursor: 'pointer', textDecoration: 'underline'}} onClick={() => {setMode('login'); setError(null);}}>Login here</span></p>
            )}
            <p style={{ marginTop: '10px' }}><a href="/" style={{ color: 'var(--text-gray)' }}>← Back to Campus Home</a></p>
          </div>
        </div>
      </div>
    </>
  );
}
