import connection from '../db/connection';

class AdminDao{
    public static async getAllUsers(){
        const [users] = await connection.promise().query(`
        SELECT username,userid,authority 
        FROM User 
        WHERE authority <> 'ADMINISTRATOR';
        `); 
        return users;
    }; 

    public static async getUserAuthority(userId:string){
        const [rows] = await connection.promise().query(`
        SELECT authority 
        FROM User 
        WHERE userid = '${userId}'
        `);
        return rows[0].authority; 
    };

    public static async changeUserAuthority(authority: string, userId:string){
        await connection.promise().query(`
        UPDATE User 
        SET authority = '${authority}' 
        WHERE userid = '${userId}';
        `);
    }; 

}

export default AdminDao;
