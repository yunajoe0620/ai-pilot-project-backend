import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import * as path from 'path';
import { Docs } from 'src/dto/problem';
import { PdfService } from './pdf.service';

@Controller('pdf')
export class PdfController {
  constructor(private readonly pdfServiceRepository: PdfService) {}

  @Post('generate')
  async createProblems(@Body() data: Docs) {
    const problemDocs = data.problem;
    const answerDocs = data.answer;

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

  @Get('download')
  async downloadPDF(@Res() res: Response) {
    const pdfFilePath = path.resolve('pandocs', 'markdown', 'problem.pdf');
    const answerPdfFilePath = path.resolve('pandocs', 'markdown', 'answer.pdf');
    try {
      const result = await Promise.all([
        this.pdfServiceRepository.downloadPdfFile(
          'problem.html',
          'problem.pdf',
        ),
        this.pdfServiceRepository.downloadPdfFile('answer.html', 'answer.pdf'),
      ]);

      const [problemResult, answerResult] = result;
      if (problemResult.status === 200 && answerResult.status === 200) {
        this.pdfServiceRepository.streamPdfFile(res, pdfFilePath);
      }
    } catch (error) {
      throw error;
    }
  }
}
