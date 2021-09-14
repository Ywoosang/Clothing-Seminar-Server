const promisePool = require('../../database/connection.js'); 

const writeComment = async(req,res,next)=>{
    const pool = await promisePool; 
    const connection = await pool.getConnection(async conn => conn);
    try{
        const content = req.body.comment;
        const userId = req.user.id;
        const postId = req.params.postId; 
        await connection.query(`
        INSERT INTO Comment (content,created_at,user_id,post_id) 
        VALUES ('${content}',NOW(),'${userId}','${postId}');
        `); 
        connection.release();
        res.sendStatus(200);
    }catch(error){
        console.log(error);
        connection.release();
        next(error);
    }
}

const getComments = async(req,res,next)=>{
    const pool = await promisePool; 
    const connection = await pool.getConnection(async conn => conn);
    try{
        const postId = req.params.postId; 
        if(!postId) return res.sendStatus(403);
        // 관리자 권한을 허용하기 위해
        const currentUser = { 
            authority : req.user.authority,
            id : req.user.id
        };
        const [comments] = await connection.query(`
            SELECT C.id, C.content, C.created_at, C.user_id as userId, U.username 
            FROM Comment C JOIN User U 
            ON U.id = C.user_id
            WHERE post_id = ${postId};
        `);
        connection.release();
        // 관리자 라면 삭제 승인
        return res.json({ comments, currentUser }); 
    }catch(error){
        connection.release(); 
        next(error); 
    }
}; 

const deleteComment = async(req,res,next)=>{
    const pool = await promisePool; 
    const connection = await pool.getConnection(async conn => conn);
    const commentId = req.params.commentId;
    // 잘못된 요청
    if(!commentId) res.sendStatus(403);
    // 삭제 권한 있는지 확인 요망
    try{
        // 관리자 권한으로 삭제하는 경우
        if(req.user.authority == "ADMINISTRATOR"){
            await connection.query(`
                DELETE FROM Comment
                WHERE id=${commentId};
             `);
        } else {
            // 작성자가 직접 삭제하는 경우
            await connection.query(`
            DELETE FROM Comment
            WHERE user_id=${req.user.id} 
            AND id=${commentId};
            `); 
        }
        // 삭제 성공 시
        res.sendStatus(200);
    }catch(error){
        connection.release();
        next(error); 
    }
}; 

module.exports = {
    writeComment, 
    getComments,
    deleteComment,
}