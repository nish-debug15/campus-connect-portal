const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// We need valid credentials from .env to actually use Google API.
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'mock_client_id';
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'mock_client_secret';
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/classroom/callback';

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

exports.getConnectUrl = (req, res) => {
  try {
    const userId = req.user.userId;
    
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      state: userId,
      prompt: 'consent' // Forces Google to provide a refresh token
    });
    
    res.json({ url: authUrl });
  } catch (err) {
    console.error('Error generating auth URL:', err);
    res.status(500).json({ error: 'Failed to generate connection URL' });
  }
};

exports.callback = async (req, res) => {
  const { code, state } = req.query;
  const userId = state; // We passed userId in the state parameter
  
  if (!code || !userId) {
    return res.redirect('http://localhost:5173/dashboard?classroom_connected=false&error=invalid_request');
  }
  
  try {
    // If using mock credentials, this will throw an error
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
  
  // Return true if we have tokens stored for this user
  res.json({ connected: !!allTokens[userId] });
};

exports.sync = async (req, res) => {
  try {
    const userId = req.user.userId;
    const allTokens = getStoredTokens();
    const userTokens = allTokens[userId];
    
    if (!userTokens) {
      return res.status(401).json({ error: 'Google Classroom not connected' });
    }
    
    oauth2Client.setCredentials(userTokens);
    
    // Automatically save updated tokens if refreshed
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
    
    // 1. Fetch active courses
    const coursesRes = await classroom.courses.list({
      studentId: 'me',
      courseStates: ['ACTIVE']
    });
    
    const courses = coursesRes.data.courses || [];
    const notices = [];
    const assignments = [];
    
    // 2. Fetch announcements & coursework for up to 5 courses (to avoid hitting rate limits easily)
    const activeCourses = courses.slice(0, 5);
    
    for (const course of activeCourses) {
      // Announcements
      try {
        const annRes = await classroom.courses.announcements.list({
          courseId: course.id,
          pageSize: 3
        });
        if (annRes.data.announcements) {
          annRes.data.announcements.forEach(a => {
            notices.push({
              id: a.id,
              title: a.text ? (a.text.substring(0, 60) + (a.text.length > 60 ? '...' : '')) : 'New Announcement',
              date: new Date(a.creationTime).toLocaleDateString(),
              courseName: course.name
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
          cwRes.data.courseWork.forEach(cw => {
            let dueStr = 'No due date';
            if (cw.dueDate) {
              const { year, month, day } = cw.dueDate;
              dueStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            }
            assignments.push({
              id: cw.id,
              title: cw.title,
              due: dueStr,
              courseName: course.name
            });
          });
        }
      } catch (e) {
        console.error(`Error fetching coursework for ${course.name}:`, e.message);
      }
    }
    
    // Sort notices by newest first (assuming date strings are somewhat sortable, though ISO is better. We'll use simple sort for now)
    res.json({ notices, assignments });
    
  } catch (error) {
    console.error('Failed to sync classroom data:', error);
    res.status(500).json({ error: 'Failed to sync classroom data' });
  }
};
