import * as express from 'express';
import * as database from '../models/category.model';
import { authenticateToken } from '../middleware/auth';
import Controller from '../interfaces/controller.interface';

class CategoryController implements Controller {
    public path = '/category';
    public router = express.Router();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // 카테고리내 특정 페이지의 포스트 
        this.router.get(`${this.path}/:category/:page`, authenticateToken, this.getCurrentPagePost);
        // 카테고리 내 페이지 수
        this.router.get(`${this.path}/:category/count`, authenticateToken, this.getNumberOfPages)
    };

    private getNumberOfPages = async(req, res, next) => {
        try {
            const category = req.params.category;
            // 올바른 카테고리가 들어왔는지 검사
            const numberOfPosts = await database.getCategoryTotalPostsNumber(category);
            // 한 페이지에 13 개씩 렌더링
            const tmp = numberOfPosts / 13;
            let numberOfPages = tmp !== Math.floor(tmp) ? Math.floor(tmp) + 1 : Math.floor(tmp);
            // 페이지 최소 개수는 1개
            numberOfPages = numberOfPages || 1;
            res.status(200).json({ numberOfPages })
        } catch (error) {
            next(error);
        }
    };

    private getCurrentPagePost = async(req, res, next) => {
        try {
            // 현재 분과
            const category:string = req.params.category;
            // 페이지 번호
            const pageNumber:string = req.params.page;
            // 전체 페이지
            const startIndex:number = ( pageNumber - 1) * 13;
            const posts = await database.getPagePosts(category, startIndex);
            res.json({ posts });
        } catch (error) {
            next(error);
        }
    };
}

export default CategoryController; 
