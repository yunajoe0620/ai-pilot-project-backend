import { Body, Controller, Post } from '@nestjs/common';
import { HtmlService } from './html.service';

@Controller('html')
export class HTMLController {
  constructor(private readonly htmlServiceRepository: HtmlService) {}

  @Post('generate')
  async createProblems(@Body() data: any) {
    const { problemHtmlText, answerHtmlText } = data;
    console.log('problemHtmlText', problemHtmlText);
    console.log('answerHtmlText', answerHtmlText);

    try {
      Promise.all([
        this.htmlServiceRepository.createHTMLFile(
          problemHtmlText,
          'problem.html',
        ),
        this.htmlServiceRepository.createHTMLFile(
          answerHtmlText,
          'answer.html',
        ),
      ]).then((response) => {
        const [problemResponse, answerResponse] = response;
        if (problemResponse.status === 200 && answerResponse.status === 200) {
          return {
            status: 200,
            message: 'html파일 저장에 성공하였습니다다',
          };
        }
        return {
          status: 400,
          message: 'html파일 저장에 실패하였습니다',
        };
      });
    } catch (error) {
      throw error;
    }
  }
}
