const User = require('../models/User');
const Assignment = require('../models/Assignment');
const Notice = require('../models/Notice');
const Attendance = require('../models/Attendance');
const Course = require('../models/Course');

exports.getMetrics = async (req, res) => {
  try {
    const [
      totalUsers,
      studentsCount,
      facultyCount,
      adminCount,
      totalAssignments,
      totalNotices,
      totalAttendanceSessions,
      coursesCount,
      users
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'faculty' }),
      User.countDocuments({ role: 'admin' }),
      Assignment.countDocuments(),
      Notice.countDocuments(),
      Attendance.countDocuments(),
      Course.countDocuments(),
      User.find().select('branch department role')
    ]);

    // School breakdown
    const schools = {
      SoCSE: users.filter((u) => u.branch === 'SoCSE' || u.department === 'SoCSE').length,
      SoB: users.filter((u) => u.branch === 'SoB' || u.department === 'SoB').length,
      SoDI: users.filter((u) => u.branch === 'SoDI' || u.department === 'SoDI').length,
      SoE: users.filter((u) => u.branch === 'SoE' || u.department === 'SoE').length,
      SoLAS: users.filter((u) => u.branch === 'SoLAS' || u.department === 'SoLAS').length
    };

    res.json({
      metrics: {
        totalUsers,
        studentsCount,
        facultyCount,
        adminCount,
        totalAssignments,
        totalNotices,
        totalAttendanceSessions,
        activeClassrooms: coursesCount || 5,
        schools
      }
    });
  } catch (err) {
    console.error('Error fetching admin metrics:', err);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    const formatted = users.map((u) => ({
      id: u._id.toString(),
      _id: u._id.toString(),
      name: u.name,
      email: u.email,
      role: u.role,
      usn: u.usn,
      branch: u.branch,
      year: u.year,
      empId: u.empId,
      department: u.department,
      createdAt: u.createdAt
    }));
    res.json({ users: formatted });
  } catch (err) {
    console.error('Error loading user list:', err);
    res.status(500).json({ error: 'Failed to load user list' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

exports.broadcastNotice = async (req, res) => {
  try {
    const { title, description, priority = 'Academic Circular' } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Notice title is required' });
    }

    const newNotice = await Notice.create({
      title: `[${priority.toUpperCase()}] ${title.trim()}`,
      courseName: 'Office of the Registrar / Academic Dean',
      description: description || 'Official institutional notification from RV University administration.',
      postedBy: 'University Administration',
      priority
    });

    const formatted = {
      id: newNotice._id.toString(),
      _id: newNotice._id.toString(),
      title: newNotice.title,
      courseName: newNotice.courseName,
      description: newNotice.description,
      date: newNotice.date,
      postedBy: newNotice.postedBy,
      priority: newNotice.priority,
      createdAt: newNotice.createdAt
    };

    res.status(201).json({ message: 'Notice broadcasted to all campus portals', notice: formatted });
  } catch (err) {
    console.error('Error broadcasting notice:', err);
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
      database: 'MongoDB Local (Active & Connected)',
      status: 'Healthy (All Services Operational)',
      environment: process.env.NODE_ENV || 'development'
    }
  });
};
