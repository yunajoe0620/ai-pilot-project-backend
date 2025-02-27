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
    // gpt 결과값값
    const result = await this.problemServiceRepository.generateProblems(prompt);

    console.log('result입니다아아아', result.response);

    const docs = `
        \\documentclass{article}
        \\usepackage{amsmath}
        \\usepackage{fontspec}
        \\usepackage{kotex} % 한국어 지원  

        \\begin{document} 
    
        ${result.response}      
        \\end{document} 
    `;

    // gpt결과값에 의한 pdf결과값
    const pdfresult = await this.pdfServiceRepository.createTextFile(
      'pdfFile',
      docs,
    );
    if (result.response) {
      return {
        status: 200,
        pdfresult,
      };
    }
    return {
      status: 400,
    };
  }
}
