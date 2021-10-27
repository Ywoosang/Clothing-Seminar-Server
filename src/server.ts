import App from './app';
import PostsController from './post/post.ctrl';
import AdminController from './admin/admin.ctrl'
import CategoryController from './category/category.ctrl';
import AuthController from './auth/auth.ctrl'; 
import CommentController from './comment/comment.ctrl';
import UserController from './user/user.ctrl'; 
import ReviewController from './review/review.ctrl'; 
import * as dotenv from 'dotenv';
import AdminDao from './dao/admin.dao';
import CommentDao from './dao/comment.dao';
import AuthDao from './dao/auth.dao';
import ReviewDao from './dao/review.dao';
import CategoryDao from './dao/category.dao';
import PostDao from './dao/post.dao'; 

dotenv.config();
 
const app = new App(
  [
    new UserController(),
    new PostsController(PostDao),
    new AdminController(AdminDao),
    new CategoryController(CategoryDao),
    new AuthController(AuthDao),
    new CommentController(CommentDao),
    new ReviewController(ReviewDao)
  ]
);

app.listen();
