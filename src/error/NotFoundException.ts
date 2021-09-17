import HttpException from "./HttpException";
 
class NotFoundException extends HttpException {
  constructor(id: string) {
    super(404, `경로가 존재하지 않습니다`);
  }
}
 
export default NotFoundException;