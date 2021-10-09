import * as express from 'express';
import Controller from '../interfaces/controller.interface';
import { authenticateToken } from '../middleware/auth.middleware';

class AdminController implements Controller {
    public path = '/admin';
    public router = express.Router();
    private database: any;

    constructor(database: any) {
        this.database = database;
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(this.path, authenticateToken, this.getUsers);
    }

    private getUsers = async (req, res, next) => {
        try {
            if (req.user.authority == 'ADMINISTRATOR') {
                const users = await this.database.getAllUsers();
                // 200 ok
                res.json({ users: users });
            } else {
                res.sendStatus(403);
            }
        } catch (error) {
            next(error);
        }
    }
}

export default AdminController; 
