import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
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
  async downloadPDF(@Query('type') type: string, @Res() res: Response) {
    let fileName: string;
    let htmlName: string;
    if (type === 'problem') {
      fileName = 'problem.pdf';
      htmlName = 'problem.html';
    } else if (type === 'answer') {
      fileName = 'answer.pdf';
      htmlName = 'answer.html';
    } else {
      return res.status(400).send('Invalid type parameter');
    }

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
        // this.pdfServiceRepository.streamPdfFile(res, problemPdfFilePath);
        // this.pdfServiceRepository.streamPdfFile(res, answerPdfFilePath);
      }
    } catch (error) {
      throw error;
    }
  }
}
