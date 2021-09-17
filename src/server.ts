import App from './app';
import PostsController from './post/post.ctrl';
import AdminController from './admin/admin.ctrl'
import CategoryController from './category/category.ctrl';
import AuthController from './auth/auth.ctrl'; 
import CommentController from './comment/comment.ctrl';
import UserController from './user/user.ctrl'; 
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
  ],
  process.env.POST || 3000, 
);
 
app.listen();
