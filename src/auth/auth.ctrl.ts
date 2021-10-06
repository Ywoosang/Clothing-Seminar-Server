import bcrypt from 'bcrypt';
import * as express from 'express';
import { authenticateToken, generateAccessToken } from '../middleware/auth.middleware';
import * as database from '../models/auth.model';
import Controller from '../interfaces/controller.interface';


class AuthController implements Controller {
    public path = '/auth';
    public router = express.Router();
    private invalidForms: string[] = [];

    constructor() {
        this.initializeRoutes();
    }

    public initializeRoutes() {
        this.router.post(`${this.path}/login`, this.login);
        this.router.get(`${this.path}/logout`, authenticateToken, this.logout);
    }

    private calcInputFormByte = (string: string): number => {
        const stringLength: number = string.length;
        let stringByteLength: number = 0;
        for (var i = 0; i < stringLength; i++) {
            if (escape(string.charAt(i)).length >= 4)
                stringByteLength += 3;
            else if (escape(string.charAt(i)) == "%A7")
                stringByteLength += 3;
            else
                if (escape(string.charAt(i)) != "%0D")
                    stringByteLength++;
        }
        return stringByteLength;
    };

    private isFormValidate = (userId: string, password: string): boolean => {

        if (this.calcInputFormByte(userId) > 14) {
            this.invalidForms.push('아이디')
        }
        if (this.calcInputFormByte(password) > 199) {
            this.invalidForms.push('비밀번호')
        }
        return this.invalidForms.length == 0;
    };

    private generateErrorMessage = (): string => {
        const message = `입력하신 ${this.invalidForms.join(" ")}가 너무 깁니다`;
        this.setInvalidForms();
        return message;
    };

    private setInvalidForms = (): void => {
        this.invalidForms = [];
    }

    private login = async (req, res, next) => {
        // JSON 웹 토큰 생성 
        // 사용자 이름이 올바르게 인증되었다고 가정하고 전달
        try {
            const { userId, password } = req.body;
            if (!password || !userId) return res.status(400).json({ message: "아이디와 비밀번호를 모두 입력해 주세요" });
            if (!this.isFormValidate(userId, password)) return res.status(400).json({
                message: this.generateErrorMessage()
            });
            // 사용자 아이디 기반으로 찾기
            const user = await database.getUserInfoByUserId(userId)
            //  해당 아이디의 사용자가 존재하지 않다면
            if (!user) return res.status(400).json({
                message: '해당 아이디의 관리자가 존재하지 않습니다'
            });
            // 패스워드가 일치하는지 확인
            let correctPassword: boolean;
            if (user.authority === 'ADMINISTER' || user.authority == 'ROOT') {
                correctPassword = user.password == password;
            } else {
                correctPassword = await bcrypt.compare(req.body.password, password);
            }
            // 401 인증 실패
            if (!correctPassword) return res.status(401).json({
                message: '비밀번호가 일치하지 않습니다.'
            });
            const payload = JSON.parse(JSON.stringify(user));
            const accessToken = generateAccessToken(payload);
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





