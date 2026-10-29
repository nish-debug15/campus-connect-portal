import React, { useState, useEffect } from 'react';
import { facultyAPI } from '../api';
import {
  AnnouncementIcon,
  AssignmentIcon,
  UsersIcon,
  CourseIcon,
  PlusIcon,
  TrashIcon,
  CheckIcon,
  CrossIcon
} from './Icons';

export default function FacultyPortal({ user }) {
  const [activeTab, setActiveTab] = useState('stream'); // 'stream', 'classwork', 'attendance', 'classes'
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [selectedCourse, setSelectedCourse] = useState('CS301 - Full Stack Web Development');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  
  // Modals & form state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    courseName: 'CS301 - Full Stack Web Development',
    description: '',
    due: '',
    points: '100'
  });
  
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [actionMessage, setActionMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFacultyData();
  }, []);

  const loadFacultyData = async () => {
    try {
      setLoading(true);
      const [cRes, aRes, sRes, hRes] = await Promise.all([
        facultyAPI.getCourses().catch(() => ({ courses: [] })),
        facultyAPI.getAssignments().catch(() => ({ assignments: [] })),
        facultyAPI.getStudents().catch(() => ({ students: [] })),
        facultyAPI.getAttendanceHistory().catch(() => ({ history: [] }))
      ]);

      setCourses(cRes.courses || []);
      setAssignments(aRes.assignments || []);
      setStudents(sRes.students || []);
      setAttendanceHistory(hRes.history || []);

      // Initialize default attendance state: all Present
      const initAtt = {};
      (sRes.students || []).forEach((s) => {
        initAtt[s.id] = 'Present';
      });
      setAttendanceRecords(initAtt);
    } catch (err) {
      console.error('Error loading faculty data:', err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 4000);
  };

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    if (!announcementTitle.trim()) return;

    try {
      const res = await facultyAPI.postAnnouncement({
        title: announcementTitle,
        courseName: selectedCourse,
        description: announcementText
      });
      setAnnouncements([res.notice, ...announcements]);
      setAnnouncementTitle('');
      setAnnouncementText('');
      showToast('Announcement posted to class stream.');
    } catch (err) {
      alert('Failed to post announcement');
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!newAssignment.title.trim()) return;

    try {
      const res = await facultyAPI.createAssignment(newAssignment);
      setAssignments([res.assignment, ...assignments]);
      setShowCreateModal(false);
      setNewAssignment({
        title: '',
        courseName: selectedCourse,
        description: '',
        due: '',
        points: '100'
      });
      showToast('Assignment published to students.');
    } catch (err) {
      alert('Failed to create assignment');
    }
  };

  const handleDeleteAssignment = async (id) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) return;
    try {
      await facultyAPI.deleteAssignment(id);
      setAssignments(assignments.filter((a) => a.id !== id));
      showToast('Assignment removed.');
    } catch (err) {
      alert('Failed to delete assignment');
    }
  };

  const toggleStudentStatus = (studentId) => {
    setAttendanceRecords((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === 'Present' ? 'Absent' : 'Present'
    }));
  };

  const handleSaveAttendance = async () => {
    try {
      const records = students.map((s) => ({
        studentId: s.id,
        studentName: s.name,
        usn: s.usn,
        status: attendanceRecords[s.id] || 'Present'
      }));

      const res = await facultyAPI.saveAttendance({
        courseName: selectedCourse,
        date: attendanceDate,
        records
      });

      setAttendanceHistory([res.record, ...attendanceHistory]);
      showToast(`Attendance for ${selectedCourse} saved.`);
    } catch (err) {
      alert('Failed to save attendance records');
    }
  };

  return (
    <div>
      {/* Toast notification */}
      {actionMessage && (
        <div style={{ backgroundColor: '#14532d', color: 'white', padding: '12px 20px', borderRadius: '8px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{actionMessage}</span>
          <button onClick={() => setActionMessage(null)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2rem', lineHeight: '1' }}>×</button>
        </div>
      )}

      {/* Classroom Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0e3823 0%, #165636 100%)',
        color: 'white',
        padding: '32px 36px',
        borderRadius: '14px',
        marginBottom: '28px',
        boxShadow: '0 4px 20px rgba(14, 56, 35, 0.2)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'inline-block', backgroundColor: 'rgba(255,255,255,0.15)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.5px', marginBottom: '10px' }}>
              FACULTY CLASSROOM CONSOLE
            </div>
            <h1 style={{ margin: '0 0 6px 0', fontSize: '1.85rem', fontWeight: '800', letterSpacing: '-0.5px' }}>{selectedCourse}</h1>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '0.95rem' }}>
              Instructor: <strong>{user?.name}</strong> • Department: <strong>{user?.department || 'SoCSE'}</strong>
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              style={{
                backgroundColor: 'white',
                color: '#0f172a',
                border: 'none',
                padding: '10px 16px',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
              }}
            >
              <option value="CS301 - Full Stack Web Development">CS301 - Full Stack Web Dev</option>
              <option value="CS304 - Database Management Systems">CS304 - Database Systems</option>
              <option value="CS308 - Computer Networks & Security">CS308 - Networks & Security</option>
            </select>
          </div>
        </div>
      </div>

      {/* Modern Sub-Navigation Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: '28px', gap: '20px' }}>
        <button
          onClick={() => setActiveTab('stream')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'stream' ? '3px solid var(--primary-green)' : '3px solid transparent',
            color: activeTab === 'stream' ? 'var(--primary-green)' : '#64748b',
            fontWeight: '700',
            fontSize: '0.95rem',
            padding: '12px 6px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <AnnouncementIcon size={17} color={activeTab === 'stream' ? 'var(--primary-green)' : '#64748b'} />
          <span>Stream</span>
        </button>

        <button
          onClick={() => setActiveTab('classwork')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'classwork' ? '3px solid var(--primary-green)' : '3px solid transparent',
            color: activeTab === 'classwork' ? 'var(--primary-green)' : '#64748b',
            fontWeight: '700',
            fontSize: '0.95rem',
            padding: '12px 6px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <AssignmentIcon size={17} color={activeTab === 'classwork' ? 'var(--primary-green)' : '#64748b'} />
          <span>Classwork & Assignments ({assignments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'attendance' ? '3px solid var(--primary-green)' : '3px solid transparent',
            color: activeTab === 'attendance' ? 'var(--primary-green)' : '#64748b',
            fontWeight: '700',
            fontSize: '0.95rem',
            padding: '12px 6px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <UsersIcon size={17} color={activeTab === 'attendance' ? 'var(--primary-green)' : '#64748b'} />
          <span>People & Attendance</span>
        </button>

        <button
          onClick={() => setActiveTab('classes')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'classes' ? '3px solid var(--primary-green)' : '3px solid transparent',
            color: activeTab === 'classes' ? 'var(--primary-green)' : '#64748b',
            fontWeight: '700',
            fontSize: '0.95rem',
            padding: '12px 6px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <CourseIcon size={17} color={activeTab === 'classes' ? 'var(--primary-green)' : '#64748b'} />
          <span>Teaching Courses</span>
        </button>
      </div>

      {/* 1. STREAM TAB */}
      {activeTab === 'stream' && (
        <div>
          {/* Post Announcement Card */}
          <div className="auth-card" style={{ maxWidth: '100%', padding: '26px 30px', marginBottom: '32px', borderLeft: '5px solid var(--primary-green)' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#0f172a', fontSize: '1.2rem', fontWeight: '700' }}>Share an announcement with your class</h3>
            <form onSubmit={handlePostAnnouncement}>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Subject or circular title..."
                  value={announcementTitle}
                  onChange={(e) => setAnnouncementTitle(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <textarea
                  rows="3"
                  placeholder="Share details, lecture slides, or schedule updates..."
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn-primary">
                  Publish to Stream
                </button>
              </div>
            </form>
          </div>

          {/* Announcements Feed */}
          <h3 style={{ color: '#0f172a', marginBottom: '18px', fontSize: '1.25rem', fontWeight: '800' }}>Class Stream Activity</h3>
          <div style={{ display: 'grid', gap: '18px' }}>
            {announcements.length > 0 ? (
              announcements.map((ann) => (
                <div key={ann.id} className="auth-card" style={{ maxWidth: '100%', padding: '22px 26px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '1.15rem' }}>{ann.title}</div>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>{ann.date}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--primary-green)', fontWeight: '700', marginBottom: '10px' }}>
                    {ann.courseName}
                  </div>
                  <p style={{ margin: 0, color: '#475569', lineHeight: '1.6', fontSize: '0.95rem' }}>{ann.description}</p>
                </div>
              ))
            ) : (
              <div className="auth-card" style={{ maxWidth: '100%', padding: '36px', textAlign: 'center', color: '#64748b' }}>
                No stream updates posted yet. Use the announcement box above to publish to {selectedCourse}.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. CLASSWORK TAB */}
      {activeTab === 'classwork' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
            <h2 style={{ margin: 0, color: 'var(--primary-green)', fontSize: '1.6rem', fontWeight: '800' }}>Coursework & Assignments</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <PlusIcon size={16} />
              <span>Create Assignment</span>
            </button>
          </div>

          {/* Assignment Modal */}
          {showCreateModal && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '20px'
            }}>
              <div className="auth-card" style={{ maxWidth: '560px', width: '100%', padding: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ margin: 0, color: 'var(--primary-green)', fontSize: '1.35rem', fontWeight: '800' }}>Publish Assignment</h3>
                  <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>×</button>
                </div>

                <form onSubmit={handleCreateAssignment}>
                  <div className="form-group">
                    <label>Assignment Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Lab 4: Full Stack REST API & Database Integration"
                      value={newAssignment.title}
                      onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Target Course</label>
                    <select
                      value={newAssignment.courseName}
                      onChange={(e) => setNewAssignment({ ...newAssignment, courseName: e.target.value })}
                    >
                      <option value="CS301 - Full Stack Web Development">CS301 - Full Stack Web Development</option>
                      <option value="CS304 - Database Management Systems">CS304 - Database Management Systems</option>
                      <option value="CS308 - Computer Networks & Security">CS308 - Computer Networks & Security</option>
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div className="form-group">
                      <label>Due Date</label>
                      <input
                        type="date"
                        required
                        value={newAssignment.due}
                        onChange={(e) => setNewAssignment({ ...newAssignment, due: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Total Points</label>
                      <input
                        type="number"
                        placeholder="100"
                        value={newAssignment.points}
                        onChange={(e) => setNewAssignment({ ...newAssignment, points: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Instructions & Rubric</label>
                    <textarea
                      rows="4"
                      placeholder="Specify deliverables, repository link requirements, and evaluation metrics..."
                      value={newAssignment.description}
                      onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                    <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary">
                      Publish Assignment
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Assignments List */}
          <div style={{ display: 'grid', gap: '20px' }}>
            {assignments.length > 0 ? (
              assignments.map((assn) => (
                <div key={assn.id} className="auth-card" style={{ maxWidth: '100%', padding: '24px 28px', borderLeft: '5px solid var(--primary-green)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: '800', padding: '2px 8px', borderRadius: '12px', backgroundColor: '#f0fdf4', color: '#166534' }}>
                          {assn.points || '100 pts'}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>
                          Due: {assn.due}
                        </span>
                      </div>
                      <h3 style={{ margin: '0 0 6px', color: '#0f172a', fontSize: '1.2rem', fontWeight: '700' }}>{assn.title}</h3>
                      <p style={{ color: 'var(--primary-green)', fontWeight: '700', fontSize: '0.85rem', margin: '0 0 10px' }}>
                        {assn.courseName}
                      </p>
                      <p style={{ margin: 0, color: '#475569', fontSize: '0.9rem', lineHeight: '1.6' }}>{assn.description}</p>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => alert(`Reviewing submissions for: ${assn.title}\n42 Students Enrolled • 36 Turned In • 6 Missing`)}
                        className="btn-secondary"
                        style={{ fontSize: '0.85rem' }}
                      >
                        Submissions (36)
                      </button>
                      <button
                        onClick={() => handleDeleteAssignment(assn.id)}
                        className="btn-secondary"
                        style={{ color: '#b91c1c', borderColor: '#fecaca', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <TrashIcon size={14} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="auth-card" style={{ maxWidth: '100%', padding: '40px', textAlign: 'center' }}>
                <p style={{ color: '#64748b', fontSize: '1rem', marginBottom: '18px' }}>No coursework published yet.</p>
                <button onClick={() => setShowCreateModal(true)} className="btn-primary">
                  Create First Assignment
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. ATTENDANCE TAB */}
      {activeTab === 'attendance' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <h2 style={{ margin: '0 0 5px', color: 'var(--primary-green)', fontSize: '1.6rem', fontWeight: '800' }}>Daily Attendance Register</h2>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                Record student attendance for {selectedCourse}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
              />
              <button
                onClick={handleSaveAttendance}
                className="btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <CheckIcon size={16} />
                <span>Save Register</span>
              </button>
            </div>
          </div>

          {/* Student Roster Table */}
          <div className="auth-card" style={{ maxWidth: '100%', padding: '0', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '14px 20px', color: '#475569' }}>Student Name</th>
                  <th style={{ padding: '14px 20px', color: '#475569' }}>USN</th>
                  <th style={{ padding: '14px 20px', color: '#475569' }}>School</th>
                  <th style={{ padding: '14px 20px', color: '#475569', textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => {
                  const isPresent = attendanceRecords[student.id] !== 'Absent';
                  return (
                    <tr key={student.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 20px', fontWeight: '600' }}>
                        {student.name}
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 'normal' }}>{student.email}</div>
                      </td>
                      <td style={{ padding: '14px 20px', fontFamily: 'monospace', color: '#334155' }}>{student.usn}</td>
                      <td style={{ padding: '14px 20px', color: '#475569' }}>{student.branch}</td>
                      <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => toggleStudentStatus(student.id)}
                          style={{
                            padding: '6px 18px',
                            borderRadius: '20px',
                            border: 'none',
                            fontWeight: '700',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            backgroundColor: isPresent ? '#dcfce7' : '#fee2e2',
                            color: isPresent ? '#15803d' : '#b91c1c',
                            transition: 'all 0.15s ease',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          {isPresent ? <CheckIcon size={14} color="#15803d" /> : <CrossIcon size={14} color="#b91c1c" />}
                          <span>{isPresent ? 'Present' : 'Absent'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Past Attendance History */}
          {attendanceHistory.length > 0 && (
            <div style={{ marginTop: '36px' }}>
              <h3 style={{ color: '#0f172a', marginBottom: '16px', fontSize: '1.2rem', fontWeight: '800' }}>Recorded Attendance History</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {attendanceHistory.slice(0, 4).map((h) => (
                  <div key={h.id} className="auth-card" style={{ maxWidth: '100%', padding: '18px 22px', borderLeft: '4px solid var(--primary-green)' }}>
                    <div style={{ fontWeight: '700', color: '#0f172a' }}>{h.courseName}</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0' }}>Date: {h.date}</div>
                    <div style={{ fontSize: '0.85rem', color: '#166534', fontWeight: '700' }}>
                      {h.records ? `${h.records.filter((r) => r.status === 'Present').length} / ${h.records.length} Present` : 'Recorded'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. TEACHING COURSES TAB */}
      {activeTab === 'classes' && (
        <div>
          <h2 style={{ marginBottom: '25px', color: 'var(--primary-green)', fontSize: '1.6rem', fontWeight: '800' }}>My Teaching Courses & Laboratories</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {courses.map((course) => (
              <div key={course.id || course.code} className="auth-card" style={{ maxWidth: '100%', padding: '26px', borderTop: '4px solid var(--primary-green)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '800', padding: '3px 8px', borderRadius: '10px', backgroundColor: '#f0fdf4', color: '#166534' }}>
                      {course.code}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>
                      {course.enrolledStudents} Students Enrolled
                    </span>
                  </div>
                  <h3 style={{ margin: '0 0 10px', color: '#0f172a', fontSize: '1.2rem', fontWeight: '700' }}>{course.name}</h3>
                  <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.8' }}>
                    <div><strong>Section:</strong> {course.section}</div>
                    <div><strong>Room / Hall:</strong> {course.room}</div>
                    <div><strong>Schedule:</strong> {course.schedule}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '22px' }}>
                  <button
                    onClick={() => {
                      setSelectedCourse(course.name);
                      setActiveTab('classwork');
                    }}
                    className="btn-primary"
                    style={{ flex: 1, fontSize: '0.85rem', padding: '8px 12px' }}
                  >
                    Open Classwork
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCourse(course.name);
                      setActiveTab('attendance');
                    }}
                    className="btn-secondary"
                    style={{ flex: 1, fontSize: '0.85rem', padding: '8px 12px' }}
                  >
                    Mark Attendance
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
