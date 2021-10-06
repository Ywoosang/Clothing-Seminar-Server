import * as express from 'express';
import * as database from '../models/review.model';
import Controller from '../interfaces/controller.interface';
import { Review } from './review.interface';
import * as dotenv from 'dotenv';
dotenv.config();

class ReviewController implements Controller {
    public path = '/review';
    public router = express.Router();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // 전체 회고 조회
        this.router.get(`${this.path}/all`, this.getReviews);
        // 회고 작성
        this.router.post(`${this.path}`, this.postReview);
        // 회고 삭제
        this.router.delete(`${this.path}`, this.deleteReview);
    }

    private getReviews = async (req, res, next) => {
        try {
            // Post 와 File
            const reviews: Review[] = await database.getAllReviews();
            return res.json({
                reviews
            });
        } catch (error) {
            next(error);
        };
    }

    private postReview = async (req,res,next) => {
        try {
            const {name,content,password } = req.body;
            if(!name || !content || !password) return res.status(400).json({
                message: "정보를 모두 입력해 주세요"
            });
            console.log(typeof password.trim());
            // isNaN 은 문자형 숫자도 숫자로 인식 
            if(isNaN(password) || password.trim().length !== 4) return res.status(400).json({
                message: "비밀번호는 4자리 숫자여야 합니다"
            })
            const reviewId: number = await database.postReview(name,content,password.trim()); 
            res.json({ reviewId });
        } catch(error) {
            next(error);
        }
    }
    

    private deleteReview = async (req,res,next) => {
        try {
          // 비밀번호, 포스트 아이디
          const { password, reviewId }  = req.body;
          console.log(password,reviewId)
          if(!password || !reviewId) return res.sendStatus(403);
          // 서버에서 검증
          const reviewPassword: number = await database.getReviewPassword(reviewId);
          if(reviewPassword == password){
              await database.deleteReview(reviewId);
              res.json({
                  message: '의견을 삭제했습니다'
              })
          }else{
              res.status(401).json({
                  message: '비밀번호가 올바르지 않습니다'                  
              })
          }
        } catch (error) {
            next(error); 
        }
    }
}

export default ReviewController;