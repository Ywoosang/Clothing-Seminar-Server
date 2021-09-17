import * as express from 'express';
import * as database from '../models/comment.model';
import Controller from '../interfaces/controller.interface';
import  {authenticateToken } from '../middleware/auth';

class CommentController implements Controller {
    public path = '/comment';
    public router = express.Router();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // 댓글 작성
        this.router.post(`${this.path}/:postId`, authenticateToken, this.writeComment);
        // 댓글 불러오기
        this.router.get(`${this.path}/:postId`, authenticateToken, this.getComments);
        // 댓글 삭제 (본인 또는 관리자)
        this.router.delete(`${this.path}/:commentId`, authenticateToken, this.deleteComment);
    }

    private writeComment = async (req, res, next) => {
        try {
            const content = req.body.comment;
            const ownerId = req.user.id;
            const postId = req.params.postId;
            await database.registerComment(content, ownerId, postId);
            res.sendStatus(200);
        } catch (error) {
            next(error);
        }
    }
    
    private getComments = async (req, res, next) => {
        try {
            const postId = req.params.postId;
            if (!postId) return res.sendStatus(403);
            // 관리자 권한을 허용하기 위해
            const comments = await database.getCommentsByPostId(postId)
            // 관리자 라면 삭제 승인
            return res.json({ comments });
        } catch (error) {
            next(error);
        }
    };

    private deleteComment = async (req, res, next) => {
        const commentId = req.params.commentId;
        // 잘못된 요청
        if (!commentId) res.sendStatus(403);
        // 삭제 권한 있는지 확인 요망
        try {
            // 관리자 권한으로 삭제하는 경우
            if (req.user.authority == "ADMINISTRATOR") {
                await database.deleteCommentByAdminRole(commentId);
            } else {
                // 작성자가 직접 삭제하는 경우
                await database.deleteCommentByOwnerRole(req.user.id, commentId);
            }
            // 삭제 성공 시
            res.sendStatus(200);
        } catch (error) {
            next(error);
        }
    };
}

export default CommentController;
 
