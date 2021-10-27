import connection from '../database/connection';

class AuthDao{
    // 회원 등록
    public static async registerUser(username:string,userId:string,email:string,hash:string){
        await connection.promise().query(`
        INSERT INTO User (username,userid,email,password) 
        VALUES ('${username}','${userId}','${email}','${hash}');
        `);
    };
    
    // 회원 존재여부 확인 
    public static async getUserByUserId(userId: string){
        const [rows] = await connection.promise().query(`
        SELECT userid,email 
        FROM User 
        WHERE userid = '${userId}'
        `);
        return rows[0];
    };
    
    // 회원 정보 조회
    public static async getUserInfoByUserId(userId: string){
        const  [rows] = await connection.promise().query(`
        SELECT id,userid,username,email,password,authority
        FROM User 
        WHERE userid = '${userId}'
        `);
        return rows[0];
    };
}

export default AuthDao;
 






