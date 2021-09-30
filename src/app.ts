import * as express from 'express';
// import * as path from 'path';
import * as morgan from 'morgan';
import * as dotenv from 'dotenv';
import * as cors from 'cors';
import * as hpp from 'hpp';
import * as helmet from 'helmet';
import errorMiddleware from './middleware/error.middleware';
import pool from './db/connection'; 
 
dotenv.config();  

class App {
    public app: express.Application;
    public port: number;
     
    constructor(controllers, port: number) {
        this.app = express();
        this.port = port;
        this.connectToDatabase();
        this.initializeMiddlewares();
        this.initializeControllers(controllers);
        this.initializeErrorHandling();
    }
     
    private initializeMiddlewares() {
        this.app.use(cors({
            origin: ["http://localhost:8080","http://172.24.90.66:8080","http://clothing-seminar-client.s3-website.ap-northeast-2.amazonaws.com"],
            credentials: true,
            methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
            // exposedHeaders: ['Content-Disposition'] 
        }));
        if(process.env.NODE_ENV === "production"){
            this.app.use(morgan("combined"));
            this.app.use(helmet({
                contentSecurityPolicy: false
            }));
            this.app.use(hpp());
        }
        else if (process.env.NODE_ENV === "development") {
            this.app.use(morgan("dev"));
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
            } else {
                console.log('Database connection failed')
            }
        });
    }

    public listen() {
        this.app.listen(this.port, () => {
            console.log(`server listening on http://localhost:${this.port}`)
        });
    }
}

export default App;
