const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_for_dev_only';

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, usn, branch, year, empId, department } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Name, email, password, and role are required' });
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
