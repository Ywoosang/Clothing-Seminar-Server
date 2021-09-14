const express = require('express');
const router = express.Router();
const { authenticateTokenInUrl }= require('../../middleware/auth.js');
const controller = require('./media.ctrl.js');

// 댓글 작성
router.get('/:video',authenticateTokenInUrl,controller.videoStream);

module.exports = router; 