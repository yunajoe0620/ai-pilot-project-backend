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

  @Post('generate')
  async createProblems(@Body() data: CreateProblems) {
    console.log(' data.promptData.', data.promptData);
    console.log(' data.promptData.', data.model);

    // data.promptData. undefined
    // [Nest] 25400  - 2025. 03. 13. 오후 2:38:20   ERROR [ExceptionsHandler] TypeError: Cannot read properties of undefined (reading 'trim')
    //     at ProblemController.createProblems (C:\Users\yunaj\OneDrive\바탕 화면\ai-pilot-project-backend\src\problem\problem.controller.ts:19:30)
    //     at C:\Users\yunaj\OneDrive\바탕 화면\ai-pilot-project-backend\node_modules\@nestjs\core\router\router-execution-context.js:38:29
    //     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
    //     at async C:\Users\yunaj\OneDrive\바탕 화면\ai-pilot-project-backend\node_modules\@nestjs\core\router\router-execution-context.js:46:28
    //     at async C:\Users\yunaj\OneDrive\바탕 화면\ai-pilot-project-backend\node_modules\@nestjs\core\router\router-proxy.js:9:17
    //  data.promptData. 다음 조건에 맞게 LaTeX 포맷으로 고등학교 수학 문제를 생성해줘.

    // **주제**: 고등수학 (상) - 방정식과 부등식 - 연립이차방정식
    // **문항 수**: 20문항
    // - 쉬운 문제 5문항
    const prompt = data?.promptData?.trim();
    const model = data?.model?.trim();
    const result = await this.problemServiceRepository.generateProblems(
      prompt,
      model,
    );
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
          result,
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
    const model = data.model.trim();
    const result = await this.problemServiceRepository.generateDeepSeekproblems(
      prompt,
      model,
    );
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
          result,
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
