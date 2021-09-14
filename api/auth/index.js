const express = require('express');
const router = express.Router();
const controller = require('./auth.ctrl'); 
const { authenticateToken }= require('../../middleware/auth.js');

// 회원가입
router.post('/register',controller.registerUser);
// 로그인
router.post('/login',controller.login);
// 로그아웃
router.get('/logout',authenticateToken,controller.logout);
// 로그아웃 API 
router.post('/logout',authenticateToken,controller.logout);


module.exports = router;