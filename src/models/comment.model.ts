import connection from '../db/connection';


export async function registerComment(content:string,ownerId:string,postId:number){
    await connection.promise().query(`
    INSERT INTO Comment (content,created_at,owner_id,post_id) 
    VALUES ('${content}',NOW(),'${ownerId}','${postId}');
    `);
}

export async function getCommentsByPostId(postId:number) {
    const [comments] = await connection.promise().query(`
    SELECT C.id, C.content, C.created_at, C.owner_id as userId, U.username 
    FROM Comment C JOIN User U 
    ON U.id = C.owner_id
    WHERE post_id = ${postId};
    `);
    return comments; 
}

export async function deleteCommentByAdminRole(commentId:number){
    await connection.promise().query(`
    DELETE FROM Comment
    WHERE id=${commentId};
 `);
} 

export async function deleteCommentByOwnerRole(ownerId:number,commentId:number){
    await connection.promise().query(`
    DELETE FROM Comment
    WHERE owner_id=${ownerId} 
    AND id=${commentId};
    `);
}