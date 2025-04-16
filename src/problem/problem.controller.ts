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
      console.log('데이터입니다아', data);
      // 주관식 문제가 있을때
      if (shortProblem > 0) {
        let subjectPrompt = `${school} ${grade}${subject}${quizSubject}에 관한 주관식 문제 ${shortProblem}개를 라텍스 형식으로 만들어줘. 
        나오는 결과값을 array 키값 quiz에 담아주고 array안에는 문제와 정답을 JSON형식으로 문제는 problem에 넣어주고. 정답은 answer에 넣어줘.
        answer에 대한 답은 answer.result, 풀이과정은 answer.explain에 넣어줘. 수학 수식은 LaTeX 형식으로 작성하고, 수식은 $기호로 감싸줘.줄내림은 하지 말아줘
        아래와 같은 형태일꺼야
        quiz: [
           {
            problem: 문제(문제앞에는 문제 번호를 쓰지 말아줘), 
            answer: {
              result: 답(오직 답만)
              explain: 문제 풀이과정
            }
          }
        ]
      `;

        const result = await this.problemServiceRepository.generateProblems(
          subjectPrompt,
          'gpt-4o',
        );
        console.log('GPT API 결과입니다아', result);
        const jsonParse = JSON.parse(result.response);
        console.log('jsonParse', jsonParse);

        jsonParse.quiz.forEach((data, i) => {
          latexShortAnswerProblems += `{\\Large \\textbf{${i + 1}}}. \\\\[1em] ${data.problem} \\\\[2em]`;
          latexShortAnswers += `{\\Large \\textbf{${i + 1}}}.\n\\\\[1em]\n\\hspace{0.5em} [정답] ${data.answer.result}\n\\\\[2em]\n\\hspace{0.5em} [해설] ${data.answer.explain}\n\\\\[2em]`;
        });
      }

      // 객관식 문제가 있을때
      // if (multipleChoiceProblem) {
      //   console.log('객관식 문제다', multipleChoiceProblem);

      //   let multiplceChoicePrompt = `${school} ${grade}${subject}${quizSubject}에 관한  객관식 문제를 만들어줘.
      //   문제와 풀이를 아래와 같이 JSON 형식으로 담아줘. JSON key는 4개로 구정되어있다. problem, answer, ANSWER(오직정답만), EXPLAIN(정답해설)
      //   수학 수식이 있을때 수식 앞뒤로 $표시를 넣어줘. LaTeX 수식을 문자열로 표현할 때, JSON 파싱을 위해 \\ 대신 $ 로 사용해 줘
      //     {
      //       "problem": 문제,
      //       "answer": {
      //         ANSWER: 정답
      //         EXPLAIN: 풀이과정해설
      //       }
      //     }
      //   `;

      //   for (let i = 1; i <= multipleChoiceProblem; i++) {
      //     const result = await this.problemServiceRepository.generateProblems(
      //       multiplceChoicePrompt,
      //       'gpt-4o',
      //     );

      //     const jsonString = result.response
      //       .replace(/```json\n/, '')
      //       .replace(/```$/, '');
      //     const jsonParse = JSON.parse(jsonString);
      //     latexMultipleChoieProblems += `\\raggedright ${i}. ${jsonParse.problem} \\\\\[2em]`;
      //     latexMultipleChoiceAnswers += `\\raggedright ${i}번의 답: ${jsonParse.answer.ANSWER} \\\\\[1em]
      //     \\raggedright ${i}번의 해설: ${jsonParse.answer.EXPLAIN} \\\\\[2em]
      //     `;
      //   }
      // }

      // 주관식 처리
      const shortAnswerformattedProblem = latexShortAnswerProblems.replace(
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
      const problemDocs = `\\documentclass[fleqn]{article}\n\\usepackage{amsmath}\n\\usepackage{amssymb}\n\\usepackage{fontspec}\n\\usepackage{kotex} % 한국어 지원\n\\begin{document}\n\\noindent\n${shortAnswerformattedProblem}${multipleChoiceformattedProblem}\n\\end{document}`;

      const answerDocs = `\\documentclass[fleqn]{article}\n\\usepackage{amsmath}\n\\usepackage{amssymb}\n\\usepackage{fontspec}\n\\usepackage{kotex} % 한국어 지원\n\\begin{document}\n\\noindent\n${latexShortAnswers}${multipleChoiceformattedAnswer}\n\\end{document}`;

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
      console.log('pdf/generate', data);
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
    const { problemDocs, answerDocs } = data;

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
