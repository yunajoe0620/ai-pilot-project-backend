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

  @Post('wolfram')
  async createWolframProblem(@Body() data: any) {
    const { school, grade, subject, quizSubject, multipleChoice, shortAnswer } =
      data;
    let subjectPrompt = `${school} ${grade}${subject}${quizSubject}`;
    try {
      const result =
        await this.problemServiceRepository.generateWolframProblems(
          subjectPrompt,
        );
    } catch (error) {
      throw error;
    }
  }
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
        highLevelProblem,
        mediumLevelProblem,
        lowLevelProblem,
      } = data;
      console.log('test API를 눌렀습니다.');
      let multipleChoiceProblem = Number(multipleChoice);
      let shortProblem = Number(shortAnswer);
      let totalProblem = multipleChoiceProblem + shortProblem;
      let highLevel = Number(highLevelProblem);
      let mediumLevel = Number(mediumLevelProblem);
      let lowLevel = Number(lowLevelProblem);

      let latexShortAnswerProblems = '';
      let latexShortAnswers = '';
      let latexMultipleChoieProblems = '';
      let latexMultipleChoieOptions = '';
      let latexMultipleChoiceAnswers = '';
      // 주관식 문제가 있을때
      if (shortProblem > 0) {
        let subjectPrompt = `${school} ${grade}${subject}${quizSubject}에 관한 주관식 문제 ${shortProblem}개를 보내줘. 
        나오는 결과값을 array 키값 quiz에 담아주고 array안에는 문제와 정답을 JSON형식으로 문제는 problem에 넣어주고. 정답은 answer에 넣어줘. 문제에 대한 난이도는 level에 넣어줘
        난이도 상 문제는 ${highLevel}개, 중 문제는 ${mediumLevel}개, 하 문제는 ${lowLevel}개 이고. 난이도 상, 중, 하 문제 갯수의 합은 ${totalProblem}갯수와 같아야 해. 문제 난이도를 섞어서 보여줘.  
        난이도 상 문제는 복합적 추론이 필요하거나, 고난이도 연산 및 응용이 요구되어야 해. 난이도 중 문제는 개념 응용을 묻는 문제로 계산이 필요하거나 간단한 추론을 요구되어야 해. 난이도 하 문제는 기초 개념을 직접적으로 묻는 간단한 문제

        answer에 대한 답은 answer.result, 풀이과정은 answer.explain에 넣어줘. 수학 수식은 LaTeX 형식으로 작성하고, 수식은 $기호로 감싸줘
        아래와 같은 형태일꺼야. 
        quiz: [
           {
            level: 문제난이도(상, 중, 하 로만 표시)
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
          'gpt-4o-mini',
        );

        const jsonParse = JSON.parse(result.response);

        jsonParse.quiz.forEach((data, i) => {
          latexShortAnswerProblems += `${i + 1} 난이도: ${data.level}\n ${data.problem}\n\n`;
          latexShortAnswers += `${i + 1}\n [정답] ${data.answer.result}\n ${data.answer.explain}\n\n`;
        });

        // 마크다운 파일을 만든다. 성공적으로 만들었으면 status 200
        const response =
          await this.problemServiceRepository.generateMarkDownFile(
            latexShortAnswerProblems,
            'problemMarkdown',
          );

        if (response.status === 200) {
          // markdown file에서 latex 파일로 변환하는 method. 성곡곡
          const result1: any =
            await this.problemServiceRepository.convertMarkDownToLatex(
              'problemMarkdown',
              'problem',
            );
          const { status, filename } = result1;

          // latex로 잘 생성이 되었다면은
          if (status === 200) {
            const problemPdfresult: any =
              await this.pdfServiceRepository.createTextFileTwo(filename);
            console.log('pdfResult', problemPdfresult);
            return {
              problemfilename: problemPdfresult.filename,
              status: problemPdfresult.status,
              message: problemPdfresult.message,
            };
          }
        } else {
          return {
            status: response.status,
            message: response.message,
          };
        }
      }

      return;

      // 주관식 처리
      const shortAnswerformattedProblem = latexShortAnswerProblems
        .replaceAll(/[\r\n]+/g, '')
        .replaceAll('/\beq\b/g', '=')
        .replaceAll('/\bext\b/g', '\\text');

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
