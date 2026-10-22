const express = require('express');
const router = express.Router();
const {
  getConnectUrl,
  connectDemo,
  disconnect,
  callback,
  status,
  sync
} = require('../controllers/classroomController');
const { protect } = require('../middleware/authMiddleware');

router.get('/connect-url', protect, getConnectUrl);
router.post('/connect-demo', protect, connectDemo);
router.post('/disconnect', protect, disconnect);
router.get('/callback', callback);
router.get('/status', protect, status);
router.post('/sync', protect, sync);

module.exports = router;
