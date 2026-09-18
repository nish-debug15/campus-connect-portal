const express = require('express');
const router = express.Router();
const { connect, callback, status, sync } = require('../controllers/classroomController');
const { protect } = require('../middleware/authMiddleware');

router.get('/connect', connect); // Usually we protect this, but since it redirects, maybe not or pass token in URL
router.get('/callback', callback);
router.get('/status', protect, status);
router.post('/sync', protect, sync);

module.exports = router;
