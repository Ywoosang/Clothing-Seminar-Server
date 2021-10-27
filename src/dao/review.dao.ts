import connection from '../db/connection';
import { Review } from '../review/review.interface';

class ReviewDao {
    public static async getAllReviews(): Promise<Review[]> {
        const [rows]: any = await connection.promise().query(`
            SELECT id,name,content,created_at
            FROM Review 
            ORDER BY created_at DESC; 
        `);
        return rows;
    };

    public static async getReviewPassword(reviewId: number): Promise<number> {
        const [rows]: any = await connection.promise().query(`
            SELECT password
            FROM Review
            WHERE id = '${reviewId}';
        `);
        return rows[0].password;
    };
    public static async postReview(name: string, content: string, password: number): Promise<number> {
        const [review]: any = await connection.promise().query(`
            INSERT INTO Review (name,content,password,created_at) 
            VALUES ('${name}','${content}','${password}',NOW());
        `);
        return review.insertId;
    };

    public static async deleteReview(reviewId: number): Promise<void> {
        await connection.promise().query(`
            Delete from Review 
            WHERE id = '${reviewId}';
        `);
    };
}

export default ReviewDao;

