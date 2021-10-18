import App from '../src/app';
import * as request from 'supertest';
import ReviewController from '../src/review/review.ctrl';
import { Review } from '../src/review/review.interface';
import { jest } from '@jest/globals';
// import * as func from './review.functions';
const reviews: Review[] = [];

Array(10).fill(0).forEach((_, index: number) => {
    reviews.push({
        id: index + 1,
        name: '관리자',
        content: '테스트 투고',
        password: 1234,
        created_at: (new Date()).toString()
    });
});

const getAllReviews =  jest.fn(async (): Promise<Review[]> => reviews);

const getReviewPassword = jest.fn(async (id: number): Promise<number> => {
    for (const review of reviews) {
        if (review.id == id) {
            return review.password;
        }
    }
});

const deleteReview = jest.fn(async (id: number): Promise<void> => {
    for (const review of reviews) {
        if (review.id == id) {
            reviews.splice(reviews.indexOf(review), 1);
            break;
        }
    }
});

const postReview = jest.fn(async (name: string, content: string, password: number): Promise<number> => {
    const id = reviews.length;
    reviews.push({
        id,
        name,
        content,
        password,
        created_at: (new Date()).toString()
    })
    return id;
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
    )
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
    describe('리뷰 작성 성공시',()=>{
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

        test('데이터베이스에 작성된 리뷰 데이터를 삽입한다',()=>{
            expect(postReview.mock.calls.length).toBe(1);
            expect(postReview.mock.calls[0][0]).toBe('윤우상');
            expect(postReview.mock.calls[0][1]).toBe('테스트 투고');
            expect(postReview.mock.calls[0][2]).toBe(4321);
        });

        test('작성된 리뷰 아이디를 반환한다',()=>{
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






