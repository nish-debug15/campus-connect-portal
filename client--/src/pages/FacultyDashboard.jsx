import React from 'react';
import { Link } from 'react-router';

export default function FacultyDashboard() {
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
          <span>Welcome, Faculty!</span>
          <Link to="/" className="btn-secondary">Logout</Link>
        </div>
      </header>
      
      <div style={{ display: 'flex', minHeight: '80vh', backgroundColor: '#f4f4f4' }}>
        <aside style={{ width: '250px', backgroundColor: 'white', padding: '20px', borderRight: '1px solid #ddd' }}>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: '15px' }}><strong>Dashboard</strong></li>
            <li style={{ marginBottom: '15px' }}><a href="#post-notices" style={{ textDecoration: 'none', color: '#333' }}>Post Notices</a></li>
            <li style={{ marginBottom: '15px' }}><a href="#post-assignments" style={{ textDecoration: 'none', color: '#333' }}>Post Assignments</a></li>
            <li style={{ marginBottom: '15px' }}><a href="#attendance" style={{ textDecoration: 'none', color: '#333' }}>Mark Attendance</a></li>
            <li style={{ marginBottom: '15px' }}><a href="#events" style={{ textDecoration: 'none', color: '#333' }}>View Events</a></li>
            <li style={{ marginBottom: '15px' }}><a href="#submissions" style={{ textDecoration: 'none', color: '#333' }}>View Submissions</a></li>
          </ul>
        </aside>
        
        <main style={{ flex: 1, padding: '30px' }}>
          <h2>Faculty Dashboard</h2>
          <p>Welcome to your portal. Use the sidebar to manage your classes and interact with students.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '30px' }}>
            <div className="auth-card" style={{ maxWidth: '100%' }}>
              <h3>Quick Actions</h3>
              <button className="btn-primary" style={{ display: 'block', marginBottom: '10px', width: '100%' }}>Create Notice</button>
              <button className="btn-primary" style={{ display: 'block', width: '100%' }}>Create Assignment</button>
            </div>
            <div className="auth-card" style={{ maxWidth: '100%' }}>
              <h3>Recent Activity</h3>
              <p>No recent activity found.</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
