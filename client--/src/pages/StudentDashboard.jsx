import React from 'react';
import { Link } from 'react-router';

export default function StudentDashboard() {
  return (
    <div>
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
          <span>Welcome, Student!</span>
          <Link to="/" className="btn-secondary">Logout</Link>
        </div>
      </header>
      
      <div style={{ display: 'flex', minHeight: '80vh', backgroundColor: '#f4f4f4' }}>
        <aside style={{ width: '250px', backgroundColor: 'white', padding: '20px', borderRight: '1px solid #ddd' }}>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: '15px' }}><strong>Dashboard</strong></li>
            <li style={{ marginBottom: '15px' }}><a href="#notices" style={{ textDecoration: 'none', color: '#333' }}>View Notices</a></li>
            <li style={{ marginBottom: '15px' }}><a href="#events" style={{ textDecoration: 'none', color: '#333' }}>View Events</a></li>
            <li style={{ marginBottom: '15px' }}><a href="#assignments" style={{ textDecoration: 'none', color: '#333' }}>Submit Assignments</a></li>
            <li style={{ marginBottom: '15px' }}><a href="#attendance" style={{ textDecoration: 'none', color: '#333' }}>View Attendance</a></li>
            <li style={{ marginBottom: '15px' }}><a href="#profile" style={{ textDecoration: 'none', color: '#333' }}>Update Profile</a></li>
          </ul>
        </aside>
        
        <main style={{ flex: 1, padding: '30px' }}>
          <h2>Student Dashboard</h2>
          <p>Welcome to your portal. Use the sidebar to navigate your classes, assignments, and notices.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '30px' }}>
            <div className="auth-card" style={{ maxWidth: '100%' }}>
              <h3>Recent Notices</h3>
              <p>No new notices at this time.</p>
            </div>
            <div className="auth-card" style={{ maxWidth: '100%' }}>
              <h3>Upcoming Assignments</h3>
              <p>You have 0 assignments due this week.</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
