require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const classroomRoutes = require('./routes/classroomRoutes');
const facultyRoutes = require('./routes/facultyRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Campus Connect API is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/classroom', classroomRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/admin', adminRoutes);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
