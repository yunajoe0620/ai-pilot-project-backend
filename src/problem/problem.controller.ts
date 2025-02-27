import { Body, Controller, Post } from '@nestjs/common';
import { CreateProblems } from 'src/dto/problem';
import { PdfService } from 'src/pdf/pdf.service';
import { ProblemService } from './problem.service';

@Controller('problem')
export class ProblemController {
  constructor(
    private readonly problemServiceRepository: ProblemService,
    // pdfService를 사용하려면은
    private readonly pdfServiceRepository: PdfService,
  ) {}

  // 생성을 하고 다시
  @Post('generate')
  async createProblems(@Body() data: CreateProblems) {
    const prompt = data.promptData.trim();
    // 결과값이 promise이다
    const result = await this.problemServiceRepository.generateProblems(prompt);
    // const pdfresult = await this.pdfServiceRepository.createTextFile(
    //   'pdfFile',
    //   result.response,
    // );
    if (result.response) {
      return {
        status: 200,
        result,
      };
    }
    return {
      status: 400,
    };
  }
}
