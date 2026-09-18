require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const classroomRoutes = require('./routes/classroomRoutes');

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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
