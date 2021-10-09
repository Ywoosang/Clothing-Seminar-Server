import * as adminModel from './admin.model';
import * as commentModel from './comment.model';
import * as postModel from './post.model';
import * as reviewModel from './review.model';
import * as authModel from './auth.model';
import * as categoryModel from './category.model'; 

export default {
    ...adminModel,
    ...authModel,
    ...commentModel,
    ...postModel,
    ...reviewModel,
    ...categoryModel
};
 