import * as express from 'express';
import Controller from '../interfaces/controller.interface';
import { authenticateToken } from '../middleware/auth.middleware';

class CommentController implements Controller {
    public path = '/comment';
    public router = express.Router();
    private database: any;

    constructor(database: any) {
        this.database = database;
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // 댓글 불러오기
        this.router.get(`${this.path}/:postId`, this.getComments);
        // 댓글 작성
        this.router.post(`${this.path}/:postId`, this.postComment);
        // 관리자가 아닌 일반 사용자가 댓글 비밀번호로 댓글 삭제
        this.router.delete(`${this.path}/user/:commentId`, this.deleteCommentByPassword);
        // 관리자 역할로 댓글 삭제
        this.router.delete(`${this.path}/admin/:commentId`, authenticateToken, this.deleteCommentByAdmin);
    };
    private isNaN = (inputStr: string) => {
        const numericRepr = parseFloat(inputStr);
        return isNaN(numericRepr) || numericRepr.toString().length != inputStr.length;
    }

    private getComments = async (req, res, next) => {
        try {
            const postId: string = req.params.postId;
            if (!postId) return res.sendStatus(403);
            if(this.isNaN(postId)) return res.sendStatus(400); 
            // 관리자 권한을 허용하기 위해
            const comments = await this.database.getCommentsByPostId(postId)
            // 관리자 라면 삭제 승인
            return res.json({ comments });
        } catch (error) {
            next(error);
        }
    };

    private postComment = async (req, res, next) => {
        try {
            const { copyrightHolder, content, password } = req.body;
            const postId = req.params.postId;
            if (!copyrightHolder || !content || !password) return res.status(403).json({ message: '(*) 항목을 모두 입력해 주세요' })
            if(!postId) return res.sendStatus(403); 
            if(this.isNaN(password.toString()) || password.toString().length != 4) return res.sendStatus(400);
            await this.database.postComment(content, copyrightHolder, postId, password);
            res.sendStatus(200);
        } catch (error) {
            next(error);
        }
    };

    private deleteCommentByAdmin = async (req, res, next) => {
        const commentId = req.params.commentId;
        // 잘못된 요청
        if (!commentId) return res.sendStatus(403);
        if(this.isNaN(commentId)) return res.sendStatus(404);
        // 삭제 권한 있는지 확인 요망
        try {
            await this.database.deleteComment(commentId);
            return res.sendStatus(200);
        } catch (error) {
            next(error);
        }
    };

    private deleteCommentByPassword = async (req, res, next) => {
        const commentId = req.params.commentId;
        const clientPassword = req.body.password;
        // 잘못된 요청
        if (!commentId) return res.sendStatus(403);
        if(this.isNaN(commentId)) return res.sendStatus(404);
        try {
            const password = await this.database.getCommentPasswordByCommentId(commentId);
            if (password == clientPassword) {
                await this.database.deleteComment(commentId);
                return res.sendStatus(200);
            } else {
                return res.status(401).json({ message: '비밀번호가 올바르지 않습니다' })
            }
        } catch (error) {
            next(error);
        }
    };
}

export default CommentController;

