import * as express from 'express';
import * as database from '../models/post.model';
import Controller from '../interfaces/controller.interface';
import upload from '../middleware/upload.middleware';
import { authenticateToken } from '../middleware/auth.middleware';
import * as iconvLite from 'iconv-lite';
import * as dotenv from 'dotenv';
import AWS from '../config/aws';
dotenv.config();

class PostController implements Controller {
    public path = '/post';
    public router = express.Router();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // 논문 Pdf 조회 
        this.router.get(`${this.path}/:id/view`, this.viewPost);
        // 논문 조회
        this.router.get(`${this.path}/:id`, this.getPost);
        // 논문 게시
        this.router.post(`${this.path}/`, authenticateToken, this.uploadPost);
        // 논문 이미지 업로드 
        this.router.post(`${this.path}/image`, authenticateToken, upload.single('file'), this.uploadPostImage);
        // 논문 PDF 파일 업로드
        this.router.post(`${this.path}/pdf`, authenticateToken, upload.single('file'), this.uploadPostPdf);
        // 논문 삭제
        this.router.delete(`${this.path}/:id`, authenticateToken, this.deletePost);
    }

    private getPost = async (req, res, next) => {
        try {
            // Post 와 File 
            const postId:number = req.params.id;
            if (isNaN(postId)) return res.sendStatus(400);
            const post = await database.getPostById(postId);
            if (!post) return res.status(404).json({ "message": "post not exist" })
            await database.updateViews(postId);
            res.status(200).json({ post });
        } catch (error) {
            next(error);
        };
    }

    private uploadPostImage = async (req, res, next) => {
        const file = req.file;
        if (!file) return res.status(400).json({ message: 'invalid image request' })
        console.log(req.file.location);
        return res.json({
            url: req.file.location
        });
    };

    private uploadPostPdf = async (req, res, next) => {
        const file = req.file;
        const postId = req.body.postId;
        if (!file || !postId) return res.status(400).json({ message: 'invalid image request' });
        try {
            console.log(file.originalname, file.key);
            if (file){
               await database.uploadPdf(file.originalname, file.location, req.user.id, postId, file.key);
            }
            res.sendStatus(200);
        } catch (error) {
            next(error);
        }
    };

    private uploadPost = async (req, res, next) => {
        const { title, content, category, copyrightHolder } = req.body;
        // 타이틀이 주어지지 않은 경우 
        try {
            if (!title ||  !category || !copyrightHolder) return res.status(400).json({ message: '제목 작성자 카테고리 내용을 모두 입력해 주세요' });
            if (req.user.authority == 'ADMINISTER' || req.user.authority == "ROOT") {
                const postId = await database.uploadPost(req.user.id, copyrightHolder, title, content, category);
                res.json({ postId });
            }
        } catch (error) {
            next(error);
        }
    };

    private deletePost = async (req, res, next) => {
        try {
            const postId = req.params.id;
            // 게시글 번호가 없는 경우
            if (!postId) return res.sendStatus(403);
            // 게시글 번호로 소유자 찾기
            const hasAuthority =  req.user.authority == "ROOT" || req.user.authority == "ADMINISTER";
            // 권한이 없다면 403 forbidden
            if (!hasAuthority) return res.sendStatus(403);
            // 포스트 삭제
            await database.deletePostByPostId(postId);
            return res.sendStatus(200);
        } catch (error) {
            next(error);
        }
    }

    private getPreviewFilename = (req, filename) => {
        const header = req.headers['user-agent'];
        if (header.includes("MSIE") || header.includes("Trident")) {
            return encodeURIComponent(filename).replace(/\\+/gi, "%20");
        } else if (header.includes("Chrome")) {
            return iconvLite.decode(iconvLite.encode(filename, "UTF-8"), 'ISO-8859-1');
        } else if (header.includes("Opera")) {
            return iconvLite.decode(iconvLite.encode(filename, "UTF-8"), 'ISO-8859-1');
        } else if (header.includes("Firefox")) {
            return iconvLite.decode(iconvLite.encode(filename, "UTF-8"), 'ISO-8859-1');
        }
        return filename;
    }

    private viewPost = async (req, res, next) => {
        try {
            const postId = req.params.id;
            const file = await database.getPdf(postId);
            console.log(file);
            const { filename, awsKey } = file;
            // 버킷의 데이터를 읽어온다. 
            // Key 는 s3 업로드 파일 명(확장자 포함) 의미
            if (!filename || !awsKey) return res.status(400).json({
                message: '오류가 있는 논문입니다'
            })
            const s3 = new AWS.S3();
            const f = s3.getObject({
                // 업로드할 s3 버킷
                Bucket: 'ywoosang-s3',
                Key: awsKey
                // stream 으로 제공
            }).createReadStream();
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `inline; filename=${this.getPreviewFilename(req, filename)}`);
            f.pipe(res);

        } catch (err) {
            next(err);
        }
    };

}

export default PostController;