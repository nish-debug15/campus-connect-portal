const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

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
      description: 'Submit your architecture diagrams, database schemas, and REST API documentation to the classroom portal before midnight. Evaluation starts tomorrow.'
    },
    {
      id: 'notice-2',
      title: 'Guest Lecture: Scalable Microservices Architecture with Docker & K8s',
      courseName: 'CS308 - Computer Networks & Security',
      date: formatDate(1),
      description: 'Industry expert session by AWS Principal Architect this Friday at 2:30 PM in Hall 201. Attendance is mandatory for all sections.'
    },
    {
      id: 'notice-3',
      title: 'Mid-Semester Lab Exam Schedule & Practical Problem Statements',
      courseName: 'CS304 - Database Management Systems',
      date: formatDate(3),
      description: 'Review the indexing strategies, B-Trees, and SQL normalization problems shared in the classroom files. Practical exam duration is 2 hours.'
    },
    {
      id: 'notice-4',
      title: 'Kaggle Benchmark Dataset for Supervised Learning Classification',
      courseName: 'AI201 - Intro to Machine Learning & Data Science',
      date: formatDate(5),
      description: 'The dataset has been uploaded to Google Drive. Submit your baseline Jupyter notebook before next Wednesday with accuracy benchmarks.'
    }
  ];

  const assignments = [
    {
      id: 'assn-1',
      title: 'Sprint 2: RESTful API & Authentication Architecture',
      courseName: 'CS301 - Full Stack Web Development',
      due: formatDueDate(3),
      points: '100 pts',
      status: 'Due Soon'
    },
    {
      id: 'assn-2',
      title: 'Normalization (1NF to BCNF) & SQL Query Optimization Problem Set',
      courseName: 'CS304 - Database Management Systems',
      due: formatDueDate(6),
      points: '50 pts',
      status: 'Assigned'
    },
    {
      id: 'assn-3',
      title: 'Wireshark Packet Analysis: TCP Handshake & TLS Decryption',
      courseName: 'CS308 - Computer Networks & Security',
      due: formatDueDate(9),
      points: '75 pts',
      status: 'Assigned'
    },
    {
      id: 'assn-4',
      title: 'Classification Model Evaluation: Confusion Matrix & ROC Curves',
      courseName: 'AI201 - Intro to Machine Learning & Data Science',
      due: formatDueDate(12),
      points: '100 pts',
      status: 'Assigned'
    },
    {
      id: 'assn-5',
      title: 'Graph Theory & Dijkstra Shortest Path Proofs',
      courseName: 'MA202 - Discrete Mathematics & Graph Theory',
      due: formatDueDate(15),
      points: '50 pts',
      status: 'Assigned'
    }
  ];

  const customAssignments = (() => {
    try {
      const f = path.join(__dirname, '..', 'data', 'assignments.json');
      return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : [];
    } catch { return []; }
  })();

  const customNotices = (() => {
    try {
      const f = path.join(__dirname, '..', 'data', 'notices.json');
      return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : [];
    } catch { return []; }
  })();

  return {
    courses,
    notices: [...customNotices, ...notices],
    assignments: [...customAssignments, ...assignments]
  };
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

    if (!userTokens) {
      return res.status(401).json({ error: 'Google Classroom not connected' });
    }

    // If user is in demo mode or credentials are not configured, return rich simulation data
    if (userTokens.isDemo || !isConfigured) {
      const demoData = getDemoData();
      return res.json({
        ...demoData,
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
      // Announcements
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

      // Coursework
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
