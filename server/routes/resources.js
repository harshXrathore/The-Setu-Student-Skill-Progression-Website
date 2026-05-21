const express = require('express');
const router = express.Router();
const { getResourceStats } = require('../controllers/resourcesController');

router.get('/stats', getResourceStats);

module.exports = router;
