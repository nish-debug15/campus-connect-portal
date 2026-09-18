const { google } = require('googleapis');

// Note: In a real app, you would load these from process.env
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

// In-memory token storage: { userId: tokens }
const userTokens = {};

exports.connect = (req, res) => {
  // In a real flow, we'd pass the userId in state or session
  // For demo, we just generate the URL
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    // state: req.user.userId
  });
  res.redirect(authUrl);
};

exports.callback = async (req, res) => {
  const { code } = req.query;
  // If we had state, we'd extract userId here
  
  try {
    // const { tokens } = await oauth2Client.getToken(code);
    // userTokens[userId] = tokens;
    
    // For demo purposes since we lack real credentials, we will just mock success
    res.redirect('http://localhost:5173/dashboard?classroom_connected=true');
  } catch (error) {
    console.error('Error authenticating with Google', error);
    res.redirect('http://localhost:5173/dashboard?classroom_connected=false');
  }
};

exports.status = (req, res) => {
  // Mock status endpoint
  const userId = req.user.userId;
  // const isConnected = !!userTokens[userId];
  
  // For demo, we return true if they hit connect earlier, but let's just say true
  res.json({ connected: true });
};

exports.sync = async (req, res) => {
  try {
    // Mock sync data
    const mockData = {
      notices: [
        { id: 1, title: 'Final Project Deadline Extended', date: '2026-09-20' },
        { id: 2, title: 'Guest Lecture on AI Ethics', date: '2026-09-22' }
      ],
      assignments: [
        { id: 1, title: 'React Frontend Implementation', due: '2026-09-25' },
        { id: 2, title: 'Database Normalization Essay', due: '2026-09-30' }
      ]
    };
    
    res.json(mockData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to sync classroom data' });
  }
};
