const express = require('express');
const router = express.Router();
const {
  getDashboardReport,
  getMonthlyReport,
  getCategoryReport,
  getAccountReport,
} = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/dashboard', getDashboardReport);
router.get('/monthly', getMonthlyReport);
router.get('/categories', getCategoryReport);
router.get('/accounts', getAccountReport);

module.exports = router;
