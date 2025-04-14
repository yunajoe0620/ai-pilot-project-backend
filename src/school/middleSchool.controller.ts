import { Body, Controller, Post } from '@nestjs/common';
import { MiddleSchoolService } from './middleSchool.service';

@Controller('middleSchool')
export class MiddleSchoolontroller {
  constructor(
    private readonly middleSchoolServiceRepository: MiddleSchoolService,
  ) {}

  @Post('math/ThePowersOfNaturalNumbers')
  async createThePowersOfNaturalNumbers(@Body() data: any) {
    let latexShortAnswerProblems = '';
    let latexShortAnswers = '';
    let latexMultipleChoiceProblems = '';
    let latexMultipleChoiceAnswers = '';
    const { multipleChoice, shortAnswer } = data;
    let multipleChoiceProblem = Number(multipleChoice);

    let shortProblem = Number(shortAnswer);

    // 주관식
    for (let i = 1; i <= shortProblem; i++) {
      const response =
        await this.middleSchoolServiceRepository.generateThePowersOfNaturalNumbers();
      const { problem, answer } = response;
      latexShortAnswerProblems += `\\raggedright ${i}. ${problem}의 제곱 값은? \\\\`;
      latexShortAnswers += `\\raggedright ${i}번의 답:. ${answer} \\\\\n`;
    }
    // 객관식
    for (
      let i = shortProblem + 1;
      i <= multipleChoiceProblem + shortProblem;
      i++
    ) {
      const response =
        await this.middleSchoolServiceRepository.generateThePowersOfNaturalNumbers();
      const { problem, answer } = response;

      let randomNum = Math.floor(Math.random() * 5);
      let choices = [];
      while (choices.length < 4) {
        let wrongAnswer = Math.floor(Math.random() * 1000) + 1;
        if (wrongAnswer !== answer && !choices.includes(wrongAnswer)) {
          choices = [...choices, wrongAnswer];
        }
      }
      choices.splice(randomNum, 0, answer);

      latexMultipleChoiceProblems += `\\noindent${i}. ${problem}의 제곱 값은? \\\\
    \\raggedright \\hspace{0.5em}1) ${choices[0]} \\\\
    \\raggedright \\hspace{0.5em}2) ${choices[1]} \\\\
    \\raggedright \\hspace{0.5em}3) ${choices[2]} \\\\
    \\raggedright \\hspace{0.5em}4) ${choices[3]} \\\\
    \\raggedright \\hspace{0.5em}5) ${choices[4]} \\\\
    `;
      latexMultipleChoiceAnswers += `\\raggedright ${i}번의 답: ${randomNum + 1} \\\\\n`;
    }

    const problemDocs = `
      \\documentclass[fleqn]{article}      
      \\usepackage{amsmath}
      \\usepackage{amssymb} 
      \\usepackage{fontspec}
      \\usepackage{kotex} % 한국어 지원  

      \\begin{document}
  
      \\raggedright${latexShortAnswerProblems}\\   
      \\raggedright${latexMultipleChoiceProblems}\\         
      
      \\end{document} 
      `;

    const answerDocs = `
      \\documentclass[fleqn]{article}      
      \\usepackage{amsmath}
      \\usepackage{amssymb} 
      \\usepackage{fontspec}
      \\usepackage{kotex} % 한국어 지원  

      \\begin{document}
  
      \\raggedright ${latexShortAnswers}\\ 
      \\raggedright ${latexMultipleChoiceAnswers}\\         
        
      \\end{document} 
      `;

    if (latexShortAnswerProblems) {
      return {
        status: 200,
        message: 'AI OUTPUT이 생성 되었습니다',
        problemDocs,
        answerDocs,
      };
    }
  }
}
