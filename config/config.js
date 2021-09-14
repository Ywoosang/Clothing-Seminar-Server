module.exports = {
   test: {
        host: "localhost",
        user: "root",
        port:3306,
        password: "db11",
        database : "ClothingTestDB",
        connectionLimit: 30,
        dateStrings: "date"
    }, 
    dev : {
        host: "localhost",
        user: "root",
        port:3306,
        password: "db11",
        database: "ClothingDB",
        dateStrings: "date"

    },
    production : {

    }
}

 