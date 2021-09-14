const mysql = require("mysql2/promise");
const dbconfig = require('../config/config.js');
const dotenv = require('dotenv');
dotenv.config();


 
async function getPool() {
    let pool; 
    if (process.env.NODE_ENV == 'production') {
        pool = mysql.createPool(dbconfig.production);
    } else if (process.env.NODE_ENV == 'test') {
        pool = mysql.createPool(dbconfig.test);
        try{
        const connection = await pool.getConnection();
        await connection.query('DROP TABLE IF EXISTS Comment;');
        await connection.query('DROP TABLE IF EXISTS File;');
        await connection.query('DROP TABLE IF EXISTS Post;');
        await connection.query('DROP TABLE IF EXISTS Token;');
        await connection.query('DROP TABLE IF EXISTS Category;');
        await connection.query('DROP TABLE IF EXISTS User;');
        await connection.query(`
        CREATE TABLE User(
            id INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
            username VARCHAR(10) NOT NULL,
            userid VARCHAR(15) NOT NULL UNIQUE,
            email VARCHAR(30) NOT NULL UNIQUE,
            authority VARCHAR(15) NOT NULL DEFAULT 'MEMBER', 
            password VARCHAR(200) NOT NULL,
            PRIMARY KEY (id)
        );
        `);
        await connection.query(`
        CREATE TABLE Token(
            refresh_token VARCHAR(200) NOT NULL, 
            user_id INT(11) UNSIGNED NOT NULL,
            FOREIGN KEY (user_id) REFERENCES User(id) ON DELETE CASCADE,
            PRIMARY KEY(refresh_token)
        );
        `);
        await connection.query(`
        CREATE TABLE Category(
            title VARCHAR(50) NOT NULL,
            PRIMARY KEY(title)
        );
        `);
        await connection.query(`
        CREATE TABLE Post(
            id INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
            title VARCHAR(30) NOT NULL,
            content TEXT NOT NULL,
            created_at DATETIME NOT NULL,
            updated_at DATETIME NULL,
            user_id INT(11) UNSIGNED NOT NULL,
            category VARCHAR(50) NOT NULL,
            FOREIGN KEY (user_id) REFERENCES User(id) ON DELETE CASCADE,
            FOREIGN KEY (category) REFERENCES Category(title) ON DELETE CASCADE,
            PRIMARY KEY(id)
        );
        `);
        await connection.query(`
        CREATE TABLE File(
            id INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
            filename VARCHAR(100) NOT NULL,
            mimetype VARCHAR(20) NOT NULL,
            url VARCHAR(300) NOT NULL,
            owner_id INT(11) UNSIGNED NOT NULL,
            post_id INT(11) UNSIGNED NOT NULL, 
            awsKey VARCHAR(150) NOT NULL,
            FOREIGN KEY(owner_id) REFERENCES User(id) ON DELETE CASCADE,
            FOREIGN KEY(post_id) REFERENCES Post(id) ON DELETE CASCADE,
            PRIMARY KEY(id) 
        );
        `);
        await connection.query(`
        CREATE TABLE Comment(
            id INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
            content TEXT NOT NULL,
            created_at DATETIME NOT NULL,
            user_id INT(11) UNSIGNED NOT NULL,
            post_id INT(11) UNSIGNED NOT NULL,
            FOREIGN KEY (user_id) REFERENCES User(id) ON DELETE CASCADE,
            FOREIGN KEY (post_id) REFERENCES Post(id) ON DELETE CASCADE,
            PRIMARY KEY(id)
        );
        `);
        await connection.query(`
        INSERT INTO User (username,userid,email,authority,password) VALUES ('관리자0','admin0','admin0@gmail.com','ADMINISTRATOR',123);
        `);
        await connection.query(`
        INSERT INTO Category (title) VALUES ('복식사');
        `);
        await connection.query(`
        INSERT INTO Category (title) VALUES ('복식미학 · 패션디자인');
        `);
        await connection.query(`
        INSERT INTO Category (title) VALUES ('패션마케팅 · 심리');
        `);
        await connection.query(`
        INSERT INTO Category (title) VALUES ('복식일반 의복구성 · 텍스타일');
        `);
        connection.commit();
        connection.release();
        } catch(error){
            console.log(error); 
            connection.rollback();
            connection.release();
        }
    } else if (process.env.NODE_ENV == 'development') {
        pool = mysql.createPool(dbconfig.dev);
    } else {
        console.error('connection error');
    }
    return pool;
}

module.exports = (async function(){
    const pool = await getPool();
    return pool;
})();
// module.exports = pool;