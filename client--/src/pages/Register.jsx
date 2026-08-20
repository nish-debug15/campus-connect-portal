import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';

export default function Register() {
  const [role, setRole] = useState('student');
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    if (role === 'student') {
      navigate('/student/dashboard');
    } else {
      navigate('/faculty/dashboard');
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
          <h2>Create an Account</h2>
          
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
              className={`role-btn ${role === 'teacher' ? 'active' : ''}`} 
              onClick={() => setRole('teacher')}
            >
              Faculty
            </button>
          </div>

          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input type="text" id="name" required placeholder="Enter your full name" />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" required placeholder="Enter your email" />
            </div>
            
            {role === 'student' && (
              <div className="student-fields active">
                <div className="form-group">
                  <label htmlFor="usn">USN (University Seat Number)</label>
                  <input type="text" id="usn" required placeholder="e.g. 1RV21CS001" />
                </div>
                <div className="form-group">
                  <label htmlFor="branch">Branch</label>
                  <select id="branch">
                    <option value="SoCSE">School of Computer Science & Engineering</option>
                    <option value="SoB">School of Business</option>
                    <option value="SoDI">School of Design and Innovation</option>
                    <option value="SoE">School of Economics</option>
                    <option value="SoLAS">School of Liberal Arts and Sciences</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="year">Year of Study</label>
                  <select id="year">
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>
              </div>
            )}

            {role === 'teacher' && (
              <div className="teacher-fields active">
                <div className="form-group">
                  <label htmlFor="empId">Employee ID</label>
                  <input type="text" id="empId" required placeholder="Enter Employee ID" />
                </div>
                <div className="form-group">
                  <label htmlFor="department">Department</label>
                  <select id="department">
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
              <input type="password" id="password" required placeholder="Create a password" />
            </div>
            
            <button type="submit" className="btn-submit">Register</button>
          </form>
          
          <div className="auth-links">
            <p>Already have an account? <Link to="/login">Login here</Link></p>
          </div>
        </div>
      </div>
    </>
  );
}
