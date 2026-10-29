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
          <span className="module-tag">CS3301 • FULL STACK DEVELOPMENT</span>
          <h1>CAMPUS CONNECT PORTAL</h1>
          <p className="subtitle">
            Next-generation unified academic hub for RV University. Connecting students, faculty, and central administration with seamless Google Classroom integration, real-time attendance registers, and MongoDB persistence.
          </p>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <a href="#roles" className="btn-hero-primary">
              Explore User Portals ➔
            </a>
            <Link to="/login" style={{
              backgroundColor: 'rgba(255,255,255,0.15)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              textDecoration: 'none',
              padding: '14px 28px',
              borderRadius: '9999px',
              fontWeight: '700',
              backdropFilter: 'blur(8px)',
              transition: 'all 0.2s ease'
            }}>
              Instant Demo Access
            </Link>
          </div>

          {/* Stat Badges */}
          <div style={{ display: 'flex', gap: '24px', marginTop: '48px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '10px 20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(6px)' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: '800' }}>5 Schools</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cross-Disciplinary</div>
            </div>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '10px 20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(6px)' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: '800' }}>Mini GCR</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Classwork & Stream</div>
            </div>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '10px 20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(6px)' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: '800' }}>MongoDB</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Persistence</div>
            </div>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '10px 20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(6px)' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: '800' }}>100% Free</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Simulation Ready</div>
            </div>
          </div>
        </div>
      </section>

      {/* Portal Roles Overview */}
      <section id="roles" className="section-container" style={{ backgroundColor: '#f8fafc', padding: '80px 24px' }}>
        <h2 className="section-title">
          Choose Your Digital Workspace
        </h2>
        <p className="section-subtitle">
          Tailored interfaces built specifically for the needs of students, teaching faculty, and institutional administrators.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', maxWidth: '1100px', margin: '0 auto' }}>
          
          {/* Student Portal Card */}
          <div className="auth-card" style={{ maxWidth: '100%', textAlign: 'left', borderTop: '5px solid #0e3823', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '36px 32px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '2.4rem' }}>🎓</span>
                <span style={{ backgroundColor: '#e8f5e9', color: '#1b5e20', fontSize: '0.75rem', fontWeight: '800', padding: '4px 10px', borderRadius: '20px' }}>
                  STUDENT PORTAL
                </span>
              </div>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1.35rem', color: '#0f172a' }}>Student Experience</h3>
              <p style={{ color: '#475569', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '20px' }}>
                Sync live Google Classroom courses, track upcoming assignment deadlines, review course-wise attendance percentages, and download verified campus notices.
              </p>
              <ul style={{ paddingLeft: '18px', color: '#64748b', fontSize: '0.85rem', lineHeight: '1.8', marginBottom: '24px' }}>
                <li>⚡ Google Classroom Simulation & Sync</li>
                <li>📝 Coursework Deadlines & Point Values</li>
                <li>📊 Interactive Attendance Visual Gauge</li>
                <li>📢 Real-Time Class Stream Notices</li>
              </ul>
            </div>
            <Link to="/login" className="btn-primary" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', padding: '12px', borderRadius: '8px', fontWeight: '700' }}>
              Access Student Portal ➔
            </Link>
          </div>

          {/* Faculty Portal Card */}
          <div className="auth-card" style={{ maxWidth: '100%', textAlign: 'left', borderTop: '5px solid #1565c0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '36px 32px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '2.4rem' }}>👨‍🏫</span>
                <span style={{ backgroundColor: '#e3f2fd', color: '#1565c0', fontSize: '0.75rem', fontWeight: '800', padding: '4px 10px', borderRadius: '20px' }}>
                  MINI GOOGLE CLASSROOM
                </span>
              </div>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1.35rem', color: '#0f172a' }}>Faculty Suite</h3>
              <p style={{ color: '#475569', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '20px' }}>
                Complete mini Google Classroom instructor suite: publish new assignments with due dates and rubrics, broadcast class stream notices, and mark daily student attendance.
              </p>
              <ul style={{ paddingLeft: '18px', color: '#64748b', fontSize: '0.85rem', lineHeight: '1.8', marginBottom: '24px' }}>
                <li>📋 "+ Create Assignment" Modal with Rubrics</li>
                <li>📢 Class Stream Announcement Feeds</li>
                <li>👥 One-Click Daily Attendance Register</li>
                <li>💾 Direct MongoDB Persistence</li>
              </ul>
            </div>
            <Link to="/login" className="btn-secondary" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', padding: '12px', borderRadius: '8px', fontWeight: '700', borderColor: '#1565c0', color: '#1565c0' }}>
              Access Faculty Console ➔
            </Link>
          </div>

          {/* Admin Portal Card */}
          <div className="auth-card" style={{ maxWidth: '100%', textAlign: 'left', borderTop: '5px solid #b71c1c', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '36px 32px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '2.4rem' }}>🏛️</span>
                <span style={{ backgroundColor: '#ffebee', color: '#b71c1c', fontSize: '0.75rem', fontWeight: '800', padding: '4px 10px', borderRadius: '20px' }}>
                  CENTRAL GOVERNANCE
                </span>
              </div>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1.35rem', color: '#0f172a' }}>Administration Console</h3>
              <p style={{ color: '#475569', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '20px' }}>
                Executive university metrics dashboard, complete student and faculty user management directory with search/filters, circular broadcaster, and server health monitor.
              </p>
              <ul style={{ paddingLeft: '18px', color: '#64748b', fontSize: '0.85rem', lineHeight: '1.8', marginBottom: '24px' }}>
                <li>📊 Institutional Enrollment KPIs</li>
                <li>👥 Searchable User Directory & Auditing</li>
                <li>📢 Broadcast Official University Circulars</li>
                <li>⚙️ Live Server Health & MongoDB Monitor</li>
              </ul>
            </div>
            <Link to="/login" className="btn-secondary" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', padding: '12px', borderRadius: '8px', fontWeight: '700', borderColor: '#b71c1c', color: '#b71c1c' }}>
              Access Admin Governance ➔
            </Link>
          </div>

        </div>
      </section>

      {/* Campus Life & Portal Highlights */}
      <section className="section-container">
        <h2 className="section-title">
          Campus Life & Infrastructure
        </h2>
        <p className="section-subtitle">
          RV University — A state-of-the-art campus fostering multidisciplinary excellence in Bengaluru.
        </p>

        <div className="campus-showcase">
          {/* Main Featured Campus Building Image */}
          <div className="featured-image">
            <img 
              src="https://www.admissionwala.in/storage/productimages/RV-University.jpg" 
              alt="RV University Campus Overview" 
            />
          </div>

          {/* Auto-moving rightward carousel with hover-pause */}
          <div className="marquee-container">
            <div className="marquee-track">
              {/* Set 1 */}
              <img src="https://d2b6aloc836m7p.cloudfront.net/wp-content/uploads/2025/12/SoCSE.jpg" alt="School of Computer Science & Engineering" title="SoCSE" />
              <img src="https://d2b6aloc836m7p.cloudfront.net/wp-content/uploads/2025/12/SDI.jpg" alt="School of Design & Innovation" title="SDI" />
              <img src="https://d2b6aloc836m7p.cloudfront.net/wp-content/uploads/2025/12/SOB.jpg" alt="School of Business" title="SOB" />
              <img src="https://d2b6aloc836m7p.cloudfront.net/wp-content/uploads/2025/12/SOLAS.jpg" alt="School of Liberal Arts & Sciences" title="SOLAS" />
              <img src="https://d2b6aloc836m7p.cloudfront.net/wp-content/uploads/2025/12/SOEPP.jpg" alt="School of Economics & Public Policy" title="SOEPP" />
              <img src="https://d2b6aloc836m7p.cloudfront.net/wp-content/uploads/2025/12/SOL.jpg" alt="School of Law" title="SOL" />
              {/* Set 2 (Duplicate for seamless continuous loop) */}
              <img src="https://d2b6aloc836m7p.cloudfront.net/wp-content/uploads/2025/12/SoCSE.jpg" alt="School of Computer Science & Engineering" title="SoCSE" />
              <img src="https://d2b6aloc836m7p.cloudfront.net/wp-content/uploads/2025/12/SDI.jpg" alt="School of Design & Innovation" title="SDI" />
              <img src="https://d2b6aloc836m7p.cloudfront.net/wp-content/uploads/2025/12/SOB.jpg" alt="School of Business" title="SOB" />
              <img src="https://d2b6aloc836m7p.cloudfront.net/wp-content/uploads/2025/12/SOLAS.jpg" alt="School of Liberal Arts & Sciences" title="SOLAS" />
              <img src="https://d2b6aloc836m7p.cloudfront.net/wp-content/uploads/2025/12/SOEPP.jpg" alt="School of Economics & Public Policy" title="SOEPP" />
              <img src="https://d2b6aloc836m7p.cloudfront.net/wp-content/uploads/2025/12/SOL.jpg" alt="School of Law" title="SOL" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: '#092316', color: '#94a3b8', padding: '48px 24px 36px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div className="brand-badge" style={{ width: '36px', height: '36px', fontSize: '1rem' }}>RV</div>
            <span style={{ color: 'white', fontWeight: '800', fontSize: '1.1rem', letterSpacing: '-0.5px' }}>RV UNIVERSITY</span>
          </div>
          <p style={{ margin: '0 0 12px 0', color: '#e2e8f0', fontWeight: '600', fontSize: '0.95rem' }}>
            Go Change The World — RV Vidyaniketan, Mysuru Road, Bengaluru, Karnataka 560059
          </p>
          <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.7 }}>
            Campus Connect Portal &copy; {new Date().getFullYear()} School of Computer Science & Engineering. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
