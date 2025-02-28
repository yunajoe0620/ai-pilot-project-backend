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
    // gpt 결과값
    const result = await this.problemServiceRepository.generateProblems(prompt);
    const newResponse = result.response.replaceAll('#', '');
    // console.log('newResponse', newResponse);
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

    // gpt결과값에 의한 pdf결과값

    try {
      const pdfresult = await this.pdfServiceRepository.createTextFile(
        'pdfFile',
        problemdocs,
        answerDocs,
      );
      console.log('pdfResult', pdfresult);
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
