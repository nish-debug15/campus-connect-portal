const express = require('express');
const router = express.Router();
const {
  getConnectUrl,
  connectDemo,
  disconnect,
  callback,
  status,
  sync,
  submitAssignment,
  getAssignmentSubmission,
  getStudentAttendance
} = require('../controllers/classroomController');
const { protect } = require('../middleware/authMiddleware');

router.get('/connect-url', protect, getConnectUrl);
router.post('/connect-demo', protect, connectDemo);
router.post('/disconnect', protect, disconnect);
router.get('/callback', callback);
router.get('/status', protect, status);
router.post('/sync', protect, sync);

// Student coursework submission routes
router.post('/assignments/:id/submit', protect, submitAssignment);
router.get('/assignments/:id/submission', protect, getAssignmentSubmission);

// Student live attendance route
router.get('/attendance', protect, getStudentAttendance);

module.exports = router;
