const express = require('express');
const router = express.Router();
const {
  getCourses,
  getAssignments,
  createAssignment,
  deleteAssignment,
  getAssignmentSubmissions,
  gradeSubmission,
  postAnnouncement,
  getEnrolledStudents,
  saveAttendance,
  getAttendanceHistory
} = require('../controllers/facultyController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Strictly enforce Faculty or Admin role
router.use(protect);
router.use(authorize('faculty', 'admin'));

router.get('/courses', getCourses);
router.get('/assignments', getAssignments);
router.post('/assignments', createAssignment);
router.delete('/assignments/:id', deleteAssignment);
router.get('/assignments/:id/submissions', getAssignmentSubmissions);
router.post('/submissions/:id/grade', gradeSubmission);
router.post('/announcements', postAnnouncement);
router.get('/students', getEnrolledStudents);
router.post('/attendance', saveAttendance);
router.get('/attendance', getAttendanceHistory);

module.exports = router;
