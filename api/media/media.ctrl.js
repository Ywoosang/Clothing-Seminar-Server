const fs = require('fs');
const path = require('path')

const videoStream = (req,res,next) =>{
    const videoName = req.params.video;
    const range = req.headers.range;
    const videoPath = path.join(__dirname,'video',videoName);
    const videoSize = fs.statSync(videoPath).size;
    const chunkSize =  1 * 1e+6;
    const start = Number(range.replace(/\D/g,''));
    const end = Math.min(start + chunkSize, videoSize -1);
    const contentLength = end - start + 1;
    const headers = {
        "Content-range" : `bytes ${start}-${end}/${videoSize}`,
        "Accept-Ranges" : "bytes",
        "Content-Length" : contentLength,
        "Content-Type" : "video/mp4"
    }
    res.writeHead(206, headers);
    const stream = fs.createReadStream(videoPath, { start, end });
    stream.pipe(res);
}


module.exports = {
    videoStream
}