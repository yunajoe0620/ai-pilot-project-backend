// import { Body, Controller, Post } from '@nestjs/common';
// import { CreateProblems } from 'src/dto/problem';
// import { PdfService } from 'src/pdf/pdf.service';
// import { ProblemService } from './problem.service';

// @Controller('problem')
// export class ProblemController {
//   constructor(
//     private readonly problemServiceRepository: ProblemService,
//     private readonly pdfServiceRepository: PdfService,
//   ) {}

//   @Post('test')
//   async createTestProblem(@Body() data: any) {
//     try {
//       const {
//         school,
//         grade,
//         subject,
//         quizSubject,
//         multipleChoice,
//         shortAnswer,
//       } = data;
//       let multipleChoiceProblem = Number(multipleChoice);
//       let shortProblem = Number(shortAnswer);
//       // 주관식
//       let subjectPrompt = `${school} ${grade}${subject}${quizSubject}에 관한 주관식 문제를 라텍스 형식으로 하나 만들어줘.
//       문제와 풀이를 아래와 같이 JSON 형식으로 담아줘
//       수학 수식이 있을때 수식 앞뒤로 $표시를 넣어줘
//         {
//           "problem": 문제,
//           "answer": 풀이
//         }
//       `;
//       const result = await this.problemServiceRepository.generateProblems(
//         subjectPrompt,
//         'gpt-4o',
//       );
//       console.log('result', result.response);
//       const jsonString = result.response
//         .replace(/```json\n/, '')
//         .replace(/```$/, '');
//       // const updatedJsonString = jsonString.replace(/\\/g, '\\\\');
//       // console.log('updated', updatedJsonString);

//       // const jsonParse = JSON.parse(updatedJsonString);
//       // console.log('문제입니다', jsonParse.problem);
//       // console.log('해설입니다', jsonParse.answer);

//       const jsonParse = JSON.parse(jsonString);
//       console.log('jsonParse', jsonParse);
//       // let editedProblem = jsonParse.problem.replaceAll(/^\\\\/g, '');
//       // let editedAnswer = jsonParse.answer.replaceAll(/^\\\\/g, '');
//       // console.log('문제입니다', editedProblem);
//       // console.log('해설입니다', editedAnswer);

//       const problemDocs = `
//         \\documentclass[fleqn]{article}
//         \\usepackage{amsmath}
//         \\usepackage{amssymb}
//         \\usepackage{fontspec}
//         \\usepackage{kotex} % 한국어 지원

//         \\begin{document}
//         ${editedProblem}
//         \\end{document}
//         `;

//       const answerDocs = `
//       \\documentclass[fleqn]{article}
//       \\usepackage{amsmath}
//       \\usepackage{amssymb}
//       \\usepackage{fontspec}
//       \\usepackage{kotex} % 한국어 지원
//       \\begin{document}
//       ${editedAnswer}
//       \\end{document}
//       `;

//       if (result && jsonParse.problem && jsonParse.answer) {
//         return {
//           status: 200,
//           message: 'AI OUTPUT이 생성 되었습니다',
//           problemDocs,
//           answerDocs,
//         };
//       }
//     } catch (error) {
//       throw error;
//     }
//   }
//   @Post('generate')
//   async createProblems(@Body() data: CreateProblems) {
//     try {
//       const prompt = data.promptData.trim();
//       const model = data.model.trim();
//       const result = await this.problemServiceRepository.generateProblems(
//         prompt,
//         model,
//       );
//       console.log('result입니당아', result);
//       const newResponse = result.response.replaceAll('#', '');
//       const [problems, answers] = newResponse.split('*****answer*****');
//       const problemDocs = `
//       \\documentclass[fleqn]{article}
//       \\usepackage{amsmath}
//       \\usepackage{amssymb}
//       \\usepackage{fontspec}
//       \\usepackage{kotex} % 한국어 지원

//       \\begin{document}
//       ${problems}
//       \\end{document}
//   `;
//       const answerDocs = `
//       \\documentclass[fleqn]{article}
//       \\usepackage{amsmath}
//       \\usepackage{amssymb}
//       \\usepackage{fontspec}
//       \\usepackage{kotex} % 한국어 지원

//       \\begin{document}
//       ${answers}
//       \\end{document}
//   `;
//       if (result.response) {
//         return {
//           status: 200,
//           message: 'AI OUTPUT이 생성 되었습니다',
//           result,
//           problemDocs,
//           answerDocs,
//         };
//       }
//       return {
//         status: 400,
//         message: 'AI OUTPUT이 제대로 생성되지 않았습니다',
//       };
//     } catch (error) {
//       throw error;
//     }
//   }

//   // for deek seek
//   @Post('generate/deekseek')
//   async createDeeakSeekProblems(@Body() data: CreateProblems) {
//     try {
//       const prompt = data.promptData.trim();
//       const model = data.model.trim();
//       const result =
//         await this.problemServiceRepository.generateDeepSeekproblems(
//           prompt,
//           model,
//         );
//       const newResponse = result.response.replaceAll('#', '');
//       const [problems, answers] = newResponse.split('*****answer*****');

//       const problemDocs = `
//       \\documentclass[fleqn]{article}
//       \\usepackage{amsmath}
//       \\usepackage{amssymb}
//       \\usepackage{fontspec}
//       \\usepackage{kotex} % 한국어 지원

//       \\begin{document}
//       ${problems}
//       \\end{document}
//   `;
//       const answerDocs = `
//      \\documentclass[fleqn]{article}
//       \\usepackage{amsmath}
//       \\usepackage{amssymb}
//       \\usepackage{fontspec}
//       \\usepackage{kotex} % 한국어 지원

//       \\begin{document}
//       ${answers}
//       \\end{document}
//   `;
//       if (result.response) {
//         return {
//           status: 200,
//           message: 'AI OUTPUT이 생성 되었습니다',
//           result,
//           problemDocs,
//           answerDocs,
//         };
//       }
//       return {
//         status: 400,
//         message: 'AI OUTPUT이 제대로 생성되지 않았습니다',
//       };
//     } catch (error) {
//       throw error;
//     }
//   }

//   @Post('generate/pdf')
//   async createPdfs(@Body() data: any) {
//     console.log('데이터어어', data.data);
//     const newResponse = data.data.replaceAll('#', '');
//     const [problems, answers] = newResponse.split('*****answer*****');
//     console.log('problems', problems);
//     const problemdocs = `
//     \\documentclass[fleqn]{article}
//     \\usepackage{amsmath}
//     \\usepackage{amssymb}
//     \\usepackage{fontspec}
//     \\usepackage{kotex} % 한국어 지원

//     \\begin{document}
//     ${problems}
//     \\end{document}
// `;
//     const answerDocs = `
//    \\documentclass[fleqn]{article}
//     \\usepackage{amsmath}
//     \\usepackage{amssymb}
//     \\usepackage{fontspec}
//     \\usepackage{kotex} % 한국어 지원

//     \\begin{document}
//     ${answers}
//     \\end{document}
// `;

//     try {
//       const problemPdfresult = await this.pdfServiceRepository.createTextFile(
//         'problemPdf',
//         problemdocs,
//       );

//       const answerPdfresult = await this.pdfServiceRepository.createTextFile(
//         'answerPdf',
//         answerDocs,
//       );

//       const isFinished = await Promise.all([problemPdfresult, answerPdfresult]);
//       if (isFinished.length === 2) {
//         return {
//           status: 200,
//           message: '문제가 제대로 생성되었습니다',
//           problemPdfresult,
//           answerPdfresult,
//         };
//       }
//       return {
//         status: 400,
//         message: '문제가 제대로 생성되지 않았습니다',
//       };
//     } catch (error) {
//       throw error;
//     }
//   }

//   // GPT OUTPUT결과값 return하기
//   @Post('generate/output')
//   async createP(@Body() data: any) {
//     try {
//       let result = data.rawOutput;
//       const newResponse = result.replaceAll('#', '');
//       const [problems, answers] = newResponse.split('*****answer*****');
//       const problemDocs = `
//        \\documentclass[fleqn]{article}
//        \\usepackage{amsmath}
//        \\usepackage{amssymb}
//        \\usepackage{fontspec}
//        \\usepackage{kotex} % 한국어 지원

//        \\begin{document}
//        ${problems}
//        \\end{document}
//    `;
//       const answerDocs = `
//        \\documentclass[fleqn]{article}
//        \\usepackage{amsmath}
//        \\usepackage{amssymb}
//        \\usepackage{fontspec}
//        \\usepackage{kotex} % 한국어 지원

//        \\begin{document}
//        ${answers}
//        \\end{document}
//    `;
//       if (result) {
//         return {
//           status: 200,
//           message: 'AI OUTPUT이 생성 되었습니다',
//           result,
//           problemDocs,
//           answerDocs,
//         };
//       }
//       return {
//         status: 400,
//         message: 'AI OUTPUT이 제대로 생성되지 않았습니다',
//       };
//     } catch (error) {
//       throw error;
//     }
//   }
// }
