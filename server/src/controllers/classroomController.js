const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const Course = require('../models/Course');
const Assignment = require('../models/Assignment');
const Notice = require('../models/Notice');
const Attendance = require('../models/Attendance');
const Submission = require('../models/Submission');
const User = require('../models/User');

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'mock_client_id';
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'mock_client_secret';
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/classroom/callback';

const isConfigured =
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_ID !== 'mock_client_id' &&
  process.env.GOOGLE_CLIENT_ID !== 'your_google_client_id_here' &&
  process.env.GOOGLE_CLIENT_SECRET &&
  process.env.GOOGLE_CLIENT_SECRET !== 'mock_client_secret' &&
  process.env.GOOGLE_CLIENT_SECRET !== 'your_google_client_secret_here';

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

const SCOPES = [
  'https://www.googleapis.com/auth/classroom.courses.readonly',
  'https://www.googleapis.com/auth/classroom.announcements.readonly',
  'https://www.googleapis.com/auth/classroom.coursework.me.readonly'
];

// Token storage file
const tokensFile = path.join(__dirname, '..', 'data', 'tokens.json');

const getStoredTokens = () => {
  try {
    if (!fs.existsSync(tokensFile)) return {};
    const data = fs.readFileSync(tokensFile, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading tokens file:', err);
    return {};
  }
};

const saveTokens = (tokensObj) => {
  try {
    if (!fs.existsSync(path.dirname(tokensFile))) {
      fs.mkdirSync(path.dirname(tokensFile), { recursive: true });
    }
    fs.writeFileSync(tokensFile, JSON.stringify(tokensObj, null, 2));
  } catch (err) {
    console.error('Error writing tokens file:', err);
  }
};

// Generates dynamic dates relative to current runtime
const formatDate = (daysAgo) => {
  const d = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatDueDate = (daysAhead) => {
  const d = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getDemoData = () => {
  const courses = [
    {
      id: 'course-1',
      name: 'CS301 - Full Stack Web Development',
      section: 'CSE Sem 5 - Section A',
      room: 'Lab 402',
      faculty: 'Dr. Ramesh Kumar',
      enrollmentCode: 'rvu-cs301-web'
    },
    {
      id: 'course-2',
      name: 'CS304 - Database Management Systems',
      section: 'CSE Sem 5 - Section A',
      room: 'Hall 201',
      faculty: 'Prof. Ananya Sharma',
      enrollmentCode: 'rvu-cs304-db'
    },
    {
      id: 'course-3',
      name: 'CS308 - Computer Networks & Security',
      section: 'CSE Sem 5 - Section B',
      room: 'Lab 305',
      faculty: 'Dr. Arvind Rao',
      enrollmentCode: 'rvu-cs308-net'
    },
    {
      id: 'course-4',
      name: 'AI201 - Intro to Machine Learning & Data Science',
      section: 'CSE Sem 5 - Elective',
      room: 'Hall 105',
      faculty: 'Dr. Priya Sundaram',
      enrollmentCode: 'rvu-ai201-ml'
    },
    {
      id: 'course-5',
      name: 'MA202 - Discrete Mathematics & Graph Theory',
      section: 'CSE Sem 5 - Core',
      room: 'Auditorium 2',
      faculty: 'Prof. Venkatesh Iyer',
      enrollmentCode: 'rvu-ma202-dm'
    }
  ];

  const notices = [
    {
      id: 'notice-1',
      title: 'Capstone Project Phase 1 Architecture Review & Submission Guidelines',
      courseName: 'CS301 - Full Stack Web Development',
      date: formatDate(0),
      description: 'Submit your architecture diagrams, database schemas, and REST API documentation before midnight.'
    },
    {
      id: 'notice-2',
      title: 'Guest Lecture: Scalable Microservices Architecture with Docker & K8s',
      courseName: 'CS308 - Computer Networks & Security',
      date: formatDate(1),
      description: 'Industry expert session by AWS Principal Architect this Friday at 2:30 PM in Hall 201.'
    },
    {
      id: 'notice-3',
      title: 'Mid-Semester Lab Exam Schedule & Practical Problem Statements',
      courseName: 'CS304 - Database Management Systems',
      date: formatDate(3),
      description: 'Review the indexing strategies, B-Trees, and SQL normalization problems shared in class files.'
    }
  ];

  const assignments = [
    {
      id: 'assn-1',
      title: 'Sprint 2: RESTful API & Authentication Architecture',
      courseName: 'CS301 - Full Stack Web Development',
      description: 'Build robust JWT authentication with Express and connect Mongo models.',
      due: formatDueDate(3),
      points: '100 pts',
      status: 'Due Soon'
    },
    {
      id: 'assn-2',
      title: 'Normalization (1NF to BCNF) & SQL Query Optimization Problem Set',
      courseName: 'CS304 - Database Management Systems',
      description: 'Solve the normalization problem statements and optimize indexed queries.',
      due: formatDueDate(6),
      points: '50 pts',
      status: 'Assigned'
    },
    {
      id: 'assn-3',
      title: 'Wireshark Packet Analysis: TCP Handshake & TLS Decryption',
      courseName: 'CS308 - Computer Networks & Security',
      description: 'Capture packet traces, inspect TCP 3-way handshakes and write lab observations.',
      due: formatDueDate(9),
      points: '75 pts',
      status: 'Assigned'
    }
  ];

  return { courses, notices, assignments };
};

exports.getConnectUrl = (req, res) => {
  try {
    const userId = req.user.userId;

    // If Google Cloud credentials are not configured, auto-connect Demo Mode smoothly
    if (!isConfigured || process.env.DEMO_MODE === 'true') {
      const allTokens = getStoredTokens();
      allTokens[userId] = { isDemo: true, connectedAt: new Date().toISOString() };
      saveTokens(allTokens);

      return res.json({
        url: null,
        connected: true,
        isDemo: true,
        message: 'Google Classroom connected in Demo Mode'
      });
    }

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      state: userId,
      prompt: 'consent'
    });

    res.json({ url: authUrl, isDemo: false });
  } catch (err) {
    console.error('Error generating auth URL:', err);
    res.status(500).json({ error: 'Failed to generate connection URL' });
  }
};

exports.connectDemo = (req, res) => {
  try {
    const userId = req.user.userId;
    const allTokens = getStoredTokens();
    allTokens[userId] = { isDemo: true, connectedAt: new Date().toISOString() };
    saveTokens(allTokens);
    res.json({ connected: true, isDemo: true, message: 'Google Classroom connected in Demo Mode' });
  } catch (err) {
    console.error('Error connecting demo mode:', err);
    res.status(500).json({ error: 'Failed to connect demo mode' });
  }
};

exports.disconnect = (req, res) => {
  try {
    const userId = req.user.userId;
    const allTokens = getStoredTokens();
    delete allTokens[userId];
    saveTokens(allTokens);
    res.json({ connected: false, message: 'Disconnected from Google Classroom' });
  } catch (err) {
    console.error('Error disconnecting from classroom:', err);
    res.status(500).json({ error: 'Failed to disconnect' });
  }
};

exports.callback = async (req, res) => {
  const { code, state } = req.query;
  const userId = state;

  if (!code || !userId) {
    return res.redirect('http://localhost:5173/dashboard?classroom_connected=false&error=invalid_request');
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);

    const allTokens = getStoredTokens();
    allTokens[userId] = tokens;
    saveTokens(allTokens);

    res.redirect('http://localhost:5173/dashboard?classroom_connected=true');
  } catch (error) {
    console.error('Error authenticating with Google:', error.message);
    res.redirect('http://localhost:5173/dashboard?classroom_connected=false&error=oauth_failed');
  }
};

exports.status = (req, res) => {
  const userId = req.user.userId;
  const allTokens = getStoredTokens();
  const token = allTokens[userId];

  res.json({
    connected: !!token,
    isDemo: token ? (token.isDemo || false) : false
  });
};

exports.sync = async (req, res) => {
  try {
    const userId = req.user.userId;
    const allTokens = getStoredTokens();
    const userTokens = allTokens[userId];

    // Always fetch student submissions to enrich assignment objects
    const mySubmissions = await Submission.find({ studentId: userId });
    const submissionMap = {};
    mySubmissions.forEach((sub) => {
      submissionMap[sub.assignmentId.toString()] = {
        id: sub._id.toString(),
        status: sub.status,
        submissionText: sub.submissionText,
        submissionLink: sub.submissionLink,
        grade: sub.grade,
        feedback: sub.feedback,
        submittedAt: sub.submittedAt
      };
    });

    // Check if connected with real Google OAuth
    const isRealOAuth = userTokens && !userTokens.isDemo && isConfigured;

    if (!isRealOAuth) {
      let dbCourses = await Course.find().catch(() => []);
      let dbNotices = await Notice.find().sort({ createdAt: -1 }).catch(() => []);
      let dbAssignments = await Assignment.find().sort({ createdAt: -1 }).catch(() => []);

      if (!dbCourses || dbCourses.length === 0) {
        const fallback = getDemoData();
        return res.json({
          ...fallback,
          isDemo: true
        });
      }

      const courses = dbCourses.map((c) => ({
        id: c._id.toString(),
        name: c.name,
        section: c.section,
        room: c.room,
        faculty: c.faculty,
        enrollmentCode: c.enrollmentCode
      }));

      const notices = dbNotices.map((n) => ({
        id: n._id.toString(),
        title: n.title,
        courseName: n.courseName,
        date: n.date,
        description: n.description
      }));

      const assignments = dbAssignments.map((a) => {
        const sub = submissionMap[a._id.toString()] || null;
        return {
          id: a._id.toString(),
          title: a.title,
          courseName: a.courseName,
          description: a.description,
          due: a.due,
          points: a.points,
          status: sub ? sub.status : a.status,
          submission: sub
        };
      });

      return res.json({
        courses,
        notices,
        assignments,
        isDemo: true
      });
    }

    // Real Google Classroom API logic
    oauth2Client.setCredentials(userTokens);

    oauth2Client.on('tokens', (tokens) => {
      if (tokens.refresh_token) {
        userTokens.refresh_token = tokens.refresh_token;
      }
      userTokens.access_token = tokens.access_token;
      userTokens.expiry_date = tokens.expiry_date;
      const tks = getStoredTokens();
      tks[userId] = userTokens;
      saveTokens(tks);
    });

    const classroom = google.classroom({ version: 'v1', auth: oauth2Client });

    const coursesRes = await classroom.courses.list({
      studentId: 'me',
      courseStates: ['ACTIVE']
    });

    const courses = coursesRes.data.courses || [];
    const notices = [];
    const assignments = [];

    const activeCourses = courses.slice(0, 5);

    for (const course of activeCourses) {
      try {
        const annRes = await classroom.courses.announcements.list({
          courseId: course.id,
          pageSize: 3
        });
        if (annRes.data.announcements) {
          annRes.data.announcements.forEach((a) => {
            notices.push({
              id: a.id,
              title: a.text ? (a.text.substring(0, 60) + (a.text.length > 60 ? '...' : '')) : 'New Announcement',
              date: new Date(a.creationTime).toLocaleDateString(),
              courseName: course.name,
              description: a.text || ''
            });
          });
        }
      } catch (e) {
        console.error(`Error fetching announcements for ${course.name}:`, e.message);
      }

      try {
        const cwRes = await classroom.courses.courseWork.list({
          courseId: course.id,
          pageSize: 5
        });
        if (cwRes.data.courseWork) {
          cwRes.data.courseWork.forEach((cw) => {
            let dueStr = 'No due date';
            if (cw.dueDate) {
              const { year, month, day } = cw.dueDate;
              dueStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            }
            assignments.push({
              id: cw.id,
              title: cw.title,
              due: dueStr,
              courseName: course.name,
              status: 'Assigned',
              points: cw.maxPoints ? `${cw.maxPoints} pts` : ''
            });
          });
        }
      } catch (e) {
        console.error(`Error fetching coursework for ${course.name}:`, e.message);
      }
    }

    res.json({
      courses: courses.map((c) => ({
        id: c.id,
        name: c.name,
        section: c.section || 'General',
        room: c.room || 'Online',
        enrollmentCode: c.enrollmentCode || ''
      })),
      notices,
      assignments,
      isDemo: false
    });
  } catch (error) {
    console.error('Failed to sync classroom data:', error);
    res.status(500).json({ error: 'Failed to sync classroom data' });
  }
};

// 4. Student Assignment Submission Endpoints
exports.submitAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { submissionText, submissionLink } = req.body;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Student user not found' });
    }

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    let submission = await Submission.findOne({ assignmentId: id, studentId: userId });

    if (submission) {
      submission.submissionText = submissionText !== undefined ? submissionText : submission.submissionText;
      submission.submissionLink = submissionLink !== undefined ? submissionLink : submission.submissionLink;
      submission.status = 'Submitted';
      submission.submittedAt = new Date();
      await submission.save();
    } else {
      submission = await Submission.create({
        assignmentId: id,
        studentId: userId,
        studentName: user.name,
        studentEmail: user.email,
        studentUsn: user.usn || '',
        submissionText: submissionText || '',
        submissionLink: submissionLink || '',
        status: 'Submitted',
        submittedAt: new Date()
      });
    }

    const formatted = {
      id: submission._id.toString(),
      _id: submission._id.toString(),
      assignmentId: submission.assignmentId.toString(),
      status: submission.status,
      submissionText: submission.submissionText,
      submissionLink: submission.submissionLink,
      grade: submission.grade,
      feedback: submission.feedback,
      submittedAt: submission.submittedAt
    };

    res.status(201).json({ message: 'Coursework submitted successfully', submission: formatted });
  } catch (err) {
    console.error('Error submitting coursework:', err);
    res.status(500).json({ error: 'Failed to submit coursework' });
  }
};

exports.getAssignmentSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const submission = await Submission.findOne({ assignmentId: id, studentId: userId });
    res.json({ submission: submission || null });
  } catch (err) {
    console.error('Error loading submission:', err);
    res.status(500).json({ error: 'Failed to load submission' });
  }
};

// 5. Dynamic Student Attendance calculation from Attendance collection
exports.getStudentAttendance = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    const sessions = await Attendance.find().sort({ date: -1 });

    const courseBreakdown = {};
    let totalClasses = 0;
    let attendedClasses = 0;

    sessions.forEach((session) => {
      const cName = session.courseName;
      if (!courseBreakdown[cName]) {
        courseBreakdown[cName] = { total: 0, attended: 0 };
      }

      const record = session.records.find(
        (r) =>
          r.studentId === userId ||
          (user && user.usn && r.usn === user.usn) ||
          (user && user.name && r.studentName.toLowerCase() === user.name.toLowerCase())
      );

      if (record) {
        courseBreakdown[cName].total += 1;
        totalClasses += 1;
        if (record.status === 'Present') {
          courseBreakdown[cName].attended += 1;
          attendedClasses += 1;
        }
      }
    });

    const coursesList = Object.keys(courseBreakdown).map((name) => {
      const data = courseBreakdown[name];
      const pct = data.total > 0 ? Math.round((data.attended / data.total) * 100) : 100;
      return {
        courseName: name,
        total: data.total,
        attended: data.attended,
        percentage: pct
      };
    });

    const overallPercentage =
      totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 88;

    res.json({
      overallPercentage,
      totalClasses,
      attendedClasses,
      courses: coursesList.length > 0 ? coursesList : [
        { courseName: 'CS301 - Full Stack Web Development', total: 25, attended: 23, percentage: 92 },
        { courseName: 'CS304 - Database Management Systems', total: 20, attended: 17, percentage: 85 },
        { courseName: 'CS308 - Computer Networks & Security', total: 25, attended: 22, percentage: 88 },
        { courseName: 'AI201 - Intro to Machine Learning & Data Science', total: 20, attended: 18, percentage: 90 },
        { courseName: 'MA202 - Discrete Mathematics & Graph Theory', total: 25, attended: 21, percentage: 84 }
      ]
    });
  } catch (err) {
    console.error('Error fetching student attendance:', err);
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
};
