import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router';
import { getSession, clearSession, classroomAPI } from '../api';
import FacultyPortal from '../components/FacultyPortal';
import AdminPortal from '../components/AdminPortal';

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [currentRole, setCurrentRole] = useState('student'); // 'student', 'faculty', 'admin'
  const [activeTab, setActiveTab] = useState('notices');
  const [classroomConnected, setClassroomConnected] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
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
      setCurrentRole(session.user.role || 'student');

      // Load profile photo from local storage if exists
      const savedPhoto = localStorage.getItem(`profile_photo_${session.user.id}`);
      if (savedPhoto) setProfilePhoto(savedPhoto);

      // Check URL params for Google classroom connect redirect
      const params = new URLSearchParams(location.search);
      if (params.get('classroom_connected') === 'true') {
        setClassroomConnected(true);
        if (params.get('demo') === 'true') {
          setIsDemoMode(true);
        }
        fetchClassroomData();
      } else {
        checkClassroomStatus();
      }
    }
  }, [navigate, location]);

  const checkClassroomStatus = async () => {
    try {
      const res = await classroomAPI.status();
      setClassroomConnected(res.connected);
      setIsDemoMode(res.isDemo || false);
      if (res.connected) {
        fetchClassroomData();
      }
    } catch (e) {
      console.error('Failed to get classroom status', e);
    }
  };

  const fetchClassroomData = async () => {
    setIsSyncing(true);
    try {
      const data = await classroomAPI.sync();
      setClassroomData(data);
      if (data.isDemo !== undefined) {
        setIsDemoMode(data.isDemo);
      }
    } catch (e) {
      console.error('Failed to sync classroom', e);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLogout = () => {
    clearSession();
    navigate('/login');
  };

  const handleConnectClassroom = async () => {
    try {
      setIsSyncing(true);
      const res = await classroomAPI.connect();
      if (res && res.connected) {
        setClassroomConnected(true);
        setIsDemoMode(res.isDemo || false);
        await fetchClassroomData();
      }
    } catch (err) {
      console.error('Error connecting to Google Classroom:', err);
      alert('Error connecting to Google Classroom');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDisconnectClassroom = async () => {
    try {
      await classroomAPI.disconnect();
      setClassroomConnected(false);
      setIsDemoMode(false);
      setClassroomData(null);
    } catch (e) {
      console.error('Failed to disconnect classroom', e);
    }
  };

  const handleSyncClassroom = async () => {
    await fetchClassroomData();
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
      {/* Top Navbar */}
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
          {/* Quick Role Preview Pill */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginRight: '15px', backgroundColor: '#f1f3f4', padding: '4px 8px', borderRadius: '20px' }}>
            <span style={{ fontSize: '0.75rem', color: '#555', fontWeight: 'bold', marginLeft: '4px' }}>Portal:</span>
            {['student', 'faculty', 'admin'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setCurrentRole(r)}
                style={{
                  padding: '3px 10px',
                  borderRadius: '15px',
                  border: 'none',
                  backgroundColor: currentRole === r ? 'var(--primary-green)' : 'transparent',
                  color: currentRole === r ? 'white' : '#555',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {r}
              </button>
            ))}
          </div>

          <span style={{ marginRight: '15px', fontWeight: '500' }}>
            Welcome, {user.name} ({currentRole})
          </span>
          {profilePhoto && (
            <img 
              src={profilePhoto} 
              alt="Profile" 
              style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary-green)' }} 
            />
          )}
          <button onClick={handleLogout} className="btn-secondary" style={{ marginLeft: '10px' }}>Logout</button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 80px)', backgroundColor: '#f9fafb' }}>
        
        {/* Student-specific sidebar */}
        {currentRole === 'student' && (
          <aside style={{ width: '260px', backgroundColor: 'white', padding: '30px 20px', borderRight: '1px solid #eaeaea', boxShadow: '2px 0 5px rgba(0,0,0,0.02)' }}>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '15px', color: 'var(--text-gray)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>
                Student Dashboard
              </li>

              <li style={{ marginBottom: '10px' }}>
                <button 
                  onClick={() => setActiveTab('notices')} 
                  style={{ width: '100%', textAlign: 'left', padding: '12px 15px', background: activeTab === 'notices' ? 'var(--primary-green)' : 'transparent', color: activeTab === 'notices' ? 'white' : 'var(--text-dark)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s' }}
                >
                  📢 Notices & Events
                </button>
              </li>

              <li style={{ marginBottom: '10px' }}>
                <button 
                  onClick={() => setActiveTab('assignments')} 
                  style={{ width: '100%', textAlign: 'left', padding: '12px 15px', background: activeTab === 'assignments' ? 'var(--primary-green)' : 'transparent', color: activeTab === 'assignments' ? 'white' : 'var(--text-dark)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s' }}
                >
                  📝 My Assignments
                </button>
              </li>

              <li style={{ marginBottom: '10px' }}>
                <button 
                  onClick={() => setActiveTab('courses')} 
                  style={{ width: '100%', textAlign: 'left', padding: '12px 15px', background: activeTab === 'courses' ? 'var(--primary-green)' : 'transparent', color: activeTab === 'courses' ? 'white' : 'var(--text-dark)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <span>📚 Enrolled Courses</span>
                  {classroomData?.courses?.length ? (
                    <span style={{ backgroundColor: activeTab === 'courses' ? 'rgba(255,255,255,0.3)' : 'var(--primary-green)', color: 'white', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '10px' }}>
                      {classroomData.courses.length}
                    </span>
                  ) : null}
                </button>
              </li>

              <li style={{ marginBottom: '10px' }}>
                <button 
                  onClick={() => setActiveTab('attendance')} 
                  style={{ width: '100%', textAlign: 'left', padding: '12px 15px', background: activeTab === 'attendance' ? 'var(--primary-green)' : 'transparent', color: activeTab === 'attendance' ? 'white' : 'var(--text-dark)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s' }}
                >
                  📊 Track Attendance
                </button>
              </li>

              <li style={{ marginBottom: '10px' }}>
                <button 
                  onClick={() => setActiveTab('profile')} 
                  style={{ width: '100%', textAlign: 'left', padding: '12px 15px', background: activeTab === 'profile' ? 'var(--primary-green)' : 'transparent', color: activeTab === 'profile' ? 'white' : 'var(--text-dark)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s' }}
                >
                  👤 My Profile
                </button>
              </li>
            </ul>
          </aside>
        )}

        {/* Dynamic Workspace Container */}
        <main style={{ flex: 1, padding: '40px' }}>
          
          {/* FACULTY PORTAL (Mini Google Classroom) */}
          {currentRole === 'faculty' && (
            <FacultyPortal user={user} />
          )}

          {/* ADMIN PORTAL (Institutional Control) */}
          {currentRole === 'admin' && (
            <AdminPortal user={user} />
          )}

          {/* STUDENT PORTAL */}
          {currentRole === 'student' && (
            <>
              {/* Google Classroom Banner */}
              {!classroomConnected ? (
                <div style={{ backgroundColor: '#fff8e1', border: '1px solid #ffecb3', padding: '22px 26px', borderRadius: '10px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      <h3 style={{ margin: 0, color: '#b78103' }}>Connect Google Classroom</h3>
                      <span style={{ backgroundColor: '#ffe082', color: '#795548', fontSize: '0.75rem', fontWeight: 'bold', padding: '2px 8px', borderRadius: '12px' }}>
                        Simulation Ready
                      </span>
                    </div>
                    <p style={{ margin: 0, color: '#666', fontSize: '0.95rem' }}>Sync your RV University enrolled courses, announcements, and assignments seamlessly.</p>
                  </div>
                  <button onClick={handleConnectClassroom} disabled={isSyncing} className="btn-primary" style={{ backgroundColor: '#fbbc05', borderColor: '#fbbc05', color: '#333', fontWeight: '600' }}>
                    {isSyncing ? 'Connecting...' : '⚡ Connect Google Classroom'}
                  </button>
                </div>
              ) : (
                <div style={{ backgroundColor: '#e6f4ea', border: '1px solid #ceead6', padding: '20px 26px', borderRadius: '10px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      <h3 style={{ margin: 0, color: '#137333' }}>Google Classroom Connected</h3>
                      <span style={{ backgroundColor: '#c8e6c9', color: '#1b5e20', fontSize: '0.75rem', fontWeight: 'bold', padding: '2px 8px', borderRadius: '12px' }}>
                        {isDemoMode ? 'DEMO MODE (RVU SIMULATION)' : 'LIVE SYNC'}
                      </span>
                    </div>
                    <p style={{ margin: 0, color: '#555', fontSize: '0.95rem' }}>Your active courses, assignments, and faculty notices are synced.</p>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={handleSyncClassroom} disabled={isSyncing} className="btn-primary" style={{ backgroundColor: '#137333', borderColor: '#137333' }}>
                      {isSyncing ? '🔄 Syncing...' : '🔄 Sync Now'}
                    </button>
                    <button onClick={handleDisconnectClassroom} className="btn-secondary" style={{ color: '#c62828', borderColor: '#ffcdd2' }}>
                      Disconnect
                    </button>
                  </div>
                </div>
              )}

              {/* Active Tab Content: Notices */}
              {activeTab === 'notices' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                    <h2 style={{ margin: 0, color: 'var(--primary-green)' }}>Notices & Events</h2>
                    {classroomConnected && (
                      <span style={{ fontSize: '0.9rem', color: '#666' }}>Showing {classroomData?.notices?.length || 0} notices</span>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                    {classroomData && classroomData.notices && classroomData.notices.length > 0 ? (
                      classroomData.notices.map((notice) => (
                        <div key={notice.id} className="auth-card" style={{ maxWidth: '100%', padding: '25px', borderLeft: '5px solid var(--primary-green)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                            <h3 style={{ margin: '0 0 8px', color: '#333' }}>{notice.title}</h3>
                            <span style={{ color: '#888', fontSize: '0.85rem', backgroundColor: '#f1f3f4', padding: '3px 10px', borderRadius: '12px' }}>
                              📅 {notice.date}
                            </span>
                          </div>
                          {notice.courseName && (
                            <p style={{ color: 'var(--primary-green)', fontSize: '0.9rem', fontWeight: 'bold', margin: '4px 0 10px' }}>
                              {notice.courseName}
                            </p>
                          )}
                          <p style={{ margin: 0, color: '#555', lineHeight: '1.5' }}>
                            {notice.description || 'Announcement posted to class stream.'}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="auth-card" style={{ maxWidth: '100%', padding: '25px', borderLeft: '4px solid #ccc' }}>
                        <h3 style={{ marginTop: 0, color: '#333' }}>Welcome to Fall Semester 2026</h3>
                        <p style={{ color: '#777', fontSize: '0.85rem' }}>Posted: Today</p>
                        <p style={{ marginBottom: 0 }}>This is a default notice. Click "Connect Google Classroom" above to load actual course notices.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Active Tab Content: Assignments */}
              {activeTab === 'assignments' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                    <h2 style={{ margin: 0, color: 'var(--primary-green)' }}>My Assignments</h2>
                    {classroomConnected && (
                      <span style={{ fontSize: '0.9rem', color: '#666' }}>Showing {classroomData?.assignments?.length || 0} active assignments</span>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '22px' }}>
                    {classroomData && classroomData.assignments && classroomData.assignments.length > 0 ? (
                      classroomData.assignments.map((assn) => (
                        <div key={assn.id} className="auth-card" style={{ maxWidth: '100%', padding: '25px', borderTop: '4px solid #e74c3c', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', padding: '3px 8px', borderRadius: '10px', backgroundColor: assn.status === 'Due Soon' ? '#ffebee' : '#e8f5e9', color: assn.status === 'Due Soon' ? '#c62828' : '#2e7d32' }}>
                                {assn.status || 'Active'}
                              </span>
                              {assn.points && (
                                <span style={{ fontSize: '0.8rem', color: '#777', fontWeight: '600' }}>
                                  {assn.points}
                                </span>
                              )}
                            </div>
                            <h3 style={{ margin: '0 0 10px', color: '#333', fontSize: '1.15rem' }}>{assn.title}</h3>
                            {assn.courseName && (
                              <p style={{ color: 'var(--primary-green)', fontSize: '0.85rem', fontWeight: 'bold', margin: '0 0 12px' }}>
                                {assn.courseName}
                              </p>
                            )}
                            <p style={{ color: '#666', fontSize: '0.85rem', margin: '0 0 15px' }}>
                              <strong>Due Date:</strong> {assn.due}
                            </p>
                          </div>
                          <button className="btn-secondary" style={{ width: '100%', marginTop: '10px' }}>
                            View Details & Submit
                          </button>
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

              {/* Active Tab Content: Enrolled Courses */}
              {activeTab === 'courses' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                    <h2 style={{ margin: 0, color: 'var(--primary-green)' }}>Enrolled Courses (Google Classroom)</h2>
                    {classroomConnected && (
                      <span style={{ fontSize: '0.9rem', color: '#666' }}>
                        {classroomData?.courses?.length || 0} active courses enrolled
                      </span>
                    )}
                  </div>

                  {!classroomConnected ? (
                    <div className="auth-card" style={{ maxWidth: '100%', padding: '30px', textAlign: 'center' }}>
                      <p style={{ fontSize: '1.1rem', color: '#555', marginBottom: '20px' }}>
                        Connect Google Classroom to view your official enrolled courses and classrooms.
                      </p>
                      <button onClick={handleConnectClassroom} className="btn-primary">
                        Connect Google Classroom
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '22px' }}>
                      {classroomData && classroomData.courses && classroomData.courses.length > 0 ? (
                        classroomData.courses.map((course) => (
                          <div key={course.id} className="auth-card" style={{ maxWidth: '100%', padding: '25px', borderTop: '4px solid var(--primary-green)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', padding: '2px 8px', borderRadius: '10px', backgroundColor: '#e8f5e9', color: 'var(--primary-green)' }}>
                                  Active
                                </span>
                                {course.enrollmentCode && (
                                  <span style={{ fontSize: '0.75rem', color: '#888', fontFamily: 'monospace' }}>
                                    Code: {course.enrollmentCode}
                                  </span>
                                )}
                              </div>
                              <h3 style={{ margin: '0 0 10px', color: '#222', fontSize: '1.2rem' }}>{course.name}</h3>
                              <div style={{ fontSize: '0.85rem', color: '#666', lineHeight: '1.6', marginBottom: '15px' }}>
                                <div><strong>Section:</strong> {course.section || 'General'}</div>
                                <div><strong>Room / Lab:</strong> {course.room || 'Online'}</div>
                                {course.faculty && <div><strong>Faculty:</strong> {course.faculty}</div>}
                              </div>
                            </div>
                            <button 
                              onClick={() => setActiveTab('assignments')} 
                              className="btn-secondary" 
                              style={{ width: '100%', marginTop: '10px' }}
                            >
                              View Course Assignments
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="auth-card" style={{ maxWidth: '100%', padding: '25px' }}>
                          <p>No courses synced yet. Click "Sync Now" in the banner above.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Active Tab Content: Attendance */}
              {activeTab === 'attendance' && (
                <div>
                  <h2 style={{ marginBottom: '25px', color: 'var(--primary-green)' }}>Track Attendance</h2>
                  <div className="auth-card" style={{ maxWidth: '100%', padding: '30px' }}>
                    <div>
                      <h3>Overall Attendance: 88%</h3>
                      <div style={{ width: '100%', height: '20px', backgroundColor: '#e0e0e0', borderRadius: '10px', overflow: 'hidden', margin: '15px 0 30px' }}>
                        <div style={{ width: '88%', height: '100%', backgroundColor: 'var(--primary-green)' }}></div>
                      </div>
                      <h4>Course-wise Attendance</h4>
                      <ul style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
                        <li>CS301 - Full Stack Web Development: <strong>92%</strong> (23/25 Classes)</li>
                        <li>CS304 - Database Management Systems: <strong>85%</strong> (17/20 Classes)</li>
                        <li>CS308 - Computer Networks & Security: <strong>88%</strong> (22/25 Classes)</li>
                        <li>AI201 - Intro to Machine Learning: <strong>90%</strong> (18/20 Classes)</li>
                        <li>MA202 - Discrete Mathematics: <strong>84%</strong> (21/25 Classes)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Active Tab Content: Profile */}
              {activeTab === 'profile' && (
                <div>
                  <h2 style={{ marginBottom: '25px', color: 'var(--primary-green)' }}>Student Profile</h2>
                  <div className="auth-card" style={{ maxWidth: '800px', padding: '30px' }}>
                    <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ width: '130px', height: '130px', backgroundColor: '#f0f0f0', borderRadius: '50%', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '3px solid var(--primary-green)' }}>
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
                      
                      <div style={{ flex: 1, minWidth: '260px' }}>
                        <h3 style={{ marginTop: 0, fontSize: '1.8rem', color: '#333' }}>{user.name}</h3>
                        <p style={{ color: 'var(--primary-green)', fontWeight: 'bold', textTransform: 'capitalize', marginBottom: '20px' }}>
                          {user.role} Account
                        </p>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                          <div>
                            <p style={{ margin: '0 0 5px', color: '#777', fontSize: '0.85rem' }}>Email</p>
                            <p style={{ margin: 0, fontWeight: '500' }}>{user.email}</p>
                          </div>
                          <div>
                            <p style={{ margin: '0 0 5px', color: '#777', fontSize: '0.85rem' }}>USN</p>
                            <p style={{ margin: 0, fontWeight: '500' }}>{user.usn || '1RV21CS001'}</p>
                          </div>
                          <div>
                            <p style={{ margin: '0 0 5px', color: '#777', fontSize: '0.85rem' }}>School</p>
                            <p style={{ margin: 0, fontWeight: '500' }}>{user.branch || 'SoCSE'}</p>
                          </div>
                          <div>
                            <p style={{ margin: '0 0 5px', color: '#777', fontSize: '0.85rem' }}>Year</p>
                            <p style={{ margin: 0, fontWeight: '500' }}>{user.year ? `${user.year} Year` : '3rd Year'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

        </main>
      </div>
    </div>
  );
}
