import { Body, Controller, Post } from '@nestjs/common';
import { CreateProblems } from 'src/dto/problem';
import { PdfService } from 'src/pdf/pdf.service';
import { ProblemService } from './problem.service';

@Controller('problem')
export class ProblemController {
  constructor(
    private readonly problemServiceRepository: ProblemService,
    private readonly pdfServiceRepository: PdfService,
  ) {}

  // gpt
  @Post('generate')
  async createProblems(@Body() data: CreateProblems) {
    const prompt = data.promptData.trim();
    const result = await this.problemServiceRepository.generateProblems(prompt);
    const newResponse = result.response.replaceAll('#', '');
    const [problems, answers] = newResponse.split('*****answer*****');

    const problemdocs = `
        \\documentclass[fleqn]{article}      
        \\usepackage{amsmath}
        \\usepackage{fontspec}
        \\usepackage{kotex} % 한국어 지원  

        \\begin{document}      
        ${problems}      
        \\end{document} 
    `;
    const answerDocs = `
       \\documentclass[fleqn]{article}      
        \\usepackage{amsmath}
        \\usepackage{fontspec}
        \\usepackage{kotex} % 한국어 지원  

        \\begin{document}      
        ${answers}      
        \\end{document} 
    `;

    try {
      const problemPdfresult = await this.pdfServiceRepository.createTextFile(
        'problemPdf',
        problemdocs,
      );

      const answerPdfresult = await this.pdfServiceRepository.createTextFile(
        'answerPdf',
        answerDocs,
      );

      const isFinished = await Promise.all([problemPdfresult, answerPdfresult]);

      if (result.response && isFinished.length === 2) {
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

  // for deek seek
  @Post('generate/deekseek')
  async createDeeakSeekProblems(@Body() data: CreateProblems) {
    const prompt = data.promptData.trim();
    const result =
      await this.problemServiceRepository.generateDeepSeekproblems(prompt);
    const newResponse = result.response.replaceAll('#', '');
    const [problems, answers] = newResponse.split('*****answer*****');

    const problemdocs = `
    \\documentclass[fleqn]{article}      
    \\usepackage{amsmath}
    \\usepackage{fontspec}
    \\usepackage{kotex} % 한국어 지원  

    \\begin{document}      
    ${problems}      
    \\end{document} 
`;
    const answerDocs = `
   \\documentclass[fleqn]{article}      
    \\usepackage{amsmath}
    \\usepackage{fontspec}
    \\usepackage{kotex} % 한국어 지원  

    \\begin{document}      
    ${answers}      
    \\end{document} 
`;
    try {
      const problemPdfresult = await this.pdfServiceRepository.createTextFile(
        'problemPdf',
        problemdocs,
      );

      const answerPdfresult = await this.pdfServiceRepository.createTextFile(
        'answerPdf',
        answerDocs,
      );
      // 최종결과값
      const isFinished = await Promise.all([problemPdfresult, answerPdfresult]);

      if (result.response && isFinished.length === 2) {
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
      return {
        status: 400,
      };
    }
  }
}
