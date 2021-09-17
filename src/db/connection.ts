import * as mysql from 'mysql2';
import { Pool } from 'mysql2'; 
import dbconfig from '../config/config';
import * as dotenv from 'dotenv';
dotenv.config();

// 커넥션 풀
 
let pool: Pool;
switch (process.env.NODE_ENV) {
    case 'production':
        pool = mysql.createPool(dbconfig.production);
        break;
    case 'test':
        pool = mysql.createPool(dbconfig.test);
        break;
    case 'development':
        pool = mysql.createPool(dbconfig.development);
}
// db 연결 
 
export default  pool;














