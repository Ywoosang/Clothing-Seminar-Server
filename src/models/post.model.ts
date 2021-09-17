import connection from '../db/connection';

export async function getCategoryTotalPostsNumber(category: string) {
    const [rows] = await connection.promise().query(`
        SELECT COUNT(*) as count
        FROM Post 
        WHERE Category='${category}';
        `);
    return rows[0].count;
}

export async function getPagePosts(category: string, startIndex: number) {
    const [rows] = await connection.promise().query(`
        SELECT P.title,P.id,P.created_at, U.username, F.filename, 
        F.id as fileId,P.category
        FROM Post P 
        LEFT JOIN User U ON U.id = P.user_id
        LEFT JOIN File F ON F.post_id = P.id
        WHERE P.category = '${category}'
        ORDER BY created_at ASC;
        LIMIT ${startIndex}, 13;
        `);
    return rows;
}

export async function getPostById(id: number) {
    const [post] = await connection.promise().query(`
        SELECT P.title,P.content,P.created_at,P.updated_at,P.views,
            U.username,U.userid,
            F.id AS fileid,F.filename 
            FROM Post P 
            LEFT OUTER JOIN File F ON F.post_id = P.id 
            LEFT JOIN User U ON P.user_id = U.id
            WHERE P.id = ${id};
        `);
    return post;
}

export async function updateViews(id: number, userid: number) {
    await connection.promise().query(`
        UPDATE Post 
        SET views = views + 1 
        WHERE id = ${id} AND user_id <> ${userid};
        `);
}

// 포스트 타이틀, 컨텐트
export async function uploadPost(title: string, content: string, ownerId: number, category: string) {
    const [post] = await connection.promise().query(`
    INSERT INTO Post (title,content,created_at,updated_at,user_id,category) 
    VALUES ('${title}','${content}',NOW(),NOW(),'${ownerId}','${category}');
    `);
    return post[0].insertId;
}

// pdf 업로드
export async function uploadPdf() {

}

// 이미지 업로드
export async function uploadImage() {

}

export async function getPostOwnerByPostId(postId: number) {
    const [post] = await connection.promise().query(`
    SELECT user_id as ownerId
    FROM Post
    WHERE id = ${postId};
    `);
    return post[0].ownerId;
}

export async function deletePostByPostId(postId: number) {
    await connection.promise().query(`
    DELETE FROM Post
    WHERE id = ${postId}`);
}
