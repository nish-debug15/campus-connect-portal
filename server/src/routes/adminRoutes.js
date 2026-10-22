const express = require('express');
const router = express.Router();
const {
  getMetrics,
  getUsers,
  deleteUser,
  broadcastNotice,
  getSystemAudit
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/metrics', getMetrics);
router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);
router.post('/broadcast', broadcastNotice);
router.get('/system', getSystemAudit);

module.exports = router;
