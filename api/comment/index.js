const express = require('express');
const router = express.Router();
const { authenticateToken }= require('../../middleware/auth.js');
const controller = require('./comment.ctrl.js');

// 댓글 작성
router.post('/:postId', authenticateToken,controller.writeComment);

// 댓글 불러오기
router.get('/:postId',authenticateToken,controller.getComments); 

// 댓글 삭제 (본인 또는 관리자)
router.delete('/:commentId',authenticateToken,controller.deleteComment);

module.exports = router; 