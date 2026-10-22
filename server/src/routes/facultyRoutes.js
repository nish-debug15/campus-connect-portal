const express = require('express');
const router = express.Router();
const {
  getCourses,
  getAssignments,
  createAssignment,
  deleteAssignment,
  postAnnouncement,
  getEnrolledStudents,
  saveAttendance,
  getAttendanceHistory
} = require('../controllers/facultyController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/courses', getCourses);
router.get('/assignments', getAssignments);
router.post('/assignments', createAssignment);
router.delete('/assignments/:id', deleteAssignment);
router.post('/announcements', postAnnouncement);
router.get('/students', getEnrolledStudents);
router.post('/attendance', saveAttendance);
router.get('/attendance', getAttendanceHistory);

module.exports = router;
