const express = require('express');
const router = express.Router();
const { getConnectUrl, callback, status, sync } = require('../controllers/classroomController');
const { protect } = require('../middleware/authMiddleware');

router.get('/connect-url', protect, getConnectUrl);
router.get('/callback', callback);
router.get('/status', protect, status);
router.post('/sync', protect, sync);

module.exports = router;
