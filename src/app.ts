import * as express from 'express';
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
    public port: number | string;

    constructor(controllers,) {
        this.app = express();
        this.port =   process.env.PORT || 3000;
        this.connectToDatabase();
        this.setDefaultPathResponse();
        this.initializeMiddlewares();
        this.initializeControllers(controllers);
        this.initializeErrorHandling();
    }

    private initializeMiddlewares() {
        if (process.env.NODE_ENV === "production"){
            this.app.use(cors({
                origin: ['https://kscic.co.kr','https://www.kscic.co.kr']
            })); 
            this.app.use(morgan("combined"));
            this.app.use(helmet({
                contentSecurityPolicy: false
            }));
            this.app.use(hpp());
        } else if (process.env.NODE_ENV === "development") {
            this.app.use(cors());
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

    private connectToDatabase() {
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
            } else if (connection) {
                console.log('Database connected');
                return connection.release();
            } else {
                console.log('Database connection failed')
            }
        });
    }

    private setDefaultPathResponse(){
        this.app.get('/',(req,res)=>{
            return res.send(`
                <h1>This is an API server</h1>
                <p>ckick the link below</p>
                <p>https://www.kscic.co.kr</p>
            `)
        })
    }

    public listen() {
        this.app.listen(this.port, () => {
            console.log(`server listening on http://localhost:${this.port}`)
        });
    }
}

export default App;
