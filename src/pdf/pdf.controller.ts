import { Body, Controller, Post } from '@nestjs/common';
import { PdfService } from './pdf.service';

type Data = {
  problem: string;
  answer: string;
};
@Controller('pdf')
export class PdfController {
  constructor(private readonly pdfServiceRepository: PdfService) {}

  @Post('generate')
  async createProblems(@Body() data: Data) {
    const problemDocs = data.problem;
    const answerDocs = data.answer;
    console.log('problemDocs', problemDocs, answerDocs);

    try {
      const problemPdfresult = await this.pdfServiceRepository.createTextFile(
        'problemPdf',
        problemDocs,
      );

      const answerPdfresult = await this.pdfServiceRepository.createTextFile(
        'answerPdf',
        answerDocs,
      );
      // 최종결과값
      const isFinished = await Promise.all([problemPdfresult, answerPdfresult]);
      console.log('isFinished', isFinished);

      if (isFinished.length === 2) {
        return {
          status: 200,
          message: '문제가 제대로 생성되었습니다',
          problemPdfresult,
          answerPdfresult,
        };
      }
      return {
        status: 400,
        message: '문제가 제대로 생성되지 않았습니다',
      };
    } catch (error) {
      throw error;
    }
  }
}
