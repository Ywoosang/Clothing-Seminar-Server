import * as express from 'express';
// import * as path from 'path';
import * as morgan from 'morgan';
import * as dotenv from 'dotenv';
import * as cors from 'cors';
import errorMiddleware from './middleware/error.middleware';
import pool from './db/connection'; 
dotenv.config();  

class App {
    public app: express.Application;
    public port: number;
     
    constructor(controllers, port) {
        this.app = express();
        this.port = port;
        this.connectToDatabase();
        this.initializeMiddlewares();
        this.initializeControllers(controllers);
        this.initializeErrorHandling();
    }
     
    private initializeMiddlewares() {
        this.app.use(cors({
            origin: ["http://localhost:8080"],
            credentials: true,
            methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
            // exposedHeaders: ['Content-Disposition'] 
        }));
        if (process.env.NODE_ENV !== 'test') {
            this.app.use(morgan('dev'));
        }
        // parse application/json 파싱
        this.app.use(express.json());
        //  application/x-www-form-urlencoded 파싱
        this.app.use(express.urlencoded({
            extended: true
        }));
    }

    private initializeControllers(controllers) {
        controllers.forEach((controller) => {
            this.app.use('/api', controller.router);
        });
    }

    private initializeErrorHandling() {
        this.app.use(errorMiddleware);
    }

    private connectToDatabase(){
        // For pool initialization 
        pool.getConnection((err, connection) => {
            if (err) {
                switch (err.code) {
                case "PROTOCOL_CONNECTION_LOST":
                    console.error("Database connection was closed.");
                    break;
                case "ER_CON_COUNT_ERROR":
                    console.error("Database has too many connections.");
                    break;
                case "ECONNREFUSED":
                    console.error("Database connection was refused.");
                    break;
                }
            }
            if (connection) {
                console.log('Database connected'); 
                return connection.release();
            }
        });
    }

    public listen() {
        this.app.listen(this.port, () => {
            console.log(`server listening on http://localhost:${this.port}`)
        });
    }
}



function loggerMiddleware(request: express.Request, response: express.Response, next) {
    console.log(`${request.method} ${request.path}`);
    next();
}
// app.set("etag", false);
// dotenv
dotenv.config();

// mysql 세션 설정 
// const sessionStore = new MySQLStore(dbconfig);

// port 변수 설정 
// app.set('port', process.env.PORT || 8080);
// app.use('/api/admin', require('./api/admin'));
// app.use('/api', require('./api/auth'));
// app.use('/api/post', require('./api/post'));
// app.use('/api/comment', require('./api/comment'));
// app.use('/api/user', require('./api/user'));
// app.use('/api/media', require('./api/media'));


export default App;
