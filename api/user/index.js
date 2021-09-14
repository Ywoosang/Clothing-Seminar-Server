const express = require('express');
const controller = require('./user.ctrl');  
const {authenticateToken} = require('../../middleware/auth.js');
const router = express.Router();

// 로그인중인 사용자 불러오기
router.get('/',authenticateToken,controller.getUserInfo);

module.exports = router;