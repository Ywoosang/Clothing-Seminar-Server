import App from '../src/app';
import * as request from 'supertest';
import AuthController from '../src/auth/auth.ctrl';
import { User } from '../src/auth/auth.interface';
import { jest } from '@jest/globals'; 

const users: User[] = [
    {
        id: 1,
        userid: 'test1',
        password: 'test1234',
        username: '관리자',
        email: 'example@gmail.com',
        authority: 'ROOT'
    },
    {
        id: 2,
        userid: 'test2',
        password: 'test1234',
        username: '관리자',
        email: 'example@gmail.com',
        authority: 'ADMINISTER'
    }
];

const getUserInfoByUserId = jest.fn(async (userId: string) => {
        return users.filter(user => user.userid == userId)[0];
    });

const mockFunctions = {
    getUserInfoByUserId
}

const app = new App([
    new AuthController(
        mockFunctions
    )
]);

describe('GET /api/auth/login 은', () => {
    describe('아이디가 주어지면',()=>{
        test('해당 아이디로 사용자를 데이터베이스에서 찾는다',async()=> {
            await request(app.getServer()).post('/api/auth/login').send({
                userId: 'test1',
                password: 'test1234'
            });
            // 해당 코드가 1번만 호출되었는지 확인 가능
            expect(getUserInfoByUserId.mock.calls.length).toBe(1);
            expect(getUserInfoByUserId.mock.calls[0][0]).toBe('test1');
        });
    })

    describe('로그인 성공시', () => {
        let response;
        beforeAll(async () => {
            response = await request(app.getServer()).post('/api/auth/login').send({
                userId: 'test2',
                password: 'test1234'
            })
        });
        test('200 응답코드로 응답한다', () => {
            expect(response.status).toBe(200); 

        });

        test('JSON 오브젝트로 응답한다',() => {
            expect(response.headers['content-type']).toEqual(expect.stringContaining('json'));
        })

        test('JWT 토큰을 담아 응답한다', () => {
            expect(response.body.accessToken).toBeDefined();
        });
    })
});