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

  @Post('test')
  async createTestProblem(@Body() data: any) {
    try {
      const {
        school,
        grade,
        subject,
        quizSubject,
        multipleChoice,
        shortAnswer,
      } = data;
      let multipleChoiceProblem = Number(multipleChoice);
      let shortProblem = Number(shortAnswer);
      let latexShortAnswerProblems = '';
      let latexShortAnswers = '';
      let latexMultipleChoieProblems = '';
      let latexMultipleChoiceAnswers = '';
      // 주관식 문제가 있을때
      if (shortProblem > 0) {
        let subjectPrompt = `${school} ${grade}${subject}${quizSubject}에 관한 주관식 문제를 라텍스 형식으로 하나 만들어줘.
        문제와 풀이를 아래와 같이 JSON 형식으로 담아줘. JSON key는 4개로 구정되어있다. problem, answer, ANSWER(오직정답만), EXPLAIN(정답해설)
        수학 수식이 있을때 수식 앞뒤로 $표시를 넣어줘.  JSON parsing을 위해 잘 보내줘
          {
            "problem": 문제,
            "answer": {
              ANSWER: 정답
              EXPLAIN: 풀이과정해설
            }
          }
        `;
        for (let i = 1; i <= shortProblem; i++) {
          const result = await this.problemServiceRepository.generateProblems(
            subjectPrompt,
            'gpt-4o',
          );

          console.log('result입니다', result);
          const jsonString = result.response
            .replace(/```json\n/, '')
            .replace(/```javascript\n/, '')
            .replace(/```$/, '');
          const jsonParse = JSON.parse(jsonString);
          latexShortAnswerProblems += `\\raggedright {\\Large \\textbf{${i}}}. \\\\\[1em] ${jsonParse.problem} \\\\\[2em]`;
          latexShortAnswers += `\\raggedright {\\Large \\textbf{${i}}}. \\\\\[1em]
          \\raggedright \\hspace{0.5em} [정답] ${jsonParse.answer.ANSWER} \\\\\
          \\raggedright \\hspace{0.5em} [해설] ${jsonParse.answer.EXPLAIN} \\\\\[2em]
          `;
        }
      }
      // 객관식 문제가 있을때
      if (multipleChoiceProblem) {
        console.log('객관식 문제다', multipleChoiceProblem);

        let multiplceChoicePrompt = `${school} ${grade}${subject}${quizSubject}에 관한  객관식 문제를 만들어줘. 
        문제와 풀이를 아래와 같이 JSON 형식으로 담아줘. JSON key는 4개로 구정되어있다. problem, answer, ANSWER(오직정답만), EXPLAIN(정답해설)
        수학 수식이 있을때 수식 앞뒤로 $표시를 넣어줘. LaTeX 수식을 문자열로 표현할 때, JSON 파싱을 위해 \\ 대신 $ 로 사용해 줘
          {
            "problem": 문제, 
            "answer": {
              ANSWER: 정답
              EXPLAIN: 풀이과정해설
            }
          }       
        `;

        for (let i = 1; i <= multipleChoiceProblem; i++) {
          const result = await this.problemServiceRepository.generateProblems(
            multiplceChoicePrompt,
            'gpt-4o',
          );

          console.log('result2222222입니다', result);
          const jsonString = result.response
            .replace(/```json\n/, '')
            .replace(/```$/, '');
          const jsonParse = JSON.parse(jsonString);
          latexMultipleChoieProblems += `\\raggedright ${i}. ${jsonParse.problem} \\\\\[2em]`;
          latexMultipleChoiceAnswers += `\\raggedright ${i}번의 답: ${jsonParse.answer.ANSWER} \\\\\[1em]
          \\raggedright ${i}번의 해설: ${jsonParse.answer.EXPLAIN} \\\\\[2em]
          `;
        }
      }

      // 주관식 처리
      const shortAnswerformattedProblem = latexShortAnswerProblems.replace(
        /[\r\n]+/g,
        '',
      );
      const shortAnswerformattedAnswer = latexShortAnswers.replace(
        /[\r\n]+/g,
        '',
      );

      // 객관식 처리
      const multipleChoiceformattedProblem = latexMultipleChoieProblems.replace(
        /[\r\n]+/g,
        '',
      );
      const multipleChoiceformattedAnswer = latexMultipleChoiceAnswers.replace(
        /[\r\n]+/g,
        '',
      );
      const problemDocs = `
        \\documentclass[fleqn]{article}
        \\usepackage{amsmath}
        \\usepackage{amssymb}
        \\usepackage{fontspec}
        \\usepackage{kotex} % 한국어 지원

        \\begin{document} 
        ${shortAnswerformattedProblem}
        ${multipleChoiceformattedProblem}
        \\end{document}
        `;

      const answerDocs = `
      \\documentclass[fleqn]{article}
      \\usepackage{amsmath}
      \\usepackage{amssymb}
      \\usepackage{fontspec}
      \\usepackage{kotex} % 한국어 지원
      \\begin{document}
      ${shortAnswerformattedAnswer}
      ${multipleChoiceformattedAnswer}
      \\end{document}
      `;

      if (problemDocs && answerDocs) {
        return {
          status: 200,
          message: 'AI OUTPUT이 생성 되었습니다',
          problemDocs,
          answerDocs,
        };
      }
      return {
        status: 400,
        message: 'AI OUTPUT이 생성에 실패하였습니다.',
      };
    } catch (error) {
      throw error;
    }
  }
  @Post('generate')
  async createProblems(@Body() data: CreateProblems) {
    try {
      const prompt = data.promptData.trim();
      const model = data.model.trim();
      const result = await this.problemServiceRepository.generateProblems(
        prompt,
        model,
      );
      console.log('result입니당아', result);
      const newResponse = result.response.replaceAll('#', '');
      const [problems, answers] = newResponse.split('*****answer*****');
      const problemDocs = `
      \\documentclass[fleqn]{article}      
      \\usepackage{amsmath}
      \\usepackage{amssymb} 
      \\usepackage{fontspec}
      \\usepackage{kotex} % 한국어 지원  

      \\begin{document}      
      ${problems}      
      \\end{document} 
  `;
      const answerDocs = `
      \\documentclass[fleqn]{article}      
      \\usepackage{amsmath}
      \\usepackage{amssymb} 
      \\usepackage{fontspec}
      \\usepackage{kotex} % 한국어 지원  

      \\begin{document}      
      ${answers}      
      \\end{document} 
  `;
      if (result.response) {
        return {
          status: 200,
          message: 'AI OUTPUT이 생성 되었습니다',
          result,
          problemDocs,
          answerDocs,
        };
      }
      return {
        status: 400,
        message: 'AI OUTPUT이 제대로 생성되지 않았습니다',
      };
    } catch (error) {
      throw error;
    }
  }

  // for deek seek
  @Post('generate/deekseek')
  async createDeeakSeekProblems(@Body() data: CreateProblems) {
    try {
      const prompt = data.promptData.trim();
      const model = data.model.trim();
      const result =
        await this.problemServiceRepository.generateDeepSeekproblems(
          prompt,
          model,
        );
      const newResponse = result.response.replaceAll('#', '');
      const [problems, answers] = newResponse.split('*****answer*****');

      const problemDocs = `
      \\documentclass[fleqn]{article}      
      \\usepackage{amsmath}
      \\usepackage{amssymb} 
      \\usepackage{fontspec}
      \\usepackage{kotex} % 한국어 지원  
  
      \\begin{document}      
      ${problems}      
      \\end{document} 
  `;
      const answerDocs = `
     \\documentclass[fleqn]{article}      
      \\usepackage{amsmath}
      \\usepackage{amssymb} 
      \\usepackage{fontspec}
      \\usepackage{kotex} % 한국어 지원  
  
      \\begin{document}      
      ${answers}      
      \\end{document} 
  `;
      if (result.response) {
        return {
          status: 200,
          message: 'AI OUTPUT이 생성 되었습니다',
          result,
          problemDocs,
          answerDocs,
        };
      }
      return {
        status: 400,
        message: 'AI OUTPUT이 제대로 생성되지 않았습니다',
      };
    } catch (error) {
      throw error;
    }
  }

  @Post('generate/pdf')
  async createPdfs(@Body() data: any) {
    console.log('데이터어어', data.data);
    const newResponse = data.data.replaceAll('#', '');
    const [problems, answers] = newResponse.split('*****answer*****');
    console.log('problems', problems);
    const problemdocs = `
    \\documentclass[fleqn]{article}      
    \\usepackage{amsmath}
    \\usepackage{amssymb} 
    \\usepackage{fontspec}
    \\usepackage{kotex} % 한국어 지원  

    \\begin{document}      
    ${problems}      
    \\end{document} 
`;
    const answerDocs = `
   \\documentclass[fleqn]{article}      
    \\usepackage{amsmath}
    \\usepackage{amssymb} 
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

  // GPT OUTPUT결과값 return하기
  @Post('generate/output')
  async createP(@Body() data: any) {
    try {
      let result = data.rawOutput;
      const newResponse = result.replaceAll('#', '');
      const [problems, answers] = newResponse.split('*****answer*****');
      const problemDocs = `
       \\documentclass[fleqn]{article}      
       \\usepackage{amsmath}
       \\usepackage{amssymb} 
       \\usepackage{fontspec}
       \\usepackage{kotex} % 한국어 지원  
 
       \\begin{document}      
       ${problems}      
       \\end{document} 
   `;
      const answerDocs = `
       \\documentclass[fleqn]{article}      
       \\usepackage{amsmath}
       \\usepackage{amssymb} 
       \\usepackage{fontspec}
       \\usepackage{kotex} % 한국어 지원  
 
       \\begin{document}      
       ${answers}      
       \\end{document} 
   `;
      if (result) {
        return {
          status: 200,
          message: 'AI OUTPUT이 생성 되었습니다',
          result,
          problemDocs,
          answerDocs,
        };
      }
      return {
        status: 400,
        message: 'AI OUTPUT이 제대로 생성되지 않았습니다',
      };
    } catch (error) {
      throw error;
    }
  }
}
