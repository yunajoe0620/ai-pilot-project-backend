import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import { Response } from 'express';
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
    console.log('pdf다운로드를 시작합니다', type);
    let fileName: string;
    let htmlName: string;
    if (type === 'problem') {
      fileName = 'problem.pdf';
      htmlName = 'problem.html';
    } else if (type === 'answer') {
      fileName = 'answer.pdf';
      htmlName = 'answer.html';
    } else {
      return res.status(400);
    }

    const filePath = path.resolve('pandocs', fileName);
    try {
      const result = await this.pdfServiceRepository.downloadPdfFile(
        htmlName,
        fileName,
      );
      if (result.status === 200) {
        return this.pdfServiceRepository.streamPdfFile(res, filePath);
      } else {
        return res.status(500).send('PDF generation failed');
      }
    } catch (error) {
      return res.status(500).send('Internal server error');
    }
  }
}
