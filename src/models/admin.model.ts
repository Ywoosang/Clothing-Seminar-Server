import connection from '../db/connection';

export async function getAllUsers(){
    const [users] = await connection.promise().query(`
    SELECT username,userid,authority 
    FROM User 
    WHERE authority <> 'ADMINISTRATOR';
    `); 
    return users;
}

export async function getUserAuthority(userId:string){
    const [rows] = await connection.promise().query(`
    SELECT authority 
    FROM User 
    WHERE userid = '${userId}'
    `);
    return rows[0].authority; 
}

export async function changeUserAuthority(authority: string, userId:string){
    await connection.promise().query(`
    UPDATE User 
    SET authority = '${authority}' 
    WHERE userid = '${userId}';
    `);
}

