import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router';
import { getSession, clearSession, classroomAPI } from '../api';

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('notices');
  const [classroomConnected, setClassroomConnected] = useState(false);
  const [classroomData, setClassroomData] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const session = getSession();
    if (!session || !session.user) {
      navigate('/login');
    } else {
      setUser(session.user);
      
      // Load profile photo from local storage if exists
      const savedPhoto = localStorage.getItem(`profile_photo_${session.user.id}`);
      if (savedPhoto) setProfilePhoto(savedPhoto);

      // Check URL params for Google classroom connect redirect
      const params = new URLSearchParams(location.search);
      if (params.get('classroom_connected') === 'true') {
        setClassroomConnected(true);
      } else {
        checkClassroomStatus();
      }
    }
  }, [navigate, location]);

  const checkClassroomStatus = async () => {
    try {
      const res = await classroomAPI.status();
      setClassroomConnected(res.connected);
    } catch (e) {
      console.error('Failed to get classroom status', e);
    }
  };

  const handleLogout = () => {
    clearSession();
    navigate('/login');
  };

  const handleConnectClassroom = () => {
    classroomAPI.connect();
  };

  const handleSyncClassroom = async () => {
    setIsSyncing(true);
    try {
      const data = await classroomAPI.sync();
      setClassroomData(data);
    } catch (e) {
      console.error('Failed to sync classroom', e);
      alert('Error syncing classroom data');
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result);
        if (user) {
          localStorage.setItem(`profile_photo_${user.id}`, reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (!user) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;

  return (
    <div>
      <header className="navbar" style={{ borderBottom: '1px solid #eaeaea' }}>
        <div className="logo-group">
          <div className="brand-badge">RV</div>
          <div>
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                <h1 className="university-name">RV UNIVERSITY<sup>®</sup></h1>
            </Link>
          </div>
        </div>
        <div className="nav-actions" style={{ alignItems: 'center' }}>
          <span style={{ marginRight: '15px', fontWeight: '500' }}>
            Welcome, {user.name} ({user.role})
          </span>
          {profilePhoto && (
            <img 
              src={profilePhoto} 
              alt="Profile" 
              style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary-green)' }} 
            />
          )}
          <button onClick={handleLogout} className="btn-secondary" style={{ marginLeft: '15px' }}>Logout</button>
        </div>
      </header>
      
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 80px)', backgroundColor: '#f9fafb' }}>
        <aside style={{ width: '260px', backgroundColor: 'white', padding: '30px 20px', borderRight: '1px solid #eaeaea', boxShadow: '2px 0 5px rgba(0,0,0,0.02)' }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li style={{ marginBottom: '15px', color: 'var(--text-gray)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>Dashboard</li>
            
            <li style={{ marginBottom: '10px' }}>
              <button 
                onClick={() => setActiveTab('notices')} 
                style={{ width: '100%', textAlign: 'left', padding: '12px 15px', background: activeTab === 'notices' ? 'var(--primary-green)' : 'transparent', color: activeTab === 'notices' ? 'white' : 'var(--text-dark)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s' }}
              >
                Notices & Events
              </button>
            </li>
            <li style={{ marginBottom: '10px' }}>
              <button 
                onClick={() => setActiveTab('assignments')} 
                style={{ width: '100%', textAlign: 'left', padding: '12px 15px', background: activeTab === 'assignments' ? 'var(--primary-green)' : 'transparent', color: activeTab === 'assignments' ? 'white' : 'var(--text-dark)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s' }}
              >
                {user.role === 'faculty' ? 'Post Assignments' : 'My Assignments'}
              </button>
            </li>
            <li style={{ marginBottom: '10px' }}>
              <button 
                onClick={() => setActiveTab('attendance')} 
                style={{ width: '100%', textAlign: 'left', padding: '12px 15px', background: activeTab === 'attendance' ? 'var(--primary-green)' : 'transparent', color: activeTab === 'attendance' ? 'white' : 'var(--text-dark)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s' }}
              >
                {user.role === 'faculty' ? 'Mark Attendance' : 'Track Attendance'}
              </button>
            </li>
            <li style={{ marginBottom: '10px' }}>
              <button 
                onClick={() => setActiveTab('profile')} 
                style={{ width: '100%', textAlign: 'left', padding: '12px 15px', background: activeTab === 'profile' ? 'var(--primary-green)' : 'transparent', color: activeTab === 'profile' ? 'white' : 'var(--text-dark)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s' }}
              >
                Profile
              </button>
            </li>
          </ul>
        </aside>
        
        <main style={{ flex: 1, padding: '40px' }}>
          
          {/* Google Classroom Banner */}
          {!classroomConnected ? (
            <div style={{ backgroundColor: '#fff8e1', border: '1px solid #ffecb3', padding: '20px', borderRadius: '8px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: '0 0 5px 0', color: '#b78103' }}>Connect Google Classroom</h3>
                <p style={{ margin: 0, color: '#666', fontSize: '0.95rem' }}>Sync your courses, announcements, and assignments automatically.</p>
              </div>
              <button onClick={handleConnectClassroom} className="btn-primary" style={{ backgroundColor: '#fbbc05', borderColor: '#fbbc05', color: '#333' }}>
                Connect Classroom
              </button>
            </div>
          ) : (
            <div style={{ backgroundColor: '#e6f4ea', border: '1px solid #ceead6', padding: '20px', borderRadius: '8px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: '0 0 5px 0', color: '#137333' }}>Google Classroom Connected</h3>
                <p style={{ margin: 0, color: '#666', fontSize: '0.95rem' }}>Your data is synced with your Google account.</p>
              </div>
              <button onClick={handleSyncClassroom} disabled={isSyncing} className="btn-primary" style={{ backgroundColor: '#137333', borderColor: '#137333' }}>
                {isSyncing ? 'Syncing...' : 'Sync Now'}
              </button>
            </div>
          )}

          {/* Active Tab Content */}
          {activeTab === 'notices' && (
            <div>
              <h2 style={{ marginBottom: '25px', color: 'var(--primary-green)' }}>Notices & Events</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                {classroomData && classroomData.notices ? (
                  classroomData.notices.map(notice => (
                    <div key={notice.id} className="auth-card" style={{ maxWidth: '100%', padding: '25px', borderLeft: '4px solid var(--primary-green)' }}>
                      <h3 style={{ marginTop: 0, color: '#333' }}>{notice.title}</h3>
                      <p style={{ color: '#777', fontSize: '0.85rem' }}>Posted: {notice.date}</p>
                      <p style={{ marginBottom: 0 }}>Synced from Google Classroom.</p>
                    </div>
                  ))
                ) : (
                  <div className="auth-card" style={{ maxWidth: '100%', padding: '25px', borderLeft: '4px solid #ccc' }}>
                    <h3 style={{ marginTop: 0, color: '#333' }}>Welcome to Fall Semester 2026</h3>
                    <p style={{ color: '#777', fontSize: '0.85rem' }}>Posted: Today</p>
                    <p style={{ marginBottom: 0 }}>This is a demo notice. Sync Google Classroom to see real data.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'assignments' && (
            <div>
              <h2 style={{ marginBottom: '25px', color: 'var(--primary-green)' }}>{user.role === 'faculty' ? 'Manage Assignments' : 'My Assignments'}</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {classroomData && classroomData.assignments ? (
                  classroomData.assignments.map(assn => (
                    <div key={assn.id} className="auth-card" style={{ maxWidth: '100%', padding: '25px', borderTop: '4px solid #e74c3c' }}>
                      <h3 style={{ marginTop: 0, color: '#333' }}>{assn.title}</h3>
                      <p style={{ color: '#777', fontSize: '0.85rem' }}>Due: {assn.due}</p>
                      <button className="btn-secondary" style={{ width: '100%', marginTop: '10px' }}>View Details</button>
                    </div>
                  ))
                ) : (
                  <div className="auth-card" style={{ maxWidth: '100%', padding: '25px', borderTop: '4px solid #ccc' }}>
                    <h3 style={{ marginTop: 0, color: '#333' }}>Sample Project Phase 1</h3>
                    <p style={{ color: '#777', fontSize: '0.85rem' }}>Due: Next Friday</p>
                    <button className="btn-secondary" style={{ width: '100%', marginTop: '10px' }}>View Details</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div>
              <h2 style={{ marginBottom: '25px', color: 'var(--primary-green)' }}>{user.role === 'faculty' ? 'Mark Attendance' : 'Track Attendance'}</h2>
              <div className="auth-card" style={{ maxWidth: '100%', padding: '30px' }}>
                {user.role === 'faculty' ? (
                  <div>
                    <h3>CS3301 - Full Stack Development</h3>
                    <p>Select date and mark student presence.</p>
                    <button className="btn-primary">Open Register</button>
                  </div>
                ) : (
                  <div>
                    <h3>Overall Attendance: 85%</h3>
                    <div style={{ width: '100%', height: '20px', backgroundColor: '#e0e0e0', borderRadius: '10px', overflow: 'hidden', margin: '15px 0 30px' }}>
                      <div style={{ width: '85%', height: '100%', backgroundColor: 'var(--primary-green)' }}></div>
                    </div>
                    <h4>Recent Classes</h4>
                    <ul style={{ paddingLeft: '20px' }}>
                      <li>Sept 15 - CS3301 (Present)</li>
                      <li>Sept 14 - CS3301 (Present)</li>
                      <li>Sept 12 - CS3301 (Absent)</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div>
              <h2 style={{ marginBottom: '25px', color: 'var(--primary-green)' }}>User Profile</h2>
              <div className="auth-card" style={{ maxWidth: '800px', padding: '30px' }}>
                <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: '150px', height: '150px', backgroundColor: '#f0f0f0', borderRadius: '50%', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '3px solid var(--primary-green)' }}>
                      {profilePhoto ? (
                        <img src={profilePhoto} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ color: '#aaa', fontSize: '3rem' }}>👤</span>
                      )}
                    </div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      ref={fileInputRef} 
                      style={{ display: 'none' }} 
                      onChange={handlePhotoUpload}
                    />
                    <button 
                      onClick={() => fileInputRef.current.click()} 
                      className="btn-secondary" 
                      style={{ marginTop: '15px', padding: '8px 15px', fontSize: '0.85rem' }}
                    >
                      Upload Photo
                    </button>
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <h3 style={{ marginTop: 0, fontSize: '1.8rem', color: '#333' }}>{user.name}</h3>
                    <p style={{ color: 'var(--primary-green)', fontWeight: 'bold', textTransform: 'capitalize', marginBottom: '20px' }}>
                      {user.role} Account
                    </p>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                      <div>
                        <p style={{ margin: '0 0 5px', color: '#777', fontSize: '0.85rem' }}>Email</p>
                        <p style={{ margin: 0, fontWeight: '500' }}>{user.email}</p>
                      </div>
                      
                      {user.role === 'student' && (
                        <>
                          <div>
                            <p style={{ margin: '0 0 5px', color: '#777', fontSize: '0.85rem' }}>USN</p>
                            <p style={{ margin: 0, fontWeight: '500' }}>{user.usn || 'N/A'}</p>
                          </div>
                          <div>
                            <p style={{ margin: '0 0 5px', color: '#777', fontSize: '0.85rem' }}>Branch</p>
                            <p style={{ margin: 0, fontWeight: '500' }}>{user.branch || 'N/A'}</p>
                          </div>
                          <div>
                            <p style={{ margin: '0 0 5px', color: '#777', fontSize: '0.85rem' }}>Year</p>
                            <p style={{ margin: 0, fontWeight: '500' }}>{user.year ? `${user.year} Year` : 'N/A'}</p>
                          </div>
                        </>
                      )}
                      
                      {user.role === 'faculty' && (
                        <>
                          <div>
                            <p style={{ margin: '0 0 5px', color: '#777', fontSize: '0.85rem' }}>Employee ID</p>
                            <p style={{ margin: 0, fontWeight: '500' }}>{user.empId || 'N/A'}</p>
                          </div>
                          <div>
                            <p style={{ margin: '0 0 5px', color: '#777', fontSize: '0.85rem' }}>Department</p>
                            <p style={{ margin: 0, fontWeight: '500' }}>{user.department || 'N/A'}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
