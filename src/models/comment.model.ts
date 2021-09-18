import connection from '../db/connection';


export async function registerComment(content: string, copyrightHolder: string, postId: number, password: number) {
    await connection.promise().query(`
    INSERT INTO Comment (content,created_at,copyright_holder,post_id,password) 
    VALUES ('${content}',NOW(),'${copyrightHolder}','${postId}','${password}');
    `);
}

export async function getCommentsByPostId(postId: number) {
    const [comments] = await connection.promise().query(`
    SELECT C.id, C.content, C.created_at,
    C.copyright_holder as username, C.password
    FROM Comment C
    WHERE post_id = ${postId};
    `);
    return comments;
}

export async function getCommentPasswordByCommentId(commentId: number) {
    const [rows] = await connection.promise().query(`
    SELECT password
    FROM Comment
    WHERE id = ${commentId};
    `);
    return rows[0].password;
}

export async function deleteComment(commentId: number) {
    await connection.promise().query(`
    DELETE FROM Comment
    WHERE id=${commentId};
 `);
}