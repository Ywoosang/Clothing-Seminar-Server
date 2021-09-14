const express = require('express');
const controller = require('./admin.ctrl');  
const router = express.Router();
const { authenticateToken } = require('../../middleware/auth.js'); 
 
// 사용자 불러오기
router.get('/',authenticateToken ,controller.getUsers);
// 권한 업데이트
router.patch('/',authenticateToken,(req,res,next)=>{
    if(req.user.authority !== 'ADMINISTRATOR') {
        return res.sendStatus(403); 
    } else {
        next(); 
    }
},controller.updatePermissions);  

module.exports = router;