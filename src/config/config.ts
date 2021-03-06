import * as dotenv from 'dotenv';
dotenv.config(); 

export default {
    development : {
        host: process.env.DATABASE_HOST || "localhost",
        user: "root",
        port:3306,
        password: "db11",
        database: "ClothingDB",
        connectionLimit: 5000,
        dateStrings: "date",
    },
    production : {
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        port: process.env.MYSQL_PORT,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        connectionLimit: 5000,
        dateStrings: "date",
    }
} as any;

 