import bcrypt from 'bcrypt';
import * as express from 'express';
import { authenticateToken, generateAccessToken } from '../middleware/auth';
import * as database from '../models/auth.model';
import Controller from '../interfaces/controller.interface';


class AuthController implements Controller {
    public path = '/auth';
    public router = express.Router();

    constructor() {
        this.initializeRoutes();
    }

    public initializeRoutes() {
        this.router.post(`${this.path}/login`, this.login);
        this.router.get(`${this.path}/logout`, authenticateToken, this.logout);
    }

    private login = async (req, res, next) => {
        // JSON 웹 토큰 생성 
        // 사용자 이름이 올바르게 인증되었다고 가정하고 전달
        try {
            const { password, userId } = req.body;
            if (!password || !userId) return res.status(400).json({ message: "invalid form" })
            // 사용자 아이디 기반으로 찾기
            const user = await database.getUserInfoByUserId(userId)
            //  해당 아이디의 사용자가 존재하지 않다면
            if (!user) res.status(400).json({
                message: '사용자가 존재하지 않습니다'
            });
            // 패스워드가 일치하는지 확인
            let correctPassword: boolean;
            if (user.authority === 'ADMINISTRATOR') {
                correctPassword = req.body.password == password;
            } else {
                correctPassword = await bcrypt.compare(req.body.password, password);
            }
            // 401 인증 실패
            if (!correctPassword) return res.status(401).json({
                message: '비밀번호가 일치하지 않습니다.'
            });
            const payload = JSON.parse(JSON.stringify(user));
            const accessToken = generateAccessToken(payload);
            console.log(accessToken); 
            res.json({ accessToken });
        } catch (error) {
            next(error);
        }
    }

    private logout = (req, res, next) => {
        res.sendStatus(200);
    }
}

export default AuthController;





