const AWS = require('aws-sdk');
const path = require('path');
const promisePool = require('../../database/connection.js');
const iconvLite = require('iconv-lite');
require('dotenv').config();


const getNumberOfPages = async(req,res,next) => {
    const pool = await promisePool;
    const connection = await pool.getConnection(async conn => conn);
    try { 
        const category = req.params.category; 
        // 올바른 카테고리가 들어왔는지 검사
        const [rows] = await connection.query(`
            SELECT COUNT(*) as count
            FROM Post 
            WHERE Category='${category}';
        `);
        // 한 페이지에 13 개씩 렌더링
        connection.release(); 
        const numberOfPosts = rows[0].count; 
        const tmp = numberOfPosts/13;
        let numberOfPages = tmp !== parseInt(tmp) ? parseInt(tmp) + 1 : parseInt(tmp);
        numberOfPages = numberOfPages || 1;
        res.status(200).json({ numberOfPages })
    } catch(error) {
        connection.release(); 
        next(error); 
    }
}

const getCurrentPagePosts = async (req, res,next) => {
    const pool = await promisePool;
    const connection = await pool.getConnection(async conn => conn);
    try {
        // 현재 분과
        const category = req.params.category;
        // 페이지 번호
        const pageNumber = req.params.page;
        // 전체 페이지
        const [rows] = await connection.query(`
            SELECT P.title,P.id,P.created_at, U.username, F.filename, 
            F.id as fileId,P.category
            FROM Post P 
            LEFT JOIN User U ON U.id = P.user_id
            LEFT JOIN File F ON F.post_id = P.id
            WHERE P.category = '${category}'
            ORDER BY created_at ASC;
        `);
        // 1 = 0 *13 - 1 * 13
        // 2 = 1*13 - 2*13
       const startIndex = (pageNumber - 1) * 13;
       const endIndex = pageNumber * 13; 
       const posts = rows.slice(startIndex,endIndex); 
        connection.release();
        res.json({ posts });
    } catch (error) {
        // 쿼리에서 오류 발생 시
        connection.release(); 
        console.log('Query Error');
        next(error);
    }
};

const getPost = async(req,res,next)=>{
    const pool = await promisePool; 
    const connection = await pool.getConnection(async conn => conn);
    try{
        // Post 와 File 
        const id = req.params.id;
        if(isNaN(id)) return res.sendStatus(400);
        const [post] = await connection.query(`
            SELECT P.title,P.content,P.created_at,P.updated_at,P.views,
            U.username,U.userid,
            F.id AS fileid,F.filename 
            FROM Post P 
            LEFT OUTER JOIN File F ON F.post_id = P.id 
            LEFT JOIN User U ON P.user_id = U.id
            WHERE P.id = ${id};
        `);
        if(post.length == 0) return res.status(404).json({"message": "post not exist"})
        await connection.query(`
        UPDATE Post 
        SET views = views + 1 
        WHERE id = ${id} AND user_id <> ${req.user.id};
        `); 
        connection.release(); 
        res.status(200).json({post: post[0]}); 
    }catch(error){
        console.log(error)
        connection.rollback(); 
        connection.release(); 
        next(error);
    }; 
}

const uploadPost = async (req, res, next) => {
    const [file, title, content,category] = [req.file, req.body.title, req.body.content,req.body.category];
    // 타이틀이 주어지지 않은 경우 
    if(!req.body.title || !req.body.content) return res.sendStatus(400); 
    try {
        const pool = await promisePool; 
        const connection = await pool.getConnection(async conn => conn);
        // 파일 첨부 시 
        const userId = req.user.id;
        // 포스트 아이디를 가져오기 위해
        let postId;
        if (file) {
            const [post] = await connection.query(`
                INSERT INTO Post (title,content,created_at,updated_at,user_id,category) 
                VALUES ('${title}','${content}',NOW(),NOW(),'${userId}','${category}');
            `);
            postId = post.insertId;
            await connection.query(`
                INSERT INTO File (filename, mimetype, url, owner_id, post_id,awsKey)
                VALUES('${path.basename(file.originalname)}',                
                '${file.mimetype}','${file.location}','${userId}','${post.insertId}','${file.key}');
            `);
            connection.commit();
            // 로깅 구현 필요
            connection.release();
        } else {
           throw new Error('file not specified');
        }
        res.json({ postId }); 
    } catch (error) {
        console.log(error);
        next(error);
    }
};

const viewPost = async(req,res,next) => {
    const pool = await promisePool;
    const connection = await pool.getConnection(async conn => conn); 
    try{
        const postId = req.params.id;
        const [ file ]= await connection.query(`
            SELECT id,owner_id as ownerId,awsKey,filename
            FROM File 
            WHERE post_id = ${postId};
        `);
        const {filename,awsKey } = file[0]; 
        // 버킷의 데이터를 읽어온다. 
        // Key 는 s3 업로드 파일 명(확장자 포함) 의미
        AWS.config.update({
            apiVersion: "2010-12-01",
            accessKeyId : process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey:process.env.AWS_SECRET_KEY_ID,
            region: 'ap-northeast-2',
        });
        const s3 = new AWS.S3();  
        const f = s3.getObject({
            // 업로드할 s3 버킷
            Bucket : 'ywoosang-s3',
            Key: awsKey 
        // stream 으로 제공
        }).createReadStream(); 
        const getPreviewFilename = (req, filename) => {
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

        res.setHeader('Content-Type','application/pdf');
        res.setHeader('Content-Disposition',`inline; filename=${getPreviewFilename(req,filename)}`);

        f.pipe(res);

    } catch (err){
        next(err); 
    }
}; 

const deletePost = async(req,res,next) =>{
    const pool = await promisePool;
    const connection = await pool.getConnection(async conn => conn);  
    try{
        const postId = req.params.id;
        // 게시글 번호로 소유자 찾기
        const [ post ] = await connection.query(`
        SELECT user_id as ownerId 
        FROM Post 
        WHERE id = ${postId};
        `);
        const ownerId = post[0].ownerId;
        const hasAuthority = req.user.id == ownerId || req.user.authority == "ADMINISTRATOR";
        // 권한이 없다면 403 forbidden
        if(!hasAuthority) return res.sendStatus(403);
        // 포스트 삭제
        await connection.query(`
        DELETE FROM Post
        WHERE id = ${postId}`);
        connection.release();
        return res.sendStatus(200);
    } catch(error){
        connection.rollback();
        connection.release();
        next(error);
    }

}

module.exports = {
    getPost,
    uploadPost,
    viewPost,
    deletePost,
    getCurrentPagePosts,
    getNumberOfPages
}

