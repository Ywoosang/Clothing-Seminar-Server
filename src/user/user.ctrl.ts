import * as express from 'express';
import Controller from '../interfaces/controller.interface';
import  {authenticateToken } from '../middleware/auth.middleware';

// 로그인중인 사용자 불러오기
class UserController implements Controller{
    public path = '/user';
    public router = express.Router();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes(){
        this.router.get(this.path,authenticateToken,this.getUserInfo);
    }

    private getUserInfo = (req, res) => {
        res.json({
            id: req.user.id,
            userId : req.user.userid,
            username: req.user.username,
            authority: req.user.authority 
        });
    }
}

export default UserController; 

 

