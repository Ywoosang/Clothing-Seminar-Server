import App from '../app';
import * as request from 'supertest';
import ReviewController from '../review/review.ctrl';
import { Review } from '../review/review.interface'; 

const reviews: Review[] = [];

Array(10).fill(0).forEach((_,index)=>{
    reviews.push({
        id: index+1,
        name: '관리자',
        content: '테스트 투고',
        password: 1234,
        created_at: '2021-10-10 01:33'
    });
});
 
const mockFunctions = {
    getAllReviews : async()=> reviews,
    getReviewPassword: async(id: number) => {
        for(const review of reviews){
            if(review.id == id) {
                return review.password; 
            }
        }
    },
    deleteReview :  async(id: number) => {
        for(const review of reviews){
            if(review.id == id) {
                reviews.splice(reviews.indexOf(review),1);
                break;
            }
        }
    },
    postReview : async(name: string, content: string,password: number) => {
        reviews.push({
            id: reviews.length,
            name,
            content,
            password,
            created_at : (new Date()).toString()
        })
    }
}

const app = new App([
    new ReviewController(
        mockFunctions
    )
]);

describe('GET /api/review/all 은',()=>{
    let response; 
    beforeAll(async()=> {
        response = await request(app.getServer()).get('/api/review/all');
    })
    test('200 응답코드로 응답해야 한다', async () => {
        expect(response.statusCode).toBe(200);
    });
    test('작성된 모든 리뷰들을 담은 배열을 응답한다',async() => {
        response.body.reviews.forEach(review=>{
            expect(review.id).toBeDefined();
            expect(review.name).toBeDefined();
            expect(review.content).toBeDefined();
            expect(review.password).toBeDefined();
            expect(review.created_at).toBeDefined();
        })
    });

});

describe('POST /api/review 는',() => {
    describe('비밀번호가 문자일때',()=>{ 
        let response;
        beforeAll(async()=>{
            response = await request(app.getServer()).post('/api/review')
            .send({
                name: '윤우상',
                content: '테스트 투고',
                password: 'ㅁㅇㄹㅇ'
            })
        })

        test('400 응답코드로 응답해야 한다',() => {
            expect(response.status).toBe(400);
        });

        test('비밀번호는 숫자여야 한다는 메시지를 반환한다.',()=>{
            expect(response.body.message).toBeDefined();
            expect(response.body.message).toBe('비밀번호는 숫자여야 합니다')
        });

    });

    describe('비밀번호가 4자리가 아닌 숫자일때',() => {
        let response;
        beforeAll(async()=>{
            response = await request(app.getServer()).post('/api/review')
            .send({
                name: '윤우상',
                content: '테스트 투고',
                password: '12345'
            });
        });

        test('400 응답코드로 응답해야 한다',() => {
            expect(response.status).toBe(400);
        });

        test('비밀번호는 4자리여야 한다는 메시지를 반환한다.',()=>{
            expect(response.body.message).toBeDefined();
            expect(response.body.message).toBe('비밀번호는 4자리여야 합니다');
        });
    });

    describe('입력폼이 누락되어 있을때',() => {
        let response;
        beforeAll(async()=>{
            response = await request(app.getServer()).post('/api/review')
            .send({
                name: '',
                content: '',
                password: '12345'
            });
        });

        test('400 응답코드로 응답해야 한다',() => {
            expect(response.status).toBe(400);
        });

        test('정보를 모두 입력하라는 메시지를 반환한다.',()=>{
            expect(response.body.message).toBeDefined();
            expect(response.body.message).toBe('정보를 모두 입력해 주세요');
        });
    });
});


