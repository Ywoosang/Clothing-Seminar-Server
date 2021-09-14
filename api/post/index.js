const express = require('express');
const router = express.Router();
const {authenticateToken,authenticateTokenInUrl} = require('../../middleware/auth.js');
const upload = require('../../middleware/upload.js');
const controller = require('./post.ctrl.js'); 

// 논문 pdf 뷰어
router.get('/:id/view',authenticateTokenInUrl,controller.viewPost);

// 카테고리내 특정 페이지의 포스트 
router.get('/:category/:page',authenticateToken,controller.getCurrentPagePosts);

// 카테고리 내 페이지 수
router.get('/:category/count',authenticateToken,controller.getNumberOfPages)

// 특정 포스트 
router.get('/:id',authenticateToken,controller.getPost); 

// 논문 게시
router.post('/',authenticateToken,upload.single('file'),controller.uploadPost); 

// 논문 삭제
router.delete('/:id',authenticateToken,controller.deletePost);

module.exports = router;
