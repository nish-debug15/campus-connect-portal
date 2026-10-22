import React from 'react';
import { Link } from 'react-router';

export default function LandingPage() {
  return (
    <div>
      {/* Top Navigation Header */}
      <header className="navbar">
        <div className="logo-group">
          <div className="brand-badge">RV</div>
          <div>
            <span className="university-name">RV UNIVERSITY<sup>®</sup></span>
            <p className="sub-dept">School of Computer Science & Engineering</p>
          </div>
        </div>
        <div className="nav-actions">
          <Link to="/login" className="btn-secondary">Login</Link>
          <Link to="/register" className="btn-primary">Register</Link>
        </div>
      </header>

      {/* Hero Banner with CTA */}
      <section className="hero-banner">
        <div className="hero-content">
          <span className="module-tag">CS3301 - FULL STACK DEVELOPMENT</span>
          <h1>CAMPUS CONNECT PORTAL</h1>
          <p className="subtitle">Connecting Students, Faculty, and Administrators on a Single Digital Platform.</p>
          <div className="hero-cta-group">
            <a href="#roles" className="btn-hero-primary">Explore User Portals ➔</a>
          </div>
        </div>
      </section>

      {/* Portal Roles Overview */}
      <section id="roles" className="section-container" style={{ backgroundColor: '#f9fafb', padding: '60px 20px' }}>
        <h2 className="section-title" style={{ fontSize: '2rem', marginBottom: '10px', color: 'var(--primary-green)' }}>
          Select Your Campus Portal
        </h2>
        <p className="section-subtitle" style={{ color: '#666', marginBottom: '40px' }}>
          Dedicated role-based access for academic workflows, coursework management, and attendance.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px', maxWidth: '1000px', margin: '0 auto' }}>
          {/* Student Portal Card */}
          <div className="auth-card" style={{ maxWidth: '100%', textAlign: 'left', borderTop: '4px solid var(--primary-green)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🎓</div>
            <h3 style={{ margin: '0 0 10px 0', color: '#222' }}>Student Portal</h3>
            <p style={{ color: '#666', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '20px' }}>
              Access Google Classroom courses, track attendance percentage, view upcoming assignment deadlines, and download notices.
            </p>
            <Link to="/login" className="btn-primary" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', padding: '10px', borderRadius: '6px' }}>
              Student Login ➔
            </Link>
          </div>

          {/* Faculty Portal Card */}
          <div className="auth-card" style={{ maxWidth: '100%', textAlign: 'left', borderTop: '4px solid #1976d2' }}>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>👨‍🏫</div>
            <h3 style={{ margin: '0 0 10px 0', color: '#222' }}>Faculty Portal</h3>
            <p style={{ color: '#666', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '20px' }}>
              Publish coursework, post classroom announcements, mark daily student attendance, and evaluate semester project submissions.
            </p>
            <Link to="/login" className="btn-secondary" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', padding: '10px', borderRadius: '6px' }}>
              Faculty Login ➔
            </Link>
          </div>

          {/* Admin Portal Card */}
          <div className="auth-card" style={{ maxWidth: '100%', textAlign: 'left', borderTop: '4px solid #f57c00' }}>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🏛️</div>
            <h3 style={{ margin: '0 0 10px 0', color: '#222' }}>Admin Portal</h3>
            <p style={{ color: '#666', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '20px' }}>
              Manage university department records, review institutional metrics, audit system accounts, and distribute campus-wide circulars.
            </p>
            <Link to="/login" className="btn-secondary" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', padding: '10px', borderRadius: '6px' }}>
              Admin Access ➔
            </Link>
          </div>
        </div>
      </section>

      {/* Campus Life & Portal Highlights */}
      <section className="section-container">
        <h2 className="section-title" style={{ fontSize: '2rem', marginBottom: '10px', color: 'var(--primary-green)' }}>
          Campus Life & Portal Highlights
        </h2>
        <p className="section-subtitle" style={{ color: '#666', marginBottom: '40px' }}>
          Experience academic management simplified through modern web technologies.
        </p>

        <div className="campus-showcase">
          {/* Main Featured Campus Building Image */}
          <div className="featured-image">
            <img 
              src="https://www.admissionwala.in/storage/productimages/RV-University.jpg" 
              alt="RV University Campus Overview" 
            />
          </div>

          {/* Auto-moving rightward carousel */}
          <div className="marquee-container">
            <div className="marquee-track">
              {/* Set 1 */}
              <img src="https://d2b6aloc836m7p.cloudfront.net/wp-content/uploads/2025/12/SoCSE.jpg" alt="SoCSE" />
              <img src="https://d2b6aloc836m7p.cloudfront.net/wp-content/uploads/2025/12/SDI.jpg" alt="SDI" />
              <img src="https://d2b6aloc836m7p.cloudfront.net/wp-content/uploads/2025/12/SOB.jpg" alt="SOB" />
              <img src="https://d2b6aloc836m7p.cloudfront.net/wp-content/uploads/2025/12/SOLAS.jpg" alt="SOLAS" />
              <img src="https://d2b6aloc836m7p.cloudfront.net/wp-content/uploads/2025/12/SOEPP.jpg" alt="SOEPP" />
              <img src="https://d2b6aloc836m7p.cloudfront.net/wp-content/uploads/2025/12/SOL.jpg" alt="SOL" />
              {/* Set 2 (Duplicate for seamless scroll) */}
              <img src="https://d2b6aloc836m7p.cloudfront.net/wp-content/uploads/2025/12/SoCSE.jpg" alt="SoCSE" />
              <img src="https://d2b6aloc836m7p.cloudfront.net/wp-content/uploads/2025/12/SDI.jpg" alt="SDI" />
              <img src="https://d2b6aloc836m7p.cloudfront.net/wp-content/uploads/2025/12/SOB.jpg" alt="SOB" />
              <img src="https://d2b6aloc836m7p.cloudfront.net/wp-content/uploads/2025/12/SOLAS.jpg" alt="SOLAS" />
              <img src="https://d2b6aloc836m7p.cloudfront.net/wp-content/uploads/2025/12/SOEPP.jpg" alt="SOEPP" />
              <img src="https://d2b6aloc836m7p.cloudfront.net/wp-content/uploads/2025/12/SOL.jpg" alt="SOL" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: '#113f28', color: 'white', padding: '30px 20px', textAlign: 'center', marginTop: '40px' }}>
        <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>RV UNIVERSITY — Go Change The World</p>
        <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.8 }}>Campus Connect Portal &copy; {new Date().getFullYear()} School of Computer Science & Engineering</p>
      </footer>
    </div>
  );
}
