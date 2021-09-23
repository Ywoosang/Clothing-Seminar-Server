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
        SELECT P.title,P.id,P.created_at, P.category, P.copyright_holder as username
        F.filename, F.id as fileId
        FROM Post P 
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
        P.copyright_holder as username,U.userid,
        F.id AS fileid,F.filename 
        FROM Post P 
        LEFT OUTER JOIN File F ON F.post_id = P.id 
        LEFT JOIN User U ON P.owner_id = U.id
        WHERE P.id = ${id};
        `);
    return post[0];
}

export async function updateViews(postId: number) {
    await connection.promise().query(`
        UPDATE Post 
        SET views = views + 1 
        WHERE id = ${postId};
        `);
}

// 포스트 타이틀, 컨텐트
export async function uploadPost(ownerId: number, copyrightHolder: string, title: string, content: string, category: string) {
    const [post]: any = await connection.promise().query(`
        INSERT INTO Post (title,copyright_holder,content,created_at,updated_at,owner_id,category) 
        VALUES ('${title}','${copyrightHolder}','${content}',NOW(),NOW(),'${ownerId}','${category}');
    `);
    return post.insertId;
}

// pdf 업로드
export async function uploadPdf(filename: string, url: string, ownerId: number, postId: number, awsKey: string) {
    await connection.promise().query(`
    INSERT INTO File (filename,url,owner_id,post_id,awsKey) 
    VALUES ('${filename}','${url}','${ownerId}','${postId}','${awsKey}');
    `);
}

// 논문 보기
export async function getPdf(postId: number) {
    const [file] = await connection.promise().query(`
    SELECT id,awsKey,filename
    FROM File 
    WHERE post_id = ${postId};
`);
    return file[0];
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
