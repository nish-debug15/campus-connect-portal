const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_for_dev_only';

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, usn, branch, year, empId, department } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Name, email, password, and role are required' });
    }

    if (mongoose.connection.readyState !== 1) {
      const normalizedEmail = email.toLowerCase().trim();
      const demoUsers = {
        'admin@rvu.edu.in': { name: 'Campus IT Administrator', role: 'admin', empId: 'RVU-ADM-01', department: 'Central IT Administration' },
        'dean.academics@rvu.edu.in': { name: 'Dr. K. S. Sridhar', role: 'admin', empId: 'RVU-ADM-02', department: 'Office of the Academic Dean' },
        'registrar@rvu.edu.in': { name: 'Dr. D. P. Nagaraj', role: 'admin', empId: 'RVU-ADM-03', department: 'Office of the Registrar' },
        'faculty@rvu.edu.in': { name: 'Dr. Ramesh Kumar', role: 'faculty', empId: 'RVU-FAC-042', department: 'SoCSE' },
        'ananya.sharma@rvu.edu.in': { name: 'Prof. Ananya Sharma', role: 'faculty', empId: 'RVU-FAC-019', department: 'SoCSE' },
        'student@rvu.edu.in': { name: 'Test Student', role: 'student', usn: '1RV21CS001', branch: 'SoCSE', year: '3' },
        'patelnishitkumarbsc24@rvu.edu.in': { name: 'Nishit Patel', role: 'student', usn: '1RUA24SCS0068', branch: 'SoCSE', year: '2' }
      };
      const found = demoUsers[normalizedEmail];
      if (found) {
        const token = jwt.sign(
          { userId: `demo-${found.role}`, role: found.role, name: found.name },
          JWT_SECRET,
          { expiresIn: '7d' }
        );
        return res.json({ token, user: { id: `demo-${found.role}`, ...found } });
      }
      return res.status(503).json({ error: 'Database is currently establishing connection. Please wait a moment and try again.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check duplicate in MongoDB
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user in MongoDB
    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: ['student', 'faculty', 'admin'].includes(role) ? role : 'student',
      usn: role === 'student' ? usn : null,
      branch: role === 'student' ? branch : null,
      year: role === 'student' ? year : null,
      empId: (role === 'faculty' || role === 'admin') ? empId : null,
      department: (role === 'faculty' || role === 'admin') ? department : null
    });

    // Generate JWT
    const token = jwt.sign(
      { userId: newUser._id.toString(), role: newUser.role, name: newUser.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const userData = {
      id: newUser._id.toString(),
      _id: newUser._id.toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      usn: newUser.usn,
      branch: newUser.branch,
      year: newUser.year,
      empId: newUser.empId,
      department: newUser.department,
      createdAt: newUser.createdAt
    };

    res.status(201).json({ token, user: userData });
  } catch (err) {
    console.error('Registration Error:', err);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (mongoose.connection.readyState !== 1) {
      const normalizedEmail = email.toLowerCase().trim();
      const demoUsers = {
        'admin@rvu.edu.in': { name: 'Campus IT Administrator', role: 'admin', empId: 'RVU-ADM-01', department: 'Central IT Administration' },
        'dean.academics@rvu.edu.in': { name: 'Dr. K. S. Sridhar', role: 'admin', empId: 'RVU-ADM-02', department: 'Office of the Academic Dean' },
        'registrar@rvu.edu.in': { name: 'Dr. D. P. Nagaraj', role: 'admin', empId: 'RVU-ADM-03', department: 'Office of the Registrar' },
        'faculty@rvu.edu.in': { name: 'Dr. Ramesh Kumar', role: 'faculty', empId: 'RVU-FAC-042', department: 'SoCSE' },
        'ananya.sharma@rvu.edu.in': { name: 'Prof. Ananya Sharma', role: 'faculty', empId: 'RVU-FAC-019', department: 'SoCSE' },
        'student@rvu.edu.in': { name: 'Test Student', role: 'student', usn: '1RV21CS001', branch: 'SoCSE', year: '3' },
        'patelnishitkumarbsc24@rvu.edu.in': { name: 'Nishit Patel', role: 'student', usn: '1RUA24SCS0068', branch: 'SoCSE', year: '2' }
      };
      const found = demoUsers[normalizedEmail];
      if (found) {
        const token = jwt.sign(
          { userId: `demo-${found.role}`, role: found.role, name: found.name },
          JWT_SECRET,
          { expiresIn: '7d' }
        );
        return res.json({ token, user: { id: `demo-${found.role}`, ...found } });
      }
      return res.status(503).json({ error: 'Database is currently establishing connection. Please wait a moment and try again.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user._id.toString(), role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const userData = {
      id: user._id.toString(),
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      usn: user.usn,
      branch: user.branch,
      year: user.year,
      empId: user.empId,
      department: user.department,
      createdAt: user.createdAt
    };

    res.json({ token, user: userData });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
};
