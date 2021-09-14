const multerS3 = require('multer-s3');
const multer = require('multer'); 
const AWS = require('aws-sdk');
require('dotenv').config();
 
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
        try {
            const filePathName = `${Date.now()}-${file.originalname}`;
            cb(null, filePathName);
        } catch (err) {
            console.log(err);
        }
    }
});

const upload = multer({
    storage
});

module.exports = upload;