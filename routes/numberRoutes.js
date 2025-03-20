const express = require('express');
const router = express.Router();
const { getNumbersByType } = require('../controllers/numberController');

// Routes
router.get('/numbers/:type', getNumbersByType);

module.exports = router; 