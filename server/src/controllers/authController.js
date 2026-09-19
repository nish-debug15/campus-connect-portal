const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const usersFile = path.join(__dirname, '..', 'data', 'users.json');

// Ensure data directory and file exist
if (!fs.existsSync(path.dirname(usersFile))) {
  fs.mkdirSync(path.dirname(usersFile), { recursive: true });
}
if (!fs.existsSync(usersFile)) {
  fs.writeFileSync(usersFile, JSON.stringify([]));
}

const readUsers = () => {
  try {
    const data = fs.readFileSync(usersFile, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading users file:', err);
    return [];
  }
};

const saveUsers = (users) => {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
};

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_for_dev_only';

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, usn, branch, year, empId, department } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Name, email, password, and role are required' });
    }

    const normalizedEmail = email.toLowerCase();
    
    const users = readUsers();
    
    // Check duplicate
    const existingUser = users.find(u => u.email === normalizedEmail);
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user object
    const newUser = {
      id: Date.now().toString(),
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role, // 'student' or 'faculty'
      usn: role === 'student' ? usn : null,
      branch: role === 'student' ? branch : null,
      year: role === 'student' ? year : null,
      empId: role === 'faculty' ? empId : null,
      department: role === 'faculty' ? department : null,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);

    // Generate JWT
    const token = jwt.sign(
      { userId: newUser.id, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Exclude password from response
    const { password: _, ...userData } = newUser;

    res.status(201).json({ token, user: userData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const normalizedEmail = email.toLowerCase();
    const users = readUsers();
    const user = users.find(u => u.email === normalizedEmail);

    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...userData } = user;

    res.json({ token, user: userData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during login' });
  }
};
