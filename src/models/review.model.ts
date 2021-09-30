import connection from '../db/connection';
import { Review } from '../review/review.interface'; 
 

export async function getAllReviews(): Promise<Review[]>{
    const [rows]: any = await connection.promise().query(`
    SELECT id,name,content,created_at
    FROM Review; 
    `); 
    return rows;
}

export async function getReviewPassword(reviewId: number): Promise<number>{
    const [rows]: any = await connection.promise().query(`
    SELECT password
    FROM Review
    WHERE id = '${reviewId}';
    `);
    return rows[0].password;
};

export async function postReview(name:string,content:string,password:number): Promise<number>{
    const [review]: any  = await connection.promise().query(`
    INSERT INTO Review (name,content,password,created_at) 
    VALUES ('${name}','${content}','${password}',NOW());
    `);
    return review.insertId;
}

export async function deleteReview(reviewId: number): Promise<void>{
    await connection.promise().query(`
    Delete from Review 
    WHERE id = '${reviewId}';
    `);
}

