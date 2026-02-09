const express = require('express');
const authenticate = require('../middleware/middleware');
const {
  getAllProfileNames
} = require('../controller/profileController');

const router = express.Router();

// Get all developers
router.get('/get-all-profiles', authenticate, getAllProfileNames);

module.exports = router;