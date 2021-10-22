import App from '../src/app';
import * as request from 'supertest';
import CommentContrller from '../src/comment/comment.ctrl';
import AuthController from '../src/auth/auth.ctrl';
import { jest } from '@jest/globals';

const getCommentsByPostId = jest.fn();
const getCommentPasswordByCommentId = jest.fn(async (commentId: number): Promise<number> => 1234);
const postComment = jest.fn(async (name: string, content: string, password: number): Promise<number> => 1);
const deleteComment = jest.fn();
const getUserInfoByUserId = jest.fn().mockReturnValue({
    id: 1,
    userid: 'test1',
    password: 'test1234',
    username: '관리자',
    email: 'example@gmail.com',
    authority: 'ROOT'
});

const mockFunctions = {
    getCommentsByPostId,
    getCommentPasswordByCommentId,
    postComment,
    deleteComment,
}

const app = new App([
    new CommentContrller(
        mockFunctions
    ),
    new AuthController({ getUserInfoByUserId })
]);

describe('GET /api/comment/:postId 는', () => {
    let response;
    describe('댓글 조회 성공시', () => {
        beforeAll(async () => {
            response = await request(app.getServer()).get('/api/comment/1');
        });

        test('200 응답코드로 응답해야 한다', async () => {
            expect(response.statusCode).toBe(200);
        });

        test('데이터베이스에서 해당 게시글 아이디에 해당하는 댓글을 불러온다', async () => {
            expect(getCommentsByPostId.mock.calls.length).toBe(1);
        });
    });

    describe('postId 가 올바르지 않을시', () => {
        beforeAll(async () => {
            response = await request(app.getServer()).get('/api/comment/werqsdf');
        });

        test('400 응답코드로 응답해야 한다', async () => {
            expect(response.statusCode).toBe(400);
        });
    });

    describe('postId 를 입력하지 않았다면', () => {
        beforeAll(async () => {
            response = await request(app.getServer()).get('/api/comment');
        });

        test('404 응답코드로 응답해야 한다', async () => {
            expect(response.statusCode).toBe(404);
        });
    });
});

describe('POST /api/comment/:postId 는', () => {
    describe('댓글 작성 성공시', () => {
        let response;

        beforeAll(async () => {
            response = await request(app.getServer()).post('/api/comment/1')
                .send({
                    copyrightHolder: '윤우상',
                    content: '댓글 작성 테스트',
                    password: 1234
                });
        });

        test('200 응답코드로 응답해야 한다', () => {
            expect(response.status).toBe(200);
        });

        test('데이터베이스에 작성된 댓글 데이터를 삽입한다', () => {
            expect(postComment.mock.calls.length).toBe(1);
        });
    })

    describe('비밀번호가 문자일때', () => {
        let response;
        beforeAll(async () => {
            response = await request(app.getServer()).post('/api/comment/1')
                .send({
                    copyrightHolder: '윤우상',
                    content: '댓글 작성 테스트',
                    password: 'ㅁㅇㄹㅇ'
                })
        })

        test('400 응답코드로 응답해야 한다', () => {
            expect(response.status).toBe(400);
        });
    });

    describe('비밀번호가 4자리가 아닌 숫자일때', () => {
        const responses = [];
        const forms = [
            {
                copyrightHolder: '윤우상',
                content: '테스트 투고',
                password: 123124
            },
            {
                copyrightHolder: '윤우상',
                content: '테스트 투고',
                password: '123124'
            }
        ]

        beforeAll(async () => {
            for (const form of forms) {
                const response = await request(app.getServer()).post('/api/comment/1')
                    .send(form);
                responses.push(response);
            }; 
        });

        test('400 응답코드로 응답해야 한다', () => {
            responses.forEach(response => expect(response.status).toBe(400));
        });
    });

    describe('입력폼이 누락되어 있을때', () => {
        const responses = [];
        const forms = [
            {
                copyrightHolder: '윤우상',
                password: 123124
            },
            {
                content: '테스트 투고',
                password: '123124'
            },
            {
                copyrightHolder: '윤우상',
                password: 123124
            },
            {
                password: '123124'
            }
        ];

        beforeAll(async () => {
            for (const form of forms) {
                const response = await request(app.getServer()).post('/api/comment/1')
                    .send(form);
                responses.push(response);
            }
        });

        test('403 응답코드로 응답해야 한다', () => {
            responses.forEach(response => expect(response.status).toBe(403));
        });
    });
});


describe('DELETE /api/comment/user/:commentId 는', () => {
    describe('비밀번호로 댓글 삭제 성공시', () => {
        let response;

        beforeAll(async () => {
            response = await request(app.getServer()).delete('/api/comment/user/1')
                .send({
                    password: 1234
                });
        });

        test('200 응답코드로 응답해야 한다', () => {
            expect(response.status).toBe(200);
        });

        test('데이터베이스에서 해당 아이디의 댓글 비밀번호와 요청 본문의 비밀번호가 동일해야 한다', () => {
            expect(getCommentPasswordByCommentId.mock.calls.length).toBe(1);
            expect(getCommentPasswordByCommentId.mock.calls[0][0]).toBe('1');
        })

        test('데이터베이스에서 해당 아이디의 댓글을 삭제한다', () => {
            expect(deleteComment.mock.calls.length).toBe(1);
            expect(deleteComment.mock.calls[0][0]).toBe('1');
            deleteComment.mockClear();
        });
    });

    describe('비밀번호가 올바르지 않을때', () => {
        const responses = [];
        const forms = [
            { password: 3123 },
            {},
            { password: 'ㅁㄴㅇㄹㄹ' }
        ]

        beforeAll(async () => {
            for(const form of forms){
                const response = await request(app.getServer()).delete('/api/comment/user/1')
                .send(form);
                responses.push(response);
            }
        });

        test('401 응답코드로 응답해야 한다', () => {
            responses.forEach(response => expect(response.status).toBe(401));
        });

        test('비밀번호가 올바르지 않다는 메시지로 응답한다', () => {
            responses.forEach(response => expect(response.body.message).toBe('비밀번호가 올바르지 않습니다'));
        });
    });

    describe('댓글 아이디가 올바른 형식이 아닐때', () => {
        let responses = [];
        const urls = [
            `/api/comment/user/adsfe`,
            `/api/comment/user/${undefined}`,
        ]

        beforeAll(async () => {
            for (const url of urls) {
                responses.push(await request(app.getServer()).delete(url).send({
                    password: 1234
                }));
            }
        });

        test('404 응답코드로 응답해야 한다', () => {
            for (const response of responses) {
                expect(response.status).toBe(404);
            }

        });

    });
});

describe('DELETE /api/comment/admin/:commentId 는', () => {
    describe('관리자권한으로 댓글 삭제 성공시', () => {
        let response;

        beforeAll(async () => {
            interface AuthResponse extends request.Response {
                accessToken: string;
            }
            const authResponse = await request(app.getServer()).post('/api/auth/login')
                .send({
                    userId: 'test1',
                    password: 'test1234'
                }) as AuthResponse;

            const token = authResponse.body.accessToken;
            response = await request(app.getServer()).delete('/api/comment/admin/1')
                .set('x-access-token', token)
        });

        test('200 응답코드로 응답해야 한다', () => {
            expect(response.status).toBe(200);
        });

        test('데이터베이스에서 해당 아이디의 댓글을 삭제한다', () => {
            // 삭제 호출 수
            expect(deleteComment.mock.calls.length).toBe(1);
            // 삭체 요청하는 아이디
            expect(deleteComment.mock.calls[0][0]).toBe('1');
        });
    });

    describe('댓글 아이디가 올바른 형식이 아닐때', () => {
        const responses = [];
        const urls = [
            `/api/comment/admin/adsdsfe`,
            `/api/comment/admin/${undefined}`,
        ]

        beforeAll(async () => {
            interface AuthResponse extends request.Response {
                accessToken: string;
            }
            const authResponse = await request(app.getServer()).post('/api/auth/login')
                .send({
                    userId: 'test1',
                    password: 'test1234'
                }) as AuthResponse;

            const token = authResponse.body.accessToken;
            for (const url of urls) {
                responses.push(await request(app.getServer()).delete(url).set('x-access-token', token));
            }     
        });

        test('404 응답코드로 응답해야 한다', () => {
            for (const response of responses) {
                expect(response.status).toBe(404);
            }
        });
    });
});
