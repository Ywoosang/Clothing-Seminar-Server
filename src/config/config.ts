export default {
   test: {
        host: "localhost",
        user: "root",
        port:3306,
        password: "db11",
        database : "ClothingTestDB",
        connectionLimit: 5000,
    }, 
    development : {
        host: "localhost",
        user: "root",
        port:3306,
        password: "db11",
        database: "ClothingDB",
        connectionLimit: 5000,
    },
    production : {
    }
}

 