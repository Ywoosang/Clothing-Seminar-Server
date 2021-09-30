import App from './app';
import PostsController from './post/post.ctrl';
import AdminController from './admin/admin.ctrl'
import CategoryController from './category/category.ctrl';
import AuthController from './auth/auth.ctrl'; 
import CommentController from './comment/comment.ctrl';
import UserController from './user/user.ctrl'; 
import ReviewController from './review/review.ctrl'; 
import * as dotenv from 'dotenv';
dotenv.config();

 
const app = new App(
  [
    new UserController(),
    new PostsController(),
    new AdminController(),
    new CategoryController(),
    new AuthController(),
    new CommentController(),
    new ReviewController()
  ],
  process.env.POST as any || 3000, 
);
 
app.listen();
