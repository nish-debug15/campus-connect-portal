const express = require('express');
const router = express.Router();
const {
  getMetrics,
  getUsers,
  deleteUser,
  broadcastNotice,
  getSystemAudit
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Strictly enforce Admin role on all admin routes
router.use(protect);
router.use(authorize('admin'));

router.get('/metrics', getMetrics);
router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);
router.post('/broadcast', broadcastNotice);
router.get('/system', getSystemAudit);

module.exports = router;
