import * as express from 'express';
import * as database from '../models/post.model';
import Controller from '../interfaces/controller.interface';
import upload from '../middleware/upload';
import  {authenticateToken,authenticateTokenInUrl} from '../middleware/auth';
import * as iconvLite from 'iconv-lite'; 
import * as dotenv from 'dotenv';
dotenv.config();

class PostController implements Controller {
    public path = '/post';
    public router = express.Router();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // router.get('/:id/view', authenticateTokenInUrl,this.viewPost);
        // 특정 포스트 
        this.router.get(`${this.path}/:id`, authenticateToken, this.getPost);
        // 논문 게시
        this.router.post(`${this.path}/`, authenticateToken, upload.single('file'),this.uploadPost);
        // 논문 삭제
        this.router.delete(`${this.path}/:id`, authenticateToken, this.deletePost);
    }

    private getPost = async (req, res, next) => {
        try {
            // Post 와 File 
            const id = req.params.id;
            if (isNaN(id)) return res.sendStatus(400);
            const post = await database.getPostById(id);
            if (!post) return res.status(404).json({ "message": "post not exist" })
            await database.updateViews(id, req.user.id);
            res.status(200).json({ post: post[0] });
        } catch (error) {
            next(error);
        };
    }

    private uploadPostImage = async (req, res, next) => {
        const file = req.file;
        return;
    }

    private uploadPost = async(req, res, next) => {
        const [file, title, content, category] = [req.file, req.body.title, req.body.content, req.body.category];
        // 타이틀이 주어지지 않은 경우 
        if (!file || !title || !content || !category) return res.sendStatus(400);
        try {
            const ownerId = req.user.id;
            // 포스트 아이디를 가져오기 위해
            const postId = await database.uploadPost(title, content, ownerId, category);
            // await connection.query(`
            //     INSERT INTO File (filename, mimetype, url, owner_id, post_id,awsKey)
            //     VALUES('${path.basename(file.originalname)}',                
            //     '${file.mimetype}','${file.location}','${userId}','${post.insertId}','${file.key}');
            // `);
            // connection.commit();
            // 로깅 구현 필요
            // connection.release();
            res.json({ postId });
        } catch (error) {
            next(error);
        }
    };

    private deletePost = async(req, res, next) => {
        try {
            const postId = req.params.id;
            // 게시글 번호가 없는 경우
            if (!postId) return res.sendStatus(403);
            // 게시글 번호로 소유자 찾기
            const ownerId = database.getPostOwnerByPostId(postId);
            const hasAuthority = req.user.id == ownerId || req.user.authority == "ADMINISTRATOR";
            // 권한이 없다면 403 forbidden
            if (!hasAuthority) return res.sendStatus(403);
            // 포스트 삭제
            await database.deletePostByPostId(postId);
            return res.sendStatus(200);
        } catch (error) {
            next(error);
        }
    }


    // export const viewPost = async (req, res, next) => {
    //     const pool = await promisePool;
    //     const connection = await pool.getConnection(async conn => conn);
    //     try {
    //         const postId = req.params.id;
    //         const [file] = await connection.query(`
    //             SELECT id,owner_id as ownerId,awsKey,filename
    //             FROM File 
    //             WHERE post_id = ${postId};
    //         `);
    //         const { filename, awsKey } = file[0];
    //         // 버킷의 데이터를 읽어온다. 
    //         // Key 는 s3 업로드 파일 명(확장자 포함) 의미
    //         AWS.config.update({iconvLite_ACCESS_KEY_ID,
    //             secretAccessKey: process.env.AWS_SECRET_KEY_ID,
    //             region: 'ap-northeast-2',
    //         });
    //         const s3 = new AWS.S3();
    //         const f = s3.getObject({
    //             // 업로드할 s3 버킷
    //             Bucket: 'ywoosang-s3',
    //             Key: awsKey
    //             // stream 으로 제공
    //         }).createReadStream();
    //         const getPreviewFilename = (req, filename) => {
    //             const header = req.headers['user-agent'];
    //             if (header.includes("MSIE") || header.includes("Trident")) {
    //                 return encodeURIComponent(filename).replace(/\\+/gi, "%20");
    //             } else if (header.includes("Chrome")) {
    //                 return iconvLite.decode(iconvLite.encode(filename, "UTF-8"), 'ISO-8859-1');
    //             } else if (header.includes("Opera")) {
    //                 return iconvLite.decode(iconvLite.encode(filename, "UTF-8"), 'ISO-8859-1');
    //             } else if (header.includes("Firefox")) {
    //                 return iconvLite.decode(iconvLite.encode(filename, "UTF-8"), 'ISO-8859-1');
    //             }
    //             return filename;
    //         }

    //         res.setHeader('Content-Type', 'application/pdf');
    //         res.setHeader('Content-Disposition', `inline; filename=${getPreviewFilename(req, filename)}`);

    //         f.pipe(res); 

    //     } catch (err) {
    //         next(err);
    //     }
    // };

}

export default PostController;