import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router';
import { getSession, clearSession, classroomAPI } from '../api';
import FacultyPortal from '../components/FacultyPortal';
import AdminPortal from '../components/AdminPortal';
import {
  AnnouncementIcon,
  AssignmentIcon,
  CourseIcon,
  AttendanceIcon,
  ProfileIcon,
  GoogleIcon,
  RefreshIcon,
  LogoutIcon,
  CheckIcon,
  CrossIcon
} from '../components/Icons';

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('notices');
  const [classroomConnected, setClassroomConnected] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [classroomData, setClassroomData] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const fileInputRef = useRef(null);

  // Student Attendance State
  const [attendanceData, setAttendanceData] = useState(null);
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  // Assignment Submission Modal State
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissionText, setSubmissionText] = useState('');
  const [submissionLink, setSubmissionLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(null);

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
        if (params.get('demo') === 'true') {
          setIsDemoMode(true);
        }
        fetchClassroomData();
      } else {
        checkClassroomStatus();
      }

      // Pre-load data on mount
      fetchClassroomData();
      loadStudentAttendance();
    }
  }, [navigate, location]);

  const checkClassroomStatus = async () => {
    try {
      const res = await classroomAPI.status();
      setClassroomConnected(res.connected);
      setIsDemoMode(res.isDemo || false);
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

  const loadStudentAttendance = async () => {
    setLoadingAttendance(true);
    try {
      const res = await classroomAPI.getAttendance();
      setAttendanceData(res);
    } catch (e) {
      console.error('Failed to load attendance', e);
    } finally {
      setLoadingAttendance(false);
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
    } catch (e) {
      console.error('Failed to disconnect classroom', e);
    }
  };

  const handleSyncClassroom = async () => {
    await fetchClassroomData();
    await loadStudentAttendance();
  };

  const handleOpenSubmissionModal = (assn) => {
    setSelectedAssignment(assn);
    setSubmissionSuccess(null);
    if (assn.submission) {
      setSubmissionText(assn.submission.submissionText || '');
      setSubmissionLink(assn.submission.submissionLink || '');
    } else {
      setSubmissionText('');
      setSubmissionLink('');
    }
  };

  const handleSubmitCoursework = async (e) => {
    e.preventDefault();
    if (!selectedAssignment) return;

    setIsSubmitting(true);
    try {
      const res = await classroomAPI.submitAssignment(selectedAssignment.id, {
        submissionText,
        submissionLink
      });

      setSubmissionSuccess('Assignment submitted successfully!');
      // Update local state
      await fetchClassroomData();
      setTimeout(() => {
        setSelectedAssignment(null);
        setSubmissionSuccess(null);
      }, 1500);
    } catch (err) {
      console.error('Submission failed', err);
      alert('Failed to submit coursework. Please try again.');
    } finally {
      setIsSubmitting(false);
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

  if (!user) return <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>Loading portal...</div>;

  const role = user.role || 'student';

  return (
    <div>
      {/* Top Navbar */}
      <header className="navbar">
        <div className="logo-group">
          <div className="brand-badge">RV</div>
          <div>
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              <h1 className="university-name">RV UNIVERSITY<sup>®</sup></h1>
            </Link>
          </div>
        </div>

        <div className="nav-actions" style={{ alignItems: 'center', gap: '16px' }}>
          {/* Strictly verified authenticated user badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.9rem', color: '#334155', fontWeight: '600' }}>
              {user.name}
            </span>
            <span style={{
              backgroundColor: role === 'admin' ? '#fee2e2' : role === 'faculty' ? '#e0f2fe' : '#dcfce7',
              color: role === 'admin' ? '#b91c1c' : role === 'faculty' ? '#0369a1' : '#15803d',
              padding: '3px 10px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: '800',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {role}
            </span>
          </div>

          {profilePhoto && (
            <img 
              src={profilePhoto} 
              alt="Profile" 
              style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary-green)' }} 
            />
          )}

          <button onClick={handleLogout} className="btn-secondary" style={{ padding: '7px 16px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <LogoutIcon size={15} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 80px)', backgroundColor: '#f8fafc' }}>
        
        {/* Strictly enforce role access: If student, show Student Navigation Sidebar */}
        {role === 'student' && (
          <aside style={{ width: '260px', backgroundColor: '#ffffff', padding: '28px 18px', borderRight: '1px solid #e2e8f0', boxShadow: '1px 0 3px rgba(0,0,0,0.02)' }}>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '16px', color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '800', paddingLeft: '8px' }}>
                Student Workspace
              </li>

              <li style={{ marginBottom: '8px' }}>
                <button 
                  onClick={() => setActiveTab('notices')} 
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '11px 14px',
                    background: activeTab === 'notices' ? 'var(--primary-green)' : 'transparent',
                    color: activeTab === 'notices' ? 'white' : '#334155',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <AnnouncementIcon size={18} color={activeTab === 'notices' ? '#ffffff' : '#64748b'} />
                  <span>Notices & Events</span>
                </button>
              </li>

              <li style={{ marginBottom: '8px' }}>
                <button 
                  onClick={() => setActiveTab('assignments')} 
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '11px 14px',
                    background: activeTab === 'assignments' ? 'var(--primary-green)' : 'transparent',
                    color: activeTab === 'assignments' ? 'white' : '#334155',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <AssignmentIcon size={18} color={activeTab === 'assignments' ? '#ffffff' : '#64748b'} />
                    <span>My Assignments</span>
                  </div>
                  {classroomData?.assignments?.length ? (
                    <span style={{ backgroundColor: activeTab === 'assignments' ? 'rgba(255,255,255,0.25)' : '#e2e8f0', color: activeTab === 'assignments' ? 'white' : '#334155', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '10px', fontWeight: '700' }}>
                      {classroomData.assignments.length}
                    </span>
                  ) : null}
                </button>
              </li>

              <li style={{ marginBottom: '8px' }}>
                <button 
                  onClick={() => setActiveTab('courses')} 
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '11px 14px',
                    background: activeTab === 'courses' ? 'var(--primary-green)' : 'transparent',
                    color: activeTab === 'courses' ? 'white' : '#334155',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <CourseIcon size={18} color={activeTab === 'courses' ? '#ffffff' : '#64748b'} />
                    <span>Enrolled Courses</span>
                  </div>
                  {classroomData?.courses?.length ? (
                    <span style={{ backgroundColor: activeTab === 'courses' ? 'rgba(255,255,255,0.25)' : '#e2e8f0', color: activeTab === 'courses' ? 'white' : '#334155', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '10px', fontWeight: '700' }}>
                      {classroomData.courses.length}
                    </span>
                  ) : null}
                </button>
              </li>

              <li style={{ marginBottom: '8px' }}>
                <button 
                  onClick={() => setActiveTab('attendance')} 
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '11px 14px',
                    background: activeTab === 'attendance' ? 'var(--primary-green)' : 'transparent',
                    color: activeTab === 'attendance' ? 'white' : '#334155',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <AttendanceIcon size={18} color={activeTab === 'attendance' ? '#ffffff' : '#64748b'} />
                  <span>Track Attendance</span>
                </button>
              </li>

              <li style={{ marginBottom: '8px' }}>
                <button 
                  onClick={() => setActiveTab('profile')} 
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '11px 14px',
                    background: activeTab === 'profile' ? 'var(--primary-green)' : 'transparent',
                    color: activeTab === 'profile' ? 'white' : '#334155',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <ProfileIcon size={18} color={activeTab === 'profile' ? '#ffffff' : '#64748b'} />
                  <span>My Profile</span>
                </button>
              </li>
            </ul>
          </aside>
        )}

        {/* Dynamic Workspace Container strictly separated by Role */}
        <main style={{ flex: 1, padding: '36px 40px' }}>
          
          {/* FACULTY PORTAL: Rendered only when user.role === 'faculty' */}
          {role === 'faculty' && (
            <FacultyPortal user={user} />
          )}

          {/* ADMIN PORTAL: Rendered only when user.role === 'admin' */}
          {role === 'admin' && (
            <AdminPortal user={user} />
          )}

          {/* STUDENT PORTAL: Rendered only when user.role === 'student' */}
          {role === 'student' && (
            <>
              {/* Google Classroom Connection Banner with clean high-contrast styling */}
              {!classroomConnected ? (
                <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', padding: '24px 28px', borderRadius: '12px', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', boxShadow: '0 2px 4px rgba(245, 158, 11, 0.05)' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <h3 style={{ margin: 0, color: '#92400e', fontSize: '1.25rem', fontWeight: '800' }}>Connect Google Classroom</h3>
                      <span style={{ backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', fontSize: '0.75rem', fontWeight: '700', padding: '2px 10px', borderRadius: '12px' }}>
                        Simulation Ready
                      </span>
                    </div>
                    <p style={{ margin: 0, color: '#78350f', fontSize: '0.95rem' }}>
                      Sync your RV University enrolled courses, announcements, and assignments seamlessly.
                    </p>
                  </div>
                  <button
                    onClick={handleConnectClassroom}
                    disabled={isSyncing}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '10px',
                      backgroundColor: '#0f172a',
                      color: '#ffffff',
                      border: 'none',
                      padding: '11px 22px',
                      borderRadius: '8px',
                      fontWeight: '700',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <GoogleIcon size={18} />
                    <span>{isSyncing ? 'Connecting...' : 'Connect Google Classroom'}</span>
                  </button>
                </div>
              ) : (
                <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '20px 26px', borderRadius: '12px', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', boxShadow: '0 2px 4px rgba(22, 163, 74, 0.05)' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      <h3 style={{ margin: 0, color: '#166534', fontSize: '1.2rem', fontWeight: '800' }}>Google Classroom Connected</h3>
                      <span style={{ backgroundColor: '#dcfce7', color: '#15803d', fontSize: '0.75rem', fontWeight: '800', padding: '2px 8px', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
                        {isDemoMode ? 'SIMULATION ACTIVE' : 'LIVE SYNC'}
                      </span>
                    </div>
                    <p style={{ margin: 0, color: '#475569', fontSize: '0.95rem' }}>
                      Enrolled courses, active assignments, and faculty notices are synchronized with MongoDB.
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={handleSyncClassroom}
                      disabled={isSyncing}
                      className="btn-primary"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                    >
                      <RefreshIcon size={16} />
                      <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
                    </button>
                    <button onClick={handleDisconnectClassroom} className="btn-secondary" style={{ color: '#b91c1c', borderColor: '#fecaca' }}>
                      Disconnect
                    </button>
                  </div>
                </div>
              )}

              {/* Active Tab Content: Notices */}
              {activeTab === 'notices' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                    <h2 style={{ margin: 0, color: 'var(--primary-green)', fontSize: '1.6rem', fontWeight: '800' }}>Notices & Events</h2>
                    <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>
                      Showing {classroomData?.notices?.length || 0} notices
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                    {classroomData && classroomData.notices && classroomData.notices.length > 0 ? (
                      classroomData.notices.map((notice) => (
                        <div key={notice.id} className="auth-card" style={{ maxWidth: '100%', padding: '24px 28px', borderLeft: '5px solid var(--primary-green)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                            <h3 style={{ margin: '0 0 8px', color: '#0f172a', fontSize: '1.2rem', fontWeight: '700' }}>{notice.title}</h3>
                            <span style={{ color: '#64748b', fontSize: '0.8rem', backgroundColor: '#f1f5f9', padding: '3px 10px', borderRadius: '12px', fontWeight: '600' }}>
                              {notice.date}
                            </span>
                          </div>
                          {notice.courseName && (
                            <p style={{ color: 'var(--primary-green)', fontSize: '0.85rem', fontWeight: '700', margin: '4px 0 10px' }}>
                              {notice.courseName}
                            </p>
                          )}
                          <p style={{ margin: 0, color: '#475569', lineHeight: '1.6', fontSize: '0.95rem' }}>
                            {notice.description || 'Official academic notice.'}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="auth-card" style={{ maxWidth: '100%', padding: '30px', borderLeft: '4px solid #cbd5e1' }}>
                        <h3 style={{ marginTop: 0, color: '#0f172a' }}>Welcome to RV University Fall Semester 2026</h3>
                        <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Posted: Today</p>
                        <p style={{ marginBottom: 0, color: '#475569' }}>Academic circulars and lecture announcements will display here.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Active Tab Content: Assignments */}
              {activeTab === 'assignments' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                    <h2 style={{ margin: 0, color: 'var(--primary-green)', fontSize: '1.6rem', fontWeight: '800' }}>My Assignments</h2>
                    <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>
                      Showing {classroomData?.assignments?.length || 0} active assignments
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                    {classroomData && classroomData.assignments && classroomData.assignments.length > 0 ? (
                      classroomData.assignments.map((assn) => {
                        const isSubmitted = assn.submission && assn.submission.status === 'Submitted';
                        const isGraded = assn.submission && assn.submission.status === 'Graded';

                        return (
                          <div key={assn.id} className="auth-card" style={{
                            maxWidth: '100%',
                            padding: '24px',
                            borderTop: isGraded ? '4px solid #16a34a' : isSubmitted ? '4px solid #0284c7' : '4px solid #ef4444',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between'
                          }}>
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <span style={{
                                  fontSize: '0.75rem',
                                  fontWeight: '800',
                                  padding: '3px 10px',
                                  borderRadius: '12px',
                                  backgroundColor: isGraded ? '#dcfce7' : isSubmitted ? '#e0f2fe' : assn.status === 'Due Soon' ? '#fee2e2' : '#f1f5f9',
                                  color: isGraded ? '#15803d' : isSubmitted ? '#0369a1' : assn.status === 'Due Soon' ? '#b91c1c' : '#475569'
                                }}>
                                  {isGraded ? 'Graded' : isSubmitted ? 'Submitted' : assn.status || 'Assigned'}
                                </span>
                                {assn.points && (
                                  <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '700' }}>
                                    {assn.points}
                                  </span>
                                )}
                              </div>
                              <h3 style={{ margin: '0 0 10px', color: '#0f172a', fontSize: '1.15rem', fontWeight: '700' }}>{assn.title}</h3>
                              {assn.courseName && (
                                <p style={{ color: 'var(--primary-green)', fontSize: '0.85rem', fontWeight: '700', margin: '0 0 12px' }}>
                                  {assn.courseName}
                                </p>
                              )}
                              <p style={{ color: '#475569', fontSize: '0.85rem', margin: '0 0 16px' }}>
                                <strong>Due Date:</strong> {assn.due}
                              </p>

                              {isGraded && (
                                <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '10px 12px', borderRadius: '8px', marginBottom: '14px' }}>
                                  <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#166534' }}>
                                    Evaluation: {assn.submission.grade}
                                  </div>
                                  {assn.submission.feedback && (
                                    <div style={{ fontSize: '0.75rem', color: '#15803d', marginTop: '2px' }}>
                                      Feedback: {assn.submission.feedback}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            <button 
                              onClick={() => handleOpenSubmissionModal(assn)}
                              className={isSubmitted || isGraded ? "btn-secondary" : "btn-primary"}
                              style={{ width: '100%', marginTop: '10px', padding: '10px 16px', fontWeight: '700' }}
                            >
                              {isGraded ? 'View Grade & Submission' : isSubmitted ? 'View / Edit Submission' : 'View Details & Submit'}
                            </button>
                          </div>
                        );
                      })
                    ) : (
                      <div className="auth-card" style={{ maxWidth: '100%', padding: '25px', borderTop: '4px solid #cbd5e1' }}>
                        <h3 style={{ marginTop: 0, color: '#0f172a' }}>No coursework assigned</h3>
                        <p style={{ color: '#64748b', fontSize: '0.85rem' }}>All current project phases have been completed.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Active Tab Content: Enrolled Courses */}
              {activeTab === 'courses' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                    <h2 style={{ margin: 0, color: 'var(--primary-green)', fontSize: '1.6rem', fontWeight: '800' }}>Enrolled Courses (Google Classroom)</h2>
                    <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>
                      {classroomData?.courses?.length || 0} active courses enrolled
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                    {classroomData && classroomData.courses && classroomData.courses.length > 0 ? (
                      classroomData.courses.map((course) => (
                        <div key={course.id} className="auth-card" style={{ maxWidth: '100%', padding: '24px', borderTop: '4px solid var(--primary-green)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: '800', padding: '2px 8px', borderRadius: '10px', backgroundColor: '#f0fdf4', color: 'var(--primary-green)' }}>
                                Active
                              </span>
                              {course.enrollmentCode && (
                                <span style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>
                                  Code: {course.enrollmentCode}
                                </span>
                              )}
                            </div>
                            <h3 style={{ margin: '0 0 10px', color: '#0f172a', fontSize: '1.2rem', fontWeight: '700' }}>{course.name}</h3>
                            <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.6', marginBottom: '15px' }}>
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
                </div>
              )}

              {/* Active Tab Content: Attendance */}
              {activeTab === 'attendance' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                    <h2 style={{ margin: 0, color: 'var(--primary-green)', fontSize: '1.6rem', fontWeight: '800' }}>Track Attendance</h2>
                    <button onClick={loadStudentAttendance} className="btn-secondary" style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <RefreshIcon size={14} />
                      <span>{loadingAttendance ? 'Updating...' : 'Refresh Records'}</span>
                    </button>
                  </div>

                  <div className="auth-card" style={{ maxWidth: '100%', padding: '32px' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '10px' }}>
                        <h3 style={{ fontSize: '1.4rem', color: '#0f172a', margin: 0, fontWeight: '800' }}>
                          Overall Attendance: {attendanceData?.overallPercentage || 88}%
                        </h3>
                        <span style={{
                          backgroundColor: (attendanceData?.overallPercentage || 88) >= 75 ? '#dcfce7' : '#fee2e2',
                          color: (attendanceData?.overallPercentage || 88) >= 75 ? '#15803d' : '#b91c1c',
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '0.8rem',
                          fontWeight: '800'
                        }}>
                          {(attendanceData?.overallPercentage || 88) >= 75 ? 'Eligibility Criteria Met (>= 75%)' : 'Attendance Shortage Risk (< 75%)'}
                        </span>
                      </div>

                      <div style={{ width: '100%', height: '14px', backgroundColor: '#e2e8f0', borderRadius: '10px', overflow: 'hidden', margin: '20px 0 30px' }}>
                        <div style={{
                          width: `${attendanceData?.overallPercentage || 88}%`,
                          height: '100%',
                          backgroundColor: (attendanceData?.overallPercentage || 88) >= 75 ? 'var(--primary-green)' : '#ef4444',
                          borderRadius: '10px',
                          transition: 'width 0.4s ease'
                        }}></div>
                      </div>

                      <h4 style={{ color: '#334155', marginBottom: '18px', fontSize: '1.05rem', fontWeight: '700' }}>Course-wise Attendance Breakdown</h4>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                        {(attendanceData?.courses || []).map((c, idx) => (
                          <div key={idx} style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px 20px' }}>
                            <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.95rem', marginBottom: '8px' }}>
                              {c.courseName}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                {c.attended} / {c.total} Sessions
                              </span>
                              <span style={{
                                fontWeight: '800',
                                fontSize: '1rem',
                                color: c.percentage >= 75 ? '#166534' : '#b91c1c'
                              }}>
                                {c.percentage}%
                              </span>
                            </div>
                            <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '6px', overflow: 'hidden', marginTop: '10px' }}>
                              <div style={{ width: `${c.percentage}%`, height: '100%', backgroundColor: c.percentage >= 75 ? '#16a34a' : '#ef4444', borderRadius: '6px' }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Active Tab Content: Profile */}
              {activeTab === 'profile' && (
                <div>
                  <h2 style={{ marginBottom: '25px', color: 'var(--primary-green)', fontSize: '1.6rem', fontWeight: '800' }}>Student Profile</h2>
                  <div className="auth-card" style={{ maxWidth: '800px', padding: '32px' }}>
                    <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ width: '130px', height: '130px', backgroundColor: '#f1f5f9', borderRadius: '50%', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '3px solid var(--primary-green)' }}>
                          {profilePhoto ? (
                            <img src={profilePhoto} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <ProfileIcon size={56} color="#94a3b8" />
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
                        <h3 style={{ marginTop: 0, fontSize: '1.8rem', color: '#0f172a', fontWeight: '800' }}>{user.name}</h3>
                        <p style={{ color: 'var(--primary-green)', fontWeight: '700', textTransform: 'capitalize', marginBottom: '20px' }}>
                          Verified Student Account
                        </p>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                          <div>
                            <p style={{ margin: '0 0 5px', color: '#64748b', fontSize: '0.85rem' }}>University Email</p>
                            <p style={{ margin: 0, fontWeight: '600', color: '#0f172a' }}>{user.email}</p>
                          </div>
                          <div>
                            <p style={{ margin: '0 0 5px', color: '#64748b', fontSize: '0.85rem' }}>USN</p>
                            <p style={{ margin: 0, fontWeight: '600', color: '#0f172a' }}>{user.usn || '1RV21CS001'}</p>
                          </div>
                          <div>
                            <p style={{ margin: '0 0 5px', color: '#64748b', fontSize: '0.85rem' }}>School</p>
                            <p style={{ margin: 0, fontWeight: '600', color: '#0f172a' }}>{user.branch || 'SoCSE'}</p>
                          </div>
                          <div>
                            <p style={{ margin: '0 0 5px', color: '#64748b', fontSize: '0.85rem' }}>Year</p>
                            <p style={{ margin: 0, fontWeight: '600', color: '#0f172a' }}>{user.year ? `${user.year} Year` : '3rd Year'}</p>
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

      {/* Assignment Details & Coursework Submission Modal */}
      {selectedAssignment && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            maxWidth: '620px',
            width: '100%',
            padding: '32px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--primary-green)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {selectedAssignment.courseName}
                </span>
                <h2 style={{ margin: '4px 0 0', color: '#0f172a', fontSize: '1.4rem', fontWeight: '800' }}>
                  {selectedAssignment.title}
                </h2>
              </div>
              <button 
                onClick={() => setSelectedAssignment(null)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <CrossIcon size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <div style={{ backgroundColor: '#f1f5f9', padding: '6px 14px', borderRadius: '8px', fontSize: '0.85rem', color: '#334155' }}>
                <strong>Due:</strong> {selectedAssignment.due}
              </div>
              <div style={{ backgroundColor: '#f1f5f9', padding: '6px 14px', borderRadius: '8px', fontSize: '0.85rem', color: '#334155' }}>
                <strong>Points:</strong> {selectedAssignment.points || '100 pts'}
              </div>
              <div style={{
                backgroundColor: selectedAssignment.submission?.status === 'Graded' ? '#dcfce7' : selectedAssignment.submission ? '#e0f2fe' : '#fee2e2',
                color: selectedAssignment.submission?.status === 'Graded' ? '#15803d' : selectedAssignment.submission ? '#0369a1' : '#b91c1c',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: '700'
              }}>
                {selectedAssignment.submission?.status === 'Graded' ? 'Graded' : selectedAssignment.submission ? 'Submitted' : 'Pending Submission'}
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ margin: '0 0 8px', color: '#334155', fontSize: '0.95rem' }}>Coursework Brief & Instructions</h4>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', lineHeight: '1.6', backgroundColor: '#f8fafc', padding: '14px 18px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                {selectedAssignment.description || 'Complete the deliverables specified by your faculty and submit the project link below.'}
              </p>
            </div>

            {selectedAssignment.submission?.status === 'Graded' && (
              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '16px 20px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <h4 style={{ margin: 0, color: '#166534', fontSize: '1rem', fontWeight: '800' }}>Faculty Evaluation & Grade</h4>
                  <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#166534' }}>
                    {selectedAssignment.submission.grade}
                  </span>
                </div>
                <p style={{ margin: 0, color: '#15803d', fontSize: '0.9rem' }}>
                  <strong>Feedback:</strong> {selectedAssignment.submission.feedback || 'Great work! Well implemented.'}
                </p>
              </div>
            )}

            {submissionSuccess && (
              <div style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '12px 18px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', fontWeight: '700' }}>
                {submissionSuccess}
              </div>
            )}

            <form onSubmit={handleSubmitCoursework}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  Project Repository / Document URL
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/your-username/coursework-repo"
                  value={submissionLink}
                  onChange={(e) => setSubmissionLink(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  Solution Notes & Implementation Summary
                </label>
                <textarea
                  rows={4}
                  placeholder="Provide an overview of your architecture, endpoints implemented, or relevant testing notes..."
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedAssignment(null)}
                  className="btn-secondary"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  <CheckIcon size={16} />
                  <span>{isSubmitting ? 'Submitting...' : selectedAssignment.submission ? 'Update Submission' : 'Turn In Coursework'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
