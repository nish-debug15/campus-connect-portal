const fs = require('fs');
const path = require('path');

const usersFile = path.join(__dirname, '..', 'data', 'users.json');
const assignmentsFile = path.join(__dirname, '..', 'data', 'assignments.json');
const noticesFile = path.join(__dirname, '..', 'data', 'notices.json');
const attendanceFile = path.join(__dirname, '..', 'data', 'attendance.json');

const readJSON = (file) => {
  try {
    if (!fs.existsSync(file)) return [];
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return [];
  }
};

const writeJSON = (file, data) => {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
};

exports.getMetrics = (req, res) => {
  try {
    const users = readJSON(usersFile);
    const assignments = readJSON(assignmentsFile);
    const notices = readJSON(noticesFile);
    const attendance = readJSON(attendanceFile);

    const studentsCount = users.filter((u) => u.role === 'student').length;
    const facultyCount = users.filter((u) => u.role === 'faculty').length;
    const adminCount = users.filter((u) => u.role === 'admin').length;

    // School breakdown
    const schools = {
      SoCSE: users.filter((u) => (u.branch === 'SoCSE' || u.department === 'SoCSE')).length,
      SoB: users.filter((u) => (u.branch === 'SoB' || u.department === 'SoB')).length,
      SoDI: users.filter((u) => (u.branch === 'SoDI' || u.department === 'SoDI')).length,
      SoE: users.filter((u) => (u.branch === 'SoE' || u.department === 'SoE')).length,
      SoLAS: users.filter((u) => (u.branch === 'SoLAS' || u.department === 'SoLAS')).length
    };

    res.json({
      metrics: {
        totalUsers: users.length,
        studentsCount,
        facultyCount,
        adminCount,
        totalAssignments: assignments.length,
        totalNotices: notices.length,
        totalAttendanceSessions: attendance.length,
        activeClassrooms: 5,
        schools
      }
    });
  } catch (err) {
    console.error('Error fetching admin metrics:', err);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
};

exports.getUsers = (req, res) => {
  try {
    const users = readJSON(usersFile);
    const sanitized = users.map(({ password, ...rest }) => rest);
    res.json({ users: sanitized });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load user list' });
  }
};

exports.deleteUser = (req, res) => {
  try {
    const { id } = req.params;
    let users = readJSON(usersFile);
    users = users.filter((u) => u.id !== id);
    writeJSON(usersFile, users);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

exports.broadcastNotice = (req, res) => {
  try {
    const { title, description, priority = 'Official Circular' } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Notice title is required' });
    }

    const notices = readJSON(noticesFile);
    const newNotice = {
      id: `admin-not-${Date.now()}`,
      title: `[${priority.toUpperCase()}] ${title}`,
      courseName: 'Office of the Registrar / Academic Dean',
      description: description || 'Official institutional notification from RV University administration.',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      postedBy: 'University Administration',
      priority,
      createdAt: new Date().toISOString()
    };

    notices.unshift(newNotice);
    writeJSON(noticesFile, notices);

    res.status(201).json({ message: 'Notice broadcasted to all campus portals', notice: newNotice });
  } catch (err) {
    res.status(500).json({ error: 'Failed to broadcast notice' });
  }
};

exports.getSystemAudit = (req, res) => {
  res.json({
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      serverUptime: Math.floor(process.uptime()) + ' seconds',
      memoryUsage: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
      status: 'Healthy (All Services Operational)',
      environment: process.env.NODE_ENV || 'development'
    }
  });
};
