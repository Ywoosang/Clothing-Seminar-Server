const express = require('express');
const path = require('path');
const morgan = require('morgan');
const session = require('express-session');
// Mysql 세션저장 
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const cors = require('cors');
 
// 라우터


const app = express();
// CORS 에서는 기본적으로 쿠키를 request headers 에 넣어주지 않기 때문에
// 별도 설정이 필요하다. 
app.use(cors({ 
    origin: ["http://localhost:8080"],
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE", 
    // exposedHeaders: ['Content-Disposition'] 
}));
// app.set("etag", false);
// dotenv
dotenv.config();

// mysql 세션 설정 
// const sessionStore = new MySQLStore(dbconfig);

// port 변수 설정 
app.set('port', process.env.PORT || 8080);

// morgan 
if(process.env.NODE_ENV !== 'test'){
    app.use(morgan('dev'));
}
// css,js 정적파일 경로 설정 

// request body 에서 json 사용가능  
app.use(express.json());

app.use(express.urlencoded({
    // https://stackoverflow.com/questions/29960764/what-does-extended-mean-in-express-4-0/45690436#45690436 
    extended: true,
}));
// 
app.use(express.static(path.join(__dirname, 'public')));
app.use('/img', express.static(path.join(__dirname, 'uploads')));
app.use(cookieParser());
// 세션 등록 
app.use(session({
    resave: false, // 매번 session 강제 저장
    // port: process.env.MYSQL_PORT || 3306,
    secret: process.env.COOKIE_SECRET || 'ywoosang11', 
    // store: sessionStore
    saveUninitialized: false,
    cookie: {
        // 자바스크립트 공격 방지
        maxAge: 60 * 60 * 1000,
        expires: 60 * 60 * 1000,
        httpOnly: true,
        secure: false
    },
    name: "jwt"//default : connect.sid  
}));

// app.use(passport.initialize());
// app.use(passport.session());
// passportConfig();
 

app.use('/api/admin',require('./api/admin'));
app.use('/api',require('./api/auth')); 
app.use('/api/post',require('./api/post'));
app.use('/api/comment',require('./api/comment'));
app.use('/api/user',require('./api/user')); 
app.use('/api/media',require('./api/media'));
 
// app.get('/', (req, res) => {
//     res.send('API 서버입니다.')
// })

// 404 처리 
app.use((req, res, next) => {
    res.status(404).send('404 not found');
});

// error 처리 
app.use((err, req, res, next) => {
    console.log(err);
    res.sendStatus(500);
    // 로깅 구현
});

// 서버 실행
//() => {
//     console.log(`express start on ${app.get('port')}`);
// }
app.listen(app.get('port'),()=>{
    console.log(`server listening on http://localhost:${app.get('port')}`)
});

module.exports = app;
