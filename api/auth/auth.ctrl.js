let pool = require('../../database/connection.js');
const bcrypt = require('bcrypt');
const { generateAccessToken } = require('../../middleware/auth.js'); 

// 바이트 계산
 function calcByte(s, b, i, c) {
    for (b = i = 0; c = s.charCodeAt(i++); b += c >> 11 ? 3 : c >> 7 ? 2 : 1);
    return b
};
// 이메일 유효성 검사
function checkEmail(email) {
    // 초기 값 false 
    let cnt = 0;
    for (let i = cnt = 0; i < email.length; i++) {
        if (email[i] === '@') cnt++;
    }
    let isEmail = cnt === 1;
    const reg = /[0-9a-zA-Z.;\-]/;  // 영문,숫자,특수문자 
    return reg.test(email) && isEmail;
}

const registerUser = async (req, res, next) => {
    pool = await pool;
    const connection = await pool.getConnection(async conn => conn);
    try {
        const { username, userid, email, password } = req.body;
        const checkId = /^[A-za-z]/g;  // 영문/ 숫자
        const checkName = /^[가-힣]*$/; // 한글체크
        // 클라이언트가 전송한 폼이 유효한지 검사
        let isValidate = true;
        let errorMessage = '';   

        if(!username){
            errorMessage = '이름을 입력 해주세요'
            isValidate = false;
        } else if(calcByte(username) > 16){
            errorMessage = '이름은 5자 이하여야 합니다'
            isValidate = false;
        } else if(!checkName.test(username)){
            errorMessage = '이름은 한글이어야 합니다'
            isValidate = false;
        } 

        if(!userid){
            errorMessage = '아이디를 입력 해주세요'; 
            isValidate = false; 
        } else if(calcByte(userid) > 11){
            errorMessage = '아이디는 10자 이하여야 합니다'; 
            isValidate = false;
        } else if(!checkId.test(userid)){
            errorMessage = '아이디는 영문 또는 숫자여야 합니다';
            isValidate = false;
        } 

        if(!email){
            errorMessage = '이메일을 입력 해 주세요'; 
            isValidate = false;
        } else if(calcByte(email) > 15){
            errorMessage = '비밀번호는 15자 이하여야 합니다';
            isValidate = false;
        } else if(!checkEmail(email)){
            errorMessage = '이메일 폼에 오류가 있습니다'
            isValidate = false;
        } 
        // 처리할 수 없는 요청 범위
        if (!isValidate) return res.status(416).json({errorMessage});
        // 이미 존재하는 회원인지
        const [user] = await connection.query(`
            SELECT userid,email 
            FROM User 
            WHERE userid = '${userid}'
        `);
        // 이미 존재하는 사용자
        if (user.length !== 0) {
            connection.release();
            return res.status(409).json({errorMessage: '이미 존재하는 사용자'});
        };
        // 패스워드 해싱
        const hash = await bcrypt.hash(password,12);
        await connection.query(`
            INSERT INTO User (username,userid,email,password) 
            VALUES ('${username}','${userid}','${email}','${hash}');
        `);
        connection.commit(); 
        connection.release();
        // 200 ok
        res.json({ message: `${username} 님 환영합니다.` });
    } catch (error) {
        connection.release(); 
        console.log("query error");
        next(error);
    }
};

const login =  async (req, res, next) => {
    // JSON 웹 토큰 생성 
    // 사용자 이름이 올바르게 인증되었다고 가정하고 전달
    try {
        pool = await pool;
        if (!req.body.password || !req.body.userid) return res.status(400).json({ message: "invalid form" })
        pool = await pool; 
        const connection = await pool.getConnection(async conn => conn);
        // 사용자 아이디 기반으로 찾기
        let [user] = await connection.query(`
            SELECT id,userid,username,email,password,authority
            FROM User 
            WHERE userid = '${req.body.userid}'
        `);
        // 사용자가 존재하지 않거나 password 필드가 비어 있다면
        if (!user[0]) return res.status(401).json({
            message: '아이디가 일치하지 않습니다.'
        });
        // 패스워드가 일치하는지 확인
        const { id,userid, username, email, password, authority } = user[0];
        let isPassword;
        if (authority === 'ADMINISTRATOR') {
            isPassword = req.body.password == password;
        } else {
            isPassword = await bcrypt.compare(req.body.password, password);
        }
        // 401 인증 실패
        if (!isPassword) return res.status(401).json({
            message: '비밀번호가 일치하지 않습니다.'
        });
        const payload = {
            id,
            userid,
            username,
            email,
            authority
        };
        const accessToken = generateAccessToken(payload);
        //  payload, secretkey
        // const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET);
        // accessToken,refreshToken - payload에 사용자 정보를 저장 
        // refreshTokens.push(refreshToken);
        res.json({ accessToken }); 
    } catch (error) {
        next(error);
    }
}

const logout =  (req, res, next) => {
    res.sendStatus(200);
}



module.exports = {
    registerUser,
    login,
    logout,
}