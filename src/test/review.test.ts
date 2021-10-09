import App from '../app';
import * as request from 'supertest';
import ReviewController from '../review/review.ctrl';

describe('GET /api/review/app 은',()=>{
    let response; 
    const app = new App([
        new ReviewController({
        
        })
    ])
    beforeAll(async()=> {
        response = await  request(app).get('api/review/all');
    })
    test('200 응답코드로 응답해야 한다', async () => {
        expect(response.statusCode).toBe(200);
    });
    test('작성된 모든 리뷰들을 담은 배열을 응답한다',async () => {
        
    });

})
