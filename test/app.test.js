const app = require('../server');
const request = require('supertest');
const path = require('path');

let memberJwt;
let adminJwt;
let postAllowedJwt; 

describe('POST /api/register 는', ()=>{
    describe('사용자 이름, 아이디, 이메일, 비밀번호를 올바르게 입력받은 경우',()=>{
        const serverResponse = []; 
        const testUsers = [
            {
                username: "테스트유저",
                userid : 'user0',
                email : 'user0@gmail.com',
                password: "user123"
            },
            {
                username: "테스트유저",
                userid : 'user1',
                email : 'user1@gmail.com',
                password: "user123"
            },
            {
                username: "테스트유저",
                userid : 'user2',
                email : 'user2@gmail.com',
                password: "user123"
            },
            {
                username: "테스트유저",
                userid : 'user3',
                email : 'user3@gmail.com',
                password: "user123"
            },
            {
                username: "테스트유저",
                userid : 'user4',
                email : 'user4@gmail.com',
                password: "user123"
            }
        ];

        beforeAll(async() => {
            for(const user of testUsers){
                const response = await request(app).post('/api/register')
                .send(user); 
                serverResponse.push(response); 
            }
        }); 
        
        test("200 응답코드로 응답해야 한다",async ()=>{
            serverResponse.forEach(response =>{
                expect(response.statusCode).toBe(200)
            })
        }); 

        test("message 가 담긴 오브젝트로 응답해야 한다.",async() => {
            serverResponse.forEach(response =>{
                expect(response.body).toHaveProperty('message');
            })
        }); 
        // 사용자 환영 메시지를 포함한 json 오브젝트로 응답
        // fetch 를 통해 json 으로 변환하기 때문
        // content type header 에 json 을 특정 
    }); 
    describe("입력 폼이 유효하지 않는 경우 ",()=>{
        test("416 응답 코드를 반환한다",async ()=>{
            const bodyData = [
                {  
                    // 이름에 특수문자
                    username: "사@#용@!@#자!",
                    userid : 'user0',
                    email : 'user0@gmail.com',
                    password: "user123" 
                },
                {
                    username: "사용자",
                    // id 에 한글
                    userid : '유저0',
                    email : 'user0@gmail.com',
                    password: "user123" 
                },
                {
                    username: "사용자",
                    userid : 'user!!',
                    // @ 미포함
                    email : 'user0gmail.com',
                    password: "user123" 
                },
                {
                    // 복합 오류
                    username: "사!@#!@#용자",
                    userid : '유저0',
                    email : 'user0gmail.com',
                    password: "user123" 
                }
            ]; 
            for(const body of bodyData) {
                const response = await request(app).post('/api/register').send(body)
                expect(response.statusCode).toBe(416);
                expect(response.body).toHaveProperty('errorMessage')
            }
        });
    }); 

    describe("이미 존재하는 사용자인 경우",()=>{
        // 409 응답 코드를 반환한다. 
        function makeRequest(){
            return new Promise(function(resolve,reject){
                request(app).post('/api/register').send({
                    username: "테스트유저",
                    userid : 'user0',
                    email : 'user0@gmail.com',
                    password: "user123"
                })
                .end((err,res) => {
                    resolve(res);
                })
            })
        }

        test("409 응답 코드를 반환한다",async ()=>{
            const response = await  makeRequest();
            expect(response.statusCode).toBe(409);
        })
        test("에러 메시지를 포함한다",async ()=>{
            const response =  await  makeRequest();
            expect(response.body).toHaveProperty('errorMessage')
        })
    }); 
});
 

describe('POST /api/login 은', ()=>{
    describe('로그인 성공시',()=>{
        test('200 응답코드로 응답한다',async()=>{
            const tokenArray = [];
            const userInfoArray  = [
                {
                    username:'관리자0',
                    userid : 'admin0',
                    email : 'admin0@gmail.com',
                    password: '123',
                },
                {
                    username: "테스트유저",
                    userid : 'user0',
                    email : 'user0@gmail.com',
                    password: "user123"
                }
            ]
            for(let userInfo of userInfoArray){
                const response = await request(app).post('/api/login').send(userInfo)
                expect(response.statusCode).toBe(200);
                const jwtToken = response.header['set-cookie'][0].split('=')[1].split(';')[0];
                tokenArray.push(jwtToken); 
            }
            [adminJwt,memberJwt] = tokenArray; 
        }); 
    });
});

describe('POST /api/logout 은', ()=>{
    describe('로그아웃 성공시',()=>{
        test('200 응답코드로 응답한다',async()=>{
            const res = await request(app).post('/api/login').send({
                username: "테스트유저",
                userid : 'user1',
                email : 'user1@gmail.com',
                password: "user123"
            });
            expect(res.statusCode).toBe(200);
            const jwtToken = res.header['set-cookie'][0].split('=')[1].split(';')[0];
            const response = await request(app).get('/logout').set('Cookie',`jwt=${jwtToken};`).send({});
            expect(response.statusCode).toBe(200);
        }); 
    });

    describe('로그인하지 않은 사용자일 경우',()=>{
        test('401 응답코드를 반환한다',async()=>{
            const response = await request(app).get('/logout').send({})
            expect(response.statusCode).toBe(401);
        }); 
    });

    describe('올바르지 않은 토큰일 경우',()=>{
        test('403 응답코드를 반환한다',async()=>{
            const response = await request(app).get('/logout').set('Cookie',`jwt=empty-string123;`).send({});
            expect(response.statusCode).toBe(403);
        }); 
    })
}); 

// user 테스트
describe('POST /user 은', ()=>{
    describe('로그인하지 않은 유저일 경우',()=>{
        test('401 응답코드를 반환한다',async()=>{
            const response = await request(app).get('/user');
            expect(response.statusCode).toBe(401);
        }); 
    });

    describe('사용자 정보 조회 성공시',()=>{
        test('사용자의 아이디, 이름, 권한이 담긴 오브젝트를 반환한다.',async()=>{
            const response = await request(app).get('/user').set('Cookie',`jwt=${memberJwt};`);
            expect(response.body).toHaveProperty('username');
            expect(response.body).toHaveProperty('userId'); 
            expect(response.body).toHaveProperty('authority');
        }); 

        test('일반 회원의 authority 값은 MEMBER 을 반환한다',async()=>{
            const response = await request(app).get('/user').set('Cookie',`jwt=${memberJwt};`);
            expect(['ADMINISTRATOR','POST_ALLOWED','MEMBER']).toContain(response.body.authority);
            expect(response.body.authority).toBe('MEMBER');
        }); 

        test('관리자의 authority 값은 ADMINISTRATOR 을 반환한다',async()=>{
            const response = await request(app).get('/user').set('Cookie',`jwt=${adminJwt};`);
            expect(response.body).toHaveProperty('authority');
            expect(['ADMINISTRATOR','POST_ALLOWED','MEMBER']).toContain(response.body.authority);
            expect(response.body.authority).toBe('ADMINISTRATOR');
        }); 
    });
});

// admin 테스트
describe('GET /admin 은', ()=>{
    describe('로그인하지 않은 유저일 경우',()=>{
        test('401 응답코드를 반환한다',async()=>{
            const response = await request(app).get('/admin');
            expect(response.statusCode).toBe(401);
        }); 
    });

    describe('ADMINISTRATOR 권한이 없는 사용자일 경우',()=>{
        test('403 응답 코드를 반환한다',async()=>{
            const response = await request(app).get('/admin').set('Cookie',`jwt=${memberJwt};`);
            expect(response.statusCode).toBe(403);
        }); 
    });

    describe('회원 목록 조회 성공시',()=>{
        test('사용자들의 정보를 담은 users 배열을 응답한다',async()=>{
            const response = await request(app).get('/admin').set('Cookie',`jwt=${adminJwt};`);
            expect(response.body).toHaveProperty('users');
            // register 테스트에서 사용자 생성
            expect(response.body.users.length).not.toBe(0);
        }); 

        test('각 회원들은 username, userid, authority 속성을 가져야 한다',async()=>{
            const response = await request(app).get('/admin').set('Cookie',`jwt=${adminJwt};`);
            expect(response.body).toHaveProperty('users');
            response.body.users.forEach(user=>{
                expect(user).toHaveProperty('authority');
                expect(user).toHaveProperty('userid');
                expect(user).toHaveProperty('username');
            })
        }); 

        test('회원목록에는 관리자가 포함되지 않아야 한다',async()=>{
            const response = await request(app).get('/admin').set('Cookie',`jwt=${adminJwt};`);
            expect(response.body).toHaveProperty('users');
            response.body.users.forEach(user=>{
                expect(user.authority).not.toBe('ADMINISTRATOR');
            })
        }); 
    });
});

describe('PATCH /admin 은', ()=>{
    describe('사용자 권한 변경에 성공시',()=>{
        const serverResponse = []; 
        beforeAll(async() => {
            const users = [
                {
                    userid : 'user0',
                    authority : 'POST_ALLOWED'
                },
                {
                    userid : 'user1',
                    authority : 'POST_ALLOWED'
                }
            ]; 
            for(const user of users){
                const response = await request(app).patch('/admin')
                .set('Cookie',`jwt=${adminJwt};`)
                .send(user); 
                serverResponse.push({
                    body : response.body,
                    statusCode : response.statusCode,
                    userId : user.userid,
                    authority : user.authority
                }); 
            }
        });

        test('200 응답코드로 응답한다', async()=>{
            serverResponse.forEach(response=>{
                expect(response.statusCode).toBe(200);
            })
        }); 

        test('권한 변경 메시지를 담은 오브젝트로 응답한다', async()=>{
            serverResponse.forEach(response=>{
                expect(response.body.message).toBe(`${response.userId} 님의 권한이 ${response.authority} 로 변경되었습니다`);
            })
        }); 

    }); 

    describe('로그인하지 않은 유저일 경우',()=>{

        test('401 응답코드를 반환한다',async()=>{
            const response = await request(app).patch('/admin');
            expect(response.statusCode).toBe(401);
        }); 

    });

    describe('ADMINISTRATOR 권한이 없는 사용자일 경우',()=>{
        test('403 응답 코드를 반환한다',async()=>{
            const response = await request(app).patch('/admin').set('Cookie',`jwt=${memberJwt};`).send({
                userid : 'user0',
                authority : 'ADMIN'
            });
            expect(response.statusCode).toBe(403);
        }); 
    });

    describe('사용자 아이디 또는 변경할 권한을 보내지 않은 경우',()=>{
        test('400 응답코드를 반환한다',async()=>{
            const bodyArray = [
                { userid : 'user0' },
                { authority: 'POST_ALLOWED'}
            ]
            for(const body of bodyArray){
                const response = await request(app).patch('/admin')
                .set('Cookie',`jwt=${adminJwt};`)
                .send(body);
                expect(response.statusCode).toBe(400);
            }
        }); 
    });

    describe('변경할 권한이 올바르지 않은 경우',()=>{
        test('403 응답코드를 반환한다',async()=>{
            const response = await request(app).patch('/admin').send({ 
                userid : 'user0',
                authority : 'ADMIN'
            }).set('Cookie',`jwt=${adminJwt};`); 
            expect(response.statusCode).toBe(403);
        }); 
        test('올바른 권한으로 변경하라는 에러 메시지를 반환한다',async()=>{
            const response = await request(app).patch('/admin').set('Cookie',`jwt=${adminJwt};`).send({ 
                userid : 'user0',
                authority : 'POSTALLOWED'
            });
            expect(response.body).toHaveProperty('errorMessage');
            expect(response.body.errorMessage).toBe('올바른 권한으로 변경해 주세요'); 
        }); 
    });

    describe('존재하지 않는 사용자의 권한을 변경하려고 시도할 경우',()=>{
        test('400 응답코드를 반환한다',async()=>{
            const response = await request(app).patch('/admin')
            .set('Cookie',`jwt=${adminJwt};`)
            .send({ 
                userid : 'user12312',
                authority : 'MEMBER'
            }).expect(400);
            expect(response.statusCode).toBe(400);
        }); 
    });

    describe('관리자의 권한을 변경하려고 시도할 경우',()=>{
        test('403 응답코드를 반환한다',async()=>{
            const response = await request(app).patch('/admin')
            .set('Cookie',`jwt=${adminJwt};`)
            .send({ 
                userid : 'admin0',
                authority : 'MEMBER'
            });
            expect(response.statusCode).toBe(403);
        }); 

        test('변경할 수 없다는 에러 메시지를 반환한다',async()=>{
            const response = await request(app).patch('/admin').set('Cookie',`jwt=${adminJwt};`)  
            .send({ 
                userid : 'admin0',
                authority : 'MEMBER'
            });
            expect(response.body).toHaveProperty('errorMessage');
            expect(response.body.errorMessage).toBe('관리자의 권한은 변경할 수 없습니다');
        }); 
    });
});



// post 글쓰기 기능


describe('POST /post 은 ',()=>{
    describe('글 등록 성공 시',()=>{
        const agent = request.agent(app);
        let response;  
        beforeAll(async() => {
            await  agent.post('/login').send({
                username: "테스트유저",
                userid : 'user1',
                email : 'user1@gmail.com',
                password: "user123"
            })
            // const jwtToken = response.header['set-cookie'][0].split('=')[1].split(';')[0];
            const filePath = path.join(__dirname,'upload','test.txt'); 
            
            response = await agent.post('/post')
            .type('form')
            .attach('file',filePath)
            .field('title','테스트파일')
            .field('content','테스트용 파일 업로드 입니다')
            .field('category','복식사') 
        });

        test('200 응답코드로 응답한다', async ()=> {
            expect(response.statusCode).toBe(200); 
            console.log(response.message);
        });

        test('포스트 아이디를 ', async ()=> {
            expect(response.body).toHaveProperty('id')
        });

        
        // test('', async ()=> {

        // });
    })
})


// post 조회기능
// describe('POST /:category/all 은 ',()=>{
//     describe('조회 성공시',()=>{
//         beforeAll(async() => {
//             const response = await request(app).get('/admin')
//             .set('Cookie',`jwt=${};`)
//             .
//             expect(response.statusCode).toBe(403);
//         });

//         test('200 응답코드로 응답한다', async ()=> {

//         });

//         test('해당 카테고리의 게시물 목록 배열을 반환한다', async ()=> {
//         });

        
//         test('', async ()=> {

//         });
//     })
// })



