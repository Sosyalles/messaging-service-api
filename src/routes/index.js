const express = require('express');
const messageRoutes = require('./messageRoutes');

const router = express.Router();

router.use('/messages', messageRoutes);

module.exports = router; 