import * as express from 'express';
import * as database from '../models/admin.model';
import Controller from '../interfaces/controller.interface';
import { authenticateToken } from '../middleware/auth';

class AdminController implements Controller {
    public path = '/admin';
    public router = express.Router();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // 사용자 불러오기
        this.router.get(this.path, authenticateToken, this.getUsers);
        // 권한 업데이트
        this.router.patch(this.path, authenticateToken, this.updatePermissions);
    }

    private getUsers = async (req, res, next) => {
        try {
            if (req.user.authority == 'ADMINISTRATOR') {
                const users = await database.getAllUsers();
                // 200 ok
                res.json({ users: users });
            } else {
                res.sendStatus(403);
            }
        } catch (error) {
            next(error);
        }
    }

    private updatePermissions = async (req, res, next) => {
        try {
            const authority = req.body.authority;
            const userId = req.body.userid;
            if (!authority || !userId) return res.sendStatus(400);
            if (req.user.authority !== 'ADMINISTRATOR') {
                return res.status(403).json({
                    errorMessage: '관리자만 권한을 변경할 수 있습니다'
                });
            }
            if (authority !== 'MEMBER' && authority !== 'POST_ALLOWED') {
                return res.status(403).json({
                    errorMessage: '올바른 권한으로 변경해 주세요'
                });
            };
            const userAuthority = await database.getUserAuthority(userId);
            if (userAuthority === 'ADMINISTRATOR') {
                return res.status(403).json({
                    errorMessage: '관리자의 권한은 변경할 수 없습니다'
                });
            };
            await database.changeUserAuthority(authority, userId);
            const message = `${userId} 님의 권한이 ${authority} 로 변경되었습니다`;
            res.status(200).json({ message });
        } catch (error) {
            next(error);
        }
    }
}

export default AdminController; 
