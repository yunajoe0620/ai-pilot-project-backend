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
    console.log('problems', problems);
    console.log('answers', answers);

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

      const isFinished = Promise.all([problemPdfresult, answerPdfresult]);
      console.log('isFinished222222', isFinished);

      // 최종결과값
      if (result.response) {
        return {
          status: 200,
          problemPdfresult,
        };
      }
    } catch (error) {
      return {
        status: 400,
      };
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
    console.log('problems', problems);
    console.log('answers', answers);
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
      const pdfresult = await this.pdfServiceRepository.createTextFile(
        'pdfFile',
        problemdocs,
      );
      // 최종결과값
      if (result.response) {
        return {
          status: 200,
          pdfresult,
        };
      }
    } catch (error) {
      return {
        status: 400,
      };
    }
  }
}
