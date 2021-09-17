import * as multerS3 from 'multer-s3';
import * as multer from 'multer';
import * as AWS from 'aws-sdk'; 
import * as dotenv from 'dotenv'; 
dotenv.config(); 
 
AWS.config.update({
    apiVersion: "2010-12-01",
    accessKeyId : process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey:process.env.AWS_SECRET_KEY_ID,
    region: 'ap-northeast-2',
});

const storage = multerS3({
    s3: new AWS.S3(),
    bucket: 'ywoosang-s3',
    key(req, file, cb) {
        const filePathName = `${Date.now()}-${file.originalname}`;
        cb(null, filePathName);
    }
});

const upload = multer({
    storage
});

export default upload;