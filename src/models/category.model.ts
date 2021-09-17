import connection from '../db/connection'; 

export async function getCategoryTotalPostsNumber(category: string) {
    const [rows] = await connection.promise().query(`
        SELECT COUNT(*) as count
        FROM Post 
        WHERE Category='${category}';
        `);
    return rows[0].count;
};

export async function getPagePosts(category: string, startIndex: number) {
    const [rows] = await connection.promise().query(`
        SELECT P.title,P.id,P.created_at, U.username, F.filename, 
        F.id as fileId,P.category
        FROM Post P 
        LEFT JOIN User U ON U.id = P.owner_id
        LEFT JOIN File F ON F.post_id = P.id
        WHERE P.category = '${category}'
        ORDER BY created_at ASC 
        LIMIT ${0},13;
        `);
    return rows;
};