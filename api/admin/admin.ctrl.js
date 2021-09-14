const promisePool = require('../../database/connection.js');

const getUsers = async (req, res, next) => {
    const pool = await promisePool; 
    const connection = await pool.getConnection(async conn => conn);
    try {
        if(req.user.authority=='ADMINISTRATOR'){
            const [users] = await connection.query(`
            SELECT username,userid,authority 
            FROM User 
            WHERE authority <> 'ADMINISTRATOR';
            `); 
            connection.release(); 
            // 200 ok
            res.json({ users: users });
        } else {
            connection.release();  
            res.sendStatus(403);
        }
    } catch (error) {
        connection.release(); 
        console.log("query error");
        next(error);
    }
}

const updatePermissions = async(req,res,next)=>{
    const pool = await promisePool; 
    const connection = await pool.getConnection(async conn => conn);
    try {
        const authority = req.body.authority;
        const userId = req.body.userid;
        if(!authority || !userId ) {
            return res.sendStatus(400);  
        }; 
        const [userToChange] = await connection.query(`
            SELECT authority FROM User WHERE userid = '${userId}'
        `); 
        if(authority !== 'MEMBER' && authority !== 'POST_ALLOWED'){
            return res.status(403).json({
                errorMessage : '올바른 권한으로 변경해 주세요'
            }); 
        }; 
        if(!userToChange[0]) {
            return res.sendStatus(400); 
        };
        if(userToChange[0].authority === 'ADMINISTRATOR') {
            return res.status(403).json({
                errorMessage : '관리자의 권한은 변경할 수 없습니다'
            }); 
        }; 
        await connection.query(`
            UPDATE User 
            SET authority = '${authority}' 
            WHERE userid = '${userId}';
        `);
        connection.release();
        // 200 ok
        const message = `${userId} 님의 권한이 ${authority} 로 변경되었습니다`; 
        res.status(200).json({ message }); 
    } catch (error) {
        console.log(error);
        connection.release(); 
        next(error);
    }
}

module.exports = {
    getUsers,
    updatePermissions
}