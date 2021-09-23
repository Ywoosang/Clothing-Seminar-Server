import * as jwt from 'jsonwebtoken';

export function authenticateToken(req,res,next){
    const authHeader = req.headers['x-access-token']
    const token = authHeader; 
    // 존재하지 않으면 false 가 token 에 부여
    if(!token) return res.sendStatus(401);
    jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,user) => {
        if(err) return res.sendStatus(403); 
        req.user = user;
        next();
    }); 
}



export function authenticateTokenInUrl(req,res,next){
    const token = req.query.token; 
    if(!token) return res.sendStatus(401);
    jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,user) => {
        if(err) return res.sendStatus(403); 
        req.user = user;
        next();
    }); 
}

export function generateAccessToken(user){
    return jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{
        // 만기 1일
        expiresIn: '1d'
    });
}


 
