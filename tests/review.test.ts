import App from '../src/app';
import * as request from 'supertest';
import ReviewController from '../src/review/review.ctrl';
import AuthController from '../src/auth/auth.ctrl';
import { Review } from '../src/review/review.interface';
import { jest } from '@jest/globals';


const getAllReviews = jest.fn(async (): Promise<Review[]> => Array(3).fill(0).map((_, index: number) => {
    return {
        id: index + 1,
        name: '관리자',
        content: '테스트 투고',
        password: 1234,
        created_at: (new Date()).toString()
    }
}));
const getReviewPassword = jest.fn(async (): Promise<number> => 1234);
const deleteReview = jest.fn();
const postReview = jest.fn(async (name: string, content: string, password: number): Promise<number> => {
    return 1;
});
const getUserInfoByUserId = jest.fn().mockReturnValue({
    id: 1,
    userid: 'test1',
    password: 'test1234',
    username: '관리자',
    email: 'example@gmail.com',
    authority: 'ROOT'
});

const mockFunctions = {
    getAllReviews,
    getReviewPassword,
    postReview,
    deleteReview,
}

const app = new App([
    new ReviewController(
        mockFunctions
    ),
    new AuthController({ getUserInfoByUserId })
]);

describe('GET /api/review/all 은', () => {
    let response;
    beforeAll(async () => {
        response = await request(app.getServer()).get('/api/review/all');
    })

    test('200 응답코드로 응답해야 한다', async () => {
        expect(response.statusCode).toBe(200);
    });

    test('데이터베이스에서 모든 리뷰를 조회한다', async () => {
        expect(getAllReviews.mock.calls.length).toBe(1);
    });

    test('작성된 모든 리뷰들을 담은 배열을 응답한다', async () => {
        response.body.reviews.forEach(review => {
            expect(review.id).toBeDefined();
            expect(review.name).toBeDefined();
            expect(review.content).toBeDefined();
            expect(review.password).toBeDefined();
            expect(review.created_at).toBeDefined();
        })
    });

});

describe('POST /api/review 는', () => {
    describe('리뷰 작성 성공시', () => {
        let response;
        beforeAll(async () => {
            response = await request(app.getServer()).post('/api/review')
                .send({
                    name: '윤우상',
                    content: '테스트 투고',
                    password: 4321
                });
        });

        test('200 응답코드로 응답해야 한다', () => {
            expect(response.status).toBe(200);
        });

        test('데이터베이스에 작성된 리뷰 데이터를 삽입한다', () => {
            expect(postReview.mock.calls.length).toBe(1);
            expect(postReview.mock.calls[0][0]).toBe('윤우상');
            expect(postReview.mock.calls[0][1]).toBe('테스트 투고');
            expect(postReview.mock.calls[0][2]).toBe(4321);
        });

        test('작성된 리뷰 아이디를 반환한다', () => {
            expect(response.body.reviewId).toBeDefined();
            expect(typeof response.body.reviewId).toBe("number");
        });

    })

    describe('비밀번호가 문자일때', () => {
        let response;
        beforeAll(async () => {
            response = await request(app.getServer()).post('/api/review')
                .send({
                    name: '윤우상',
                    content: '테스트 투고',
                    password: 'ㅁㅇㄹㅇ'
                })
        })

        test('400 응답코드로 응답해야 한다', () => {
            expect(response.status).toBe(400);
        });

        test('비밀번호는 숫자여야 한다는 메시지를 반환한다.', () => {
            expect(response.body.message).toBeDefined();
            expect(response.body.message).toBe('비밀번호는 숫자여야 합니다')
        });
    });

    describe('비밀번호가 4자리가 아닌 숫자일때', () => {
        let response;
        beforeAll(async () => {
            response = await request(app.getServer()).post('/api/review')
                .send({
                    name: '윤우상',
                    content: '테스트 투고',
                    password: '12345'
                });
        });

        test('400 응답코드로 응답해야 한다', () => {
            expect(response.status).toBe(400);
        });

        test('비밀번호는 4자리여야 한다는 메시지를 반환한다.', () => {
            expect(response.body.message).toBeDefined();
            expect(response.body.message).toBe('비밀번호는 4자리여야 합니다');
        });
    });

    describe('입력폼이 누락되어 있을때', () => {
        let response;
        beforeAll(async () => {
            response = await request(app.getServer()).post('/api/review')
                .send({
                    name: '',
                    content: '',
                    password: '12345'
                });
        });

        test('400 응답코드로 응답해야 한다', () => {
            expect(response.status).toBe(400);
        });

        test('정보를 모두 입력하라는 메시지를 반환한다.', () => {
            expect(response.body.message).toBeDefined();
            expect(response.body.message).toBe('정보를 모두 입력해 주세요');
        });
    });
});


describe('DELETE /api/review 는', () => {
    describe('비밀번호로 리뷰 삭제 성공시', () => {
        let response;
        beforeAll(async () => {
            response = await request(app.getServer()).delete('/api/review')
                .send({
                    reviewId: 2,
                    password: 1234
                });
        });

        test('200 응답코드로 응답해야 한다', () => {
            expect(response.status).toBe(200);
        });

        test('데이터베이스에서 해당 아이디의 리뷰를 삭제한다', () => {
            expect(deleteReview.mock.calls.length).toBe(1);
            expect(deleteReview.mock.calls[0][0]).toBe(2);
            deleteReview.mockClear();
        });

        test('리뷰가 삭제되었다는 메시지로 응답한다', () => {
            expect(response.body.message).toBe('의견을 삭제했습니다');

        });
    });

    describe('비밀번호가 올바르지 않을때', () => {
        let response;
        beforeAll(async () => {
            response = await request(app.getServer()).delete('/api/review')
                .send({
                    reviewId: 2,
                    password: 1123
                });
        });

        test('403 응답코드로 응답해야 한다', () => {
            expect(response.status).toBe(401);
        });

        test('비밀번호가 올바르지 않다는 메시지로 응답한다', () => {
            expect(response.body.message).toBe('비밀번호가 올바르지 않습니다');

        });
    });

    describe('비밀번호 또는 리뷰 아이디를 입력하지 않았을 때', () => {
        let responses = [];
        beforeAll(async () => {
            const requestForms = [
                {
                    reviewId: 2
                },
                {
                    password: 1234
                },
                {}
            ]
            for (const requestForm of requestForms) {
                responses.push(await request(app.getServer()).delete('/api/review').send(requestForm))
            }
        });


        test('403 응답코드로 응답해야 한다', () => {
            for (const response of responses) {
                expect(response.status).toBe(403);
            }

        });

    });
});

describe('DELETE /api/review/admin 는', () => {
    describe('관리자권한으로 리뷰 삭제 성공시', () => {
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
            response = await request(app.getServer()).delete('/api/review/admin')
                .set('x-access-token', token)
                .send({
                    reviewId: 2
                });
        });

        test('200 응답코드로 응답해야 한다', () => {
            expect(response.status).toBe(200);
        });

        test('데이터베이스에서 해당 아이디의 리뷰를 삭제한다', () => {
            expect(deleteReview.mock.calls.length).toBe(1);
            expect(deleteReview.mock.calls[0][0]).toBe(2);
        });

        test('리뷰가 삭제되었다는 메시지를 반환한다.', () => {
            expect(response.body.message).toBe('의견을 삭제했습니다');
        });
    });
});