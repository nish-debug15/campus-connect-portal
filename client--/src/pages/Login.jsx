import React from 'react';
import { Link, useNavigate } from 'react-router';

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Simulate login for now - assuming student based on user flow
    navigate('/student/dashboard');
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
          <h2>Welcome Back</h2>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" required placeholder="Enter your email" />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input type="password" id="password" required placeholder="Enter your password" />
            </div>
            <button type="submit" className="btn-submit">Login</button>
          </form>
          <div className="auth-links">
            <p>Don't have an account? <Link to="/register">Register here</Link></p>
          </div>
        </div>
      </div>
    </>
  );
}
