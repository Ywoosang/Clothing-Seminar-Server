import { NextFunction, Request, Response } from 'express';
import HttpException from '../exceptions/HttpException';
 
function errorMiddleware(error: HttpException, req: Request, res: Response, next: NextFunction) {
  const status = error.status || 500;
  const message = error.message || 'Something went wrong';
  console.log(error);
  res
    .status(status)
    .json({
      status,
      message,
    })
}

export default errorMiddleware;

 
