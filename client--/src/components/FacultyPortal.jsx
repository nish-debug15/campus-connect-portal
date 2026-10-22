import React, { useState, useEffect } from 'react';
import { facultyAPI } from '../api';

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
      showToast('Announcement posted to class stream!');
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
      showToast('Assignment published to students!');
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
      showToast(`Attendance for ${selectedCourse} on ${attendanceDate} saved!`);
    } catch (err) {
      alert('Failed to save attendance records');
    }
  };

  return (
    <div>
      {/* Toast notification */}
      {actionMessage && (
        <div style={{ backgroundColor: '#1b5e20', color: 'white', padding: '12px 20px', borderRadius: '8px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
          <span>✓ {actionMessage}</span>
          <button onClick={() => setActionMessage(null)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.1rem' }}>×</button>
        </div>
      )}

      {/* Classroom Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #137333 0%, #1e8e3e 100%)',
        color: 'white',
        padding: '30px',
        borderRadius: '12px',
        marginBottom: '25px',
        boxShadow: '0 4px 15px rgba(19, 115, 51, 0.2)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <div style={{ display: 'inline-block', backgroundColor: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '8px' }}>
              FACULTY CLASSROOM CONSOLE
            </div>
            <h1 style={{ margin: '0 0 5px 0', fontSize: '1.8rem' }}>{selectedCourse}</h1>
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
                color: '#222',
                border: 'none',
                padding: '10px 14px',
                borderRadius: '6px',
                fontWeight: '600',
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              <option value="CS301 - Full Stack Web Development">CS301 - Full Stack Web Dev</option>
              <option value="CS304 - Database Management Systems">CS304 - Database Systems</option>
              <option value="CS308 - Computer Networks & Security">CS308 - Networks & Security</option>
            </select>
          </div>
        </div>
      </div>

      {/* Google Classroom Sub-Navigation Tabs */}
      <div style={{ display: 'flex', borderBottom: '2px solid #e0e0e0', marginBottom: '25px', gap: '25px' }}>
        <button
          onClick={() => setActiveTab('stream')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'stream' ? '3px solid #137333' : '3px solid transparent',
            color: activeTab === 'stream' ? '#137333' : '#666',
            fontWeight: '600',
            fontSize: '1rem',
            padding: '10px 5px',
            cursor: 'pointer'
          }}
        >
          📢 Stream
        </button>
        <button
          onClick={() => setActiveTab('classwork')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'classwork' ? '3px solid #137333' : '3px solid transparent',
            color: activeTab === 'classwork' ? '#137333' : '#666',
            fontWeight: '600',
            fontSize: '1rem',
            padding: '10px 5px',
            cursor: 'pointer'
          }}
        >
          📋 Classwork & Assignments ({assignments.length})
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'attendance' ? '3px solid #137333' : '3px solid transparent',
            color: activeTab === 'attendance' ? '#137333' : '#666',
            fontWeight: '600',
            fontSize: '1rem',
            padding: '10px 5px',
            cursor: 'pointer'
          }}
        >
          👥 People & Attendance
        </button>
        <button
          onClick={() => setActiveTab('classes')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'classes' ? '3px solid #137333' : '3px solid transparent',
            color: activeTab === 'classes' ? '#137333' : '#666',
            fontWeight: '600',
            fontSize: '1rem',
            padding: '10px 5px',
            cursor: 'pointer'
          }}
        >
          📚 My Teaching Classes
        </button>
      </div>

      {/* 1. STREAM TAB */}
      {activeTab === 'stream' && (
        <div>
          {/* Post Announcement Card */}
          <div className="auth-card" style={{ maxWidth: '100%', padding: '25px', marginBottom: '30px', borderLeft: '4px solid #137333' }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#222' }}>Announce something to your class</h3>
            <form onSubmit={handlePostAnnouncement}>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Announcement title / subject..."
                  value={announcementTitle}
                  onChange={(e) => setAnnouncementTitle(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <textarea
                  rows="3"
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                  placeholder="Share details, lecture links, or classroom updates..."
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn-primary" style={{ backgroundColor: '#137333', borderColor: '#137333' }}>
                  Post Announcement
                </button>
              </div>
            </form>
          </div>

          {/* Announcements Feed */}
          <h3 style={{ color: '#444', marginBottom: '15px' }}>Class Stream Activity</h3>
          <div style={{ display: 'grid', gap: '18px' }}>
            {announcements.length > 0 ? (
              announcements.map((ann) => (
                <div key={ann.id} className="auth-card" style={{ maxWidth: '100%', padding: '20px 25px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ fontWeight: 'bold', color: '#222', fontSize: '1.1rem' }}>{ann.title}</div>
                    <span style={{ fontSize: '0.8rem', color: '#888' }}>{ann.date}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#137333', fontWeight: 'bold', marginBottom: '10px' }}>
                    {ann.courseName}
                  </div>
                  <p style={{ margin: 0, color: '#555', lineHeight: '1.5' }}>{ann.description}</p>
                </div>
              ))
            ) : (
              <div className="auth-card" style={{ maxWidth: '100%', padding: '30px', textAlign: 'center', color: '#777' }}>
                No announcements posted yet. Use the box above to post to {selectedCourse}.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. CLASSWORK TAB */}
      {activeTab === 'classwork' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
            <h2 style={{ margin: 0, color: 'var(--primary-green)' }}>Coursework & Assignments</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
              style={{ backgroundColor: '#137333', borderColor: '#137333', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <span>+</span> Create Assignment
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
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '20px'
            }}>
              <div className="auth-card" style={{ maxWidth: '550px', width: '100%', padding: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ margin: 0, color: '#137333' }}>Create New Assignment</h3>
                  <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer' }}>×</button>
                </div>

                <form onSubmit={handleCreateAssignment}>
                  <div className="form-group">
                    <label>Assignment Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Lab 4: Full Stack CRUD Implementation"
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
                      <label>Points</label>
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
                      style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                      placeholder="Explain deliverables, submission formats, and requirements..."
                      value={newAssignment.description}
                      onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                    <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary" style={{ backgroundColor: '#137333', borderColor: '#137333' }}>
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
                <div key={assn.id} className="auth-card" style={{ maxWidth: '100%', padding: '25px', borderLeft: '4px solid #137333' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 'bold', padding: '2px 8px', borderRadius: '12px', backgroundColor: '#e8f5e9', color: '#137333' }}>
                          {assn.points || '100 pts'}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: '#666' }}>
                          Due: {assn.due}
                        </span>
                      </div>
                      <h3 style={{ margin: '0 0 5px', color: '#222' }}>{assn.title}</h3>
                      <p style={{ color: '#137333', fontWeight: 'bold', fontSize: '0.85rem', margin: '0 0 10px' }}>
                        {assn.courseName}
                      </p>
                      <p style={{ margin: 0, color: '#555', fontSize: '0.9rem' }}>{assn.description}</p>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => alert(`Reviewing submissions for: ${assn.title}\n42 Students Enrolled • 36 Turned in • 6 Missing`)}
                        className="btn-secondary"
                        style={{ fontSize: '0.85rem' }}
                      >
                        Submissions (36)
                      </button>
                      <button
                        onClick={() => handleDeleteAssignment(assn.id)}
                        className="btn-secondary"
                        style={{ color: '#c62828', borderColor: '#ffcdd2', fontSize: '0.85rem' }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="auth-card" style={{ maxWidth: '100%', padding: '40px', textAlign: 'center' }}>
                <p style={{ color: '#666', fontSize: '1rem', marginBottom: '15px' }}>No assignments created yet.</p>
                <button onClick={() => setShowCreateModal(true)} className="btn-primary" style={{ backgroundColor: '#137333' }}>
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
              <h2 style={{ margin: '0 0 5px', color: 'var(--primary-green)' }}>Daily Attendance Register</h2>
              <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
                Mark student presence for {selectedCourse}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc' }}
              />
              <button
                onClick={handleSaveAttendance}
                className="btn-primary"
                style={{ backgroundColor: '#137333', borderColor: '#137333', fontWeight: 'bold' }}
              >
                💾 Save Register
              </button>
            </div>
          </div>

          {/* Student Roster Table */}
          <div className="auth-card" style={{ maxWidth: '100%', padding: '0', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f8e9', borderBottom: '2px solid #ceead6' }}>
                  <th style={{ padding: '14px 20px', color: '#137333' }}>Student Name</th>
                  <th style={{ padding: '14px 20px', color: '#137333' }}>USN</th>
                  <th style={{ padding: '14px 20px', color: '#137333' }}>School</th>
                  <th style={{ padding: '14px 20px', color: '#137333', textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => {
                  const isPresent = attendanceRecords[student.id] !== 'Absent';
                  return (
                    <tr key={student.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '14px 20px', fontWeight: '500' }}>
                        {student.name}
                        <div style={{ fontSize: '0.8rem', color: '#888' }}>{student.email}</div>
                      </td>
                      <td style={{ padding: '14px 20px', fontFamily: 'monospace' }}>{student.usn}</td>
                      <td style={{ padding: '14px 20px' }}>{student.branch}</td>
                      <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => toggleStudentStatus(student.id)}
                          style={{
                            padding: '6px 18px',
                            borderRadius: '20px',
                            border: 'none',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            backgroundColor: isPresent ? '#e8f5e9' : '#ffebee',
                            color: isPresent ? '#2e7d32' : '#c62828',
                            transition: 'all 0.2s'
                          }}
                        >
                          {isPresent ? '✓ Present' : '✗ Absent'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Attendance History */}
          {attendanceHistory.length > 0 && (
            <div style={{ marginTop: '35px' }}>
              <h3 style={{ color: '#333', marginBottom: '15px' }}>Past Recorded Registers</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px' }}>
                {attendanceHistory.slice(0, 4).map((h) => (
                  <div key={h.id} className="auth-card" style={{ maxWidth: '100%', padding: '18px', borderLeft: '4px solid #137333' }}>
                    <div style={{ fontWeight: 'bold', color: '#222' }}>{h.courseName}</div>
                    <div style={{ fontSize: '0.85rem', color: '#666', margin: '4px 0' }}>Date: {h.date}</div>
                    <div style={{ fontSize: '0.85rem', color: '#137333' }}>
                      {h.records ? `${h.records.filter((r) => r.status === 'Present').length} / ${h.records.length} Present` : 'Recorded'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. MY TEACHING CLASSES TAB */}
      {activeTab === 'classes' && (
        <div>
          <h2 style={{ marginBottom: '25px', color: 'var(--primary-green)' }}>My Active Courses & Laboratories</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '22px' }}>
            {courses.map((course) => (
              <div key={course.id} className="auth-card" style={{ maxWidth: '100%', padding: '25px', borderTop: '4px solid #137333', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', padding: '2px 8px', borderRadius: '10px', backgroundColor: '#e8f5e9', color: '#137333' }}>
                      {course.code}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#666' }}>
                      {course.enrolledStudents} Students
                    </span>
                  </div>
                  <h3 style={{ margin: '0 0 10px', color: '#222' }}>{course.name}</h3>
                  <div style={{ fontSize: '0.85rem', color: '#666', lineHeight: '1.6' }}>
                    <div><strong>Section:</strong> {course.section}</div>
                    <div><strong>Room:</strong> {course.room}</div>
                    <div><strong>Schedule:</strong> {course.schedule}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button
                    onClick={() => {
                      setSelectedCourse(course.name);
                      setActiveTab('classwork');
                    }}
                    className="btn-primary"
                    style={{ flex: 1, backgroundColor: '#137333', borderColor: '#137333', fontSize: '0.85rem', padding: '8px' }}
                  >
                    Open Classwork
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCourse(course.name);
                      setActiveTab('attendance');
                    }}
                    className="btn-secondary"
                    style={{ flex: 1, fontSize: '0.85rem', padding: '8px' }}
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
