const express = require('express');
const router = express.Router();
const {
  getAccounts,
  createAccount,
  getAccountById,
  updateAccount,
  deleteAccount,
} = require('../controllers/accountController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getAccounts)
  .post(createAccount);

router.route('/:id')
  .get(getAccountById)
  .put(updateAccount)
  .delete(deleteAccount);

module.exports = router;
