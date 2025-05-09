import { Body, Controller, Get, Post } from '@nestjs/common';
import * as fs from 'fs';
import fetch from 'node-fetch';
import * as path from 'path';
import { ProblemService } from './problem.service';
const sharp = require('sharp');

@Controller('problem')
export class ProblemController {
  constructor(private readonly problemServiceRepository: ProblemService) {}

  @Post('generate/gemini')
  async createGeminiProblem(@Body() data: any) {
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

      let multipleChoiceProblem = Number(multipleChoice);
      let shortProblem = Number(shortAnswer);
      let totalProblem = multipleChoiceProblem + shortProblem;
      let highLevel = Number(highLevelProblem);
      let mediumLevel = Number(mediumLevelProblem);
      let lowLevel = Number(lowLevelProblem);
      let prompt = '';

      // 주관식만 있고 객관식은 없을때
      if (shortProblem > 0 && multipleChoiceProblem === 0) {
        prompt = `${school} ${grade}${subject}${quizSubject}에 관한 주관식 문제 ${shortProblem}개를 보내줘. 
        난이도 상 문제는 ${highLevel}개, 중 문제는 ${mediumLevel}개, 하 문제는 ${lowLevel}개 이고. 난이도 상, 중, 하 문제 갯수의 합은 ${totalProblem}갯수와 같아야 해. 문제 난이도를 섞어서 보여줘.  
        난이도 상 문제는 복합적 추론이 필요하거나, 고난이도 연산 및 응용이 요구되어야 해. 난이도 중 문제는 개념 응용을 묻는 문제로 계산이 필요하거나 간단한 추론을 요구되어야 해. 난이도 하 문제는 기초 개념을 직접적으로 묻는 간단한 문제  

         1. 문제 생성 시 필수 사항:  
        - 각 문항의 수식은 MathML로 작성한다.  
        - MathML 생성 시, 다음 오류를 반드시 피할 것:  
          ❌ <mtable>을 <mo>, <mfenced>와 함께 사용 금지  
          ❌ <math> 태그에 xmlns 속성을 중복 선언 금지 (한 번만 맨 처음 선언)  
          ❌ <mrow> 안에 block-level 요소(<mtable>)만 있는 구조 금지  
        -세 가지 오류(&lt;mtable>과 &lt;mo>, &lt;mfenced> 함께 사용 금지, xmlns 속성 중복 선언 금지, &lt;mrow> 안에 block-level 요소만 있는 구조 금지)를 반드시 지키기
        - 모든 문항 생성 후, 각 문항의 표현이 올바른지, 계산 과정 및 답이 논리적으로 타당한지 자체적으로 점검하여 문제가 반드시 풀릴 수 있도록 검수한다.  
        - 각 문항을 HTML 파일에 넣을 때는 반드시 아래의 템플릿을 지켜서 MathJax 호환성을 유지하도록 한다.

        - 문제와 정답을 다른 HTML에 넣는다


         2. 문제 생성 시 유의 사항:  
          - MathML 수식 표기 오류 최소화 

          - 논리적으로 일관되고 풀 수 있는 문제 생성

          - 문제 난이도 명확성 증가

          - HTML 구조 오류 제거

          - 문제 출력 형식의 일관성 확보
       
         3. HTML  문제 출력 템플릿  
        <!DOCTYPE html>  
          <html lang="ko">  
          <head>  
            <meta charset="UTF-8">  
            <script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/mml-chtml.js"></script>  
            <title>${school} ${grade}${subject}${quizSubject} 문제 </title>  
          </head>  
          <body>  
            <div class="question">  
              <h3>[문제 번호] [난이도 표시: 쉬움/보통/어려움] [유형: 서술형]</h3>  
              <p>여기에 문제를 작성(MathML 코드 삽입)</p>  
              </div>  
            </body> 
        </html> 
        
        4. HTML 정답 출력 템플릿
        <!DOCTYPE html>  
          <html lang="ko">  
          <head>  
            <meta charset="UTF-8">  
            <script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/mml-chtml.js"></script>  
            <title>${school} ${grade}${subject}${quizSubject} 정답 </title>  
          </head>  
          <body>  
            <div class="answer">  
              <h3>[문제 번호] 정답: [실제 정답 값] </h3> 
              <p>문제에 대한 해설를 출력해줘(MathML 코드 삽입)</p>  
              </div>  
            </body> 
        </html> 
        5. **최종 출력 형식:**
        다음과 같은 JSON 형식으로 구조화하여 리턴해줘.
        {
          "problemHtml": "[문제 HTML 내용]",
          "answerHtml": "[정답 HTML 내용]"
        }
      `;
      }

      // 객관식만 있고 주관식을 없을 때
      else if (multipleChoiceProblem > 0 && shortProblem === 0) {
        prompt = `${school} ${grade}${subject}${quizSubject}에 관한 객관식 문제 ${multipleChoiceProblem}개를 보내줘. 
        난이도 상 문제는 ${highLevel}개, 중 문제는 ${mediumLevel}개, 하 문제는 ${lowLevel}개 이고. 난이도 상, 중, 하 문제 갯수의 합은 ${totalProblem}갯수와 같아야 해. 문제 난이도를 섞어서 보여줘.  
        난이도 상 문제는 복합적 추론이 필요하거나, 고난이도 연산 및 응용이 요구되어야 해. 난이도 중 문제는 개념 응용을 묻는 문제로 계산이 필요하거나 간단한 추론을 요구되어야 해. 난이도 하 문제는 기초 개념을 직접적으로 묻는 간단한 문제  

         1. 문제 생성 시 필수 사항:

        - 각 문항의 수식은 MathML로 작성한다.  
        - MathML 생성 시, 다음 오류를 반드시 피할 것:  
          ❌ <mtable>을 <mo>, <mfenced>와 함께 사용 금지  
          ❌ <math> 태그에 xmlns 속성을 중복 선언 금지 (한 번만 맨 처음 선언)  
          ❌ <mrow> 안에 block-level 요소(<mtable>)만 있는 구조 금지  
        - 모든 문항 생성 후, 각 문항의 표현이 올바른지, 계산 과정 및 답이 논리적으로 타당한지 자체적으로 점검하여 문제가 반드시 풀릴 수 있도록 검수한다.  
        - 각 문항을 HTML 파일에 넣을 때는 반드시 아래의 템플릿을 지켜서 MathJax 호환성을 유지하도록 한다.
        - 문제와 정답을 다른 HTML에 넣는다

         2. 문제 생성 시 유의 사항:  
          - MathML 수식 표기 오류 최소화 

          - 논리적으로 일관되고 풀 수 있는 문제 생성

          - 문제 난이도 명확성 증가

          - HTML 구조 오류 제거

          - 문제 출력 형식의 일관성 확보
       
         3.  HTML 문제 출력 템플릿  
        <!DOCTYPE html>  
          <html lang="ko">  
          <head>  
            <meta charset="UTF-8">  
            <script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/mml-chtml.js"></script>  
            <title>${school} ${grade}${subject}${quizSubject} 문제 </title>  
          </head>  
          <body>  
            <div class="question">  
              <h3>[문제 번호]. [난이도 표시: 쉬움/보통/어려움] [유형: 객관식]</h3>

              <p>여기에 문제를 작성(MathML 코드 삽입)</p>   
              <ol type="①">

                <li>보기1(MathML)</li>

                <li>보기2(MathML)</li>

                <li>보기3(MathML)</li>

                <li>보기4(MathML)</li>

                <li>보기5(MathML)</li>

                </ol>  
                </div>  
            </body> 
        </html> 
        4. HTML 정답 출력 템플릿
        <!DOCTYPE html>  
          <html lang="ko">  
          <head>  
            <meta charset="UTF-8">  
            <script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/mml-chtml.js"></script>  
            <title>${school} ${grade}${subject}${quizSubject} 정답 </title>  
          </head>  
          <body>  
            <div class="answer">  
              <h3>[문제 번호] 정답: [실제 정답 값]</h3> 
              <p>해설(MathML 코드 삽입)</p>  
              </div>  
            </body> 
        </html> 
      5. **최종 출력 형식:**
        다음과 같은 JSON 형식으로 구조화하여 리턴해줘.
        {
          "problemHtml": "[문제 HTML 내용]",
          "answerHtml": "[정답 HTML 내용]"
        }    
      `;
      }
      // 주관식이랑 객관식 둘다 있을 때
      else if (shortProblem > 0 && multipleChoiceProblem > 0) {
        prompt = `${school} ${grade}${subject}${quizSubject}에 관한 객관식 문제 ${multipleChoiceProblem}개와 주관식 문제 ${shortProblem}를 랜덤으로 섞어서 보내줘. 
        난이도 상 문제는 ${highLevel}개, 중 문제는 ${mediumLevel}개, 하 문제는 ${lowLevel}개 이고. 난이도 상, 중, 하 문제 갯수의 합은 ${totalProblem}갯수와 같아야 해. 문제 난이도를 섞어서 보여줘.  
        난이도 상 문제는 복합적 추론이 필요하거나, 고난이도 연산 및 응용이 요구되어야 해. 난이도 중 문제는 개념 응용을 묻는 문제로 계산이 필요하거나 간단한 추론을 요구되어야 해. 난이도 하 문제는 기초 개념을 직접적으로 묻는 간단한 문제  

         1. 문제 생성 시 필수 사항:

        - 각 문항의 수식은 MathML로 작성한다.  
        - MathML 생성 시, 다음 오류를 반드시 피할 것:  
          ❌ <mtable>을 <mo>, <mfenced>와 함께 사용 금지  
          ❌ <math> 태그에 xmlns 속성을 중복 선언 금지 (한 번만 맨 처음 선언)  
          ❌ <mrow> 안에 block-level 요소(<mtable>)만 있는 구조 금지  
        - 모든 문항 생성 후, 각 문항의 표현이 올바른지, 계산 과정 및 답이 논리적으로 타당한지 자체적으로 점검하여 문제가 반드시 풀릴 수 있도록 검수한다.  
        - 각 문항을 HTML 파일에 넣을 때는 반드시 아래의 템플릿을 지켜서 MathJax 호환성을 유지하도록 한다.
        - 문제와 정답을 다른 HTML에 넣는다

         2. 문제 생성 시 유의 사항:  
          - MathML 수식 표기 오류 최소화 

          - 논리적으로 일관되고 풀 수 있는 문제 생성

          - 문제 난이도 명확성 증가

          - HTML 구조 오류 제거

          - 문제 출력 형식의 일관성 확보
       
         3.  HTML 문제 출력 템플릿  
        <!DOCTYPE html>  
          <html lang="ko">  
          <head>  
            <meta charset="UTF-8">  
            <script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/mml-chtml.js"></script>  
            <title>${school} ${grade}${subject}${quizSubject} 문제 </title>  
          </head>  
          <body>  
            <div class="question">  
              <h3>[문제 번호]. [난이도 표시: 쉬움/보통/어려움] [유형: 객관식/주관식]</h3>    
              <p>여기에 문제를 작성(MathML 코드 삽입)</p>   

              <!-- 아래는 객관식일때 추가하는 부분 -->            
              <ol type="①">  
                <li>보기1(MathML)</li>

                <li>보기2(MathML)</li>

                <li>보기3(MathML)</li>

                <li>보기4(MathML)</li>

                <li>보기5(MathML)</li>

                </ol>  
              </div>  
            </body> 
        </html>    

      4. HTML 정답 출력 템플릿
        <!DOCTYPE html>  
          <html lang="ko">  
          <head>  
            <meta charset="UTF-8">  
            <script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/mml-chtml.js"></script>  
            <title>${school} ${grade}${subject}${quizSubject} 정답 </title>  
          </head>  
          <body>  
            <div class="answer">  
              <h3>[문제 번호] 정답: [실제 정답 값]</h3> 
              <p>해설(MathML 코드 삽입)</p>  
              </div>  
            </body> 
        </html>

        5. **최종 출력 형식:**
        다음과 같은 JSON 형식으로 구조화하여 리턴해줘.
        {
          "problemHtml": "[문제 HTML 내용]",
          "answerHtml": "[정답 HTML 내용]"
        }
      `;
      }
      const result =
        await this.problemServiceRepository.generateGeminiProblemsWithHtmlFormat(
          prompt,
        );

      const { problemHtml, answerHtml } = result;

      const cleanedproblemHtml = problemHtml
        .replace(/^```html\s*/, '')
        .replace(/```$/, '');

      const cleanedanswerHtml = answerHtml
        .replace(/^```html\s*/, '')
        .replace(/```$/, '');

      if (problemHtml && answerHtml) {
        return {
          status: 200,
          cleanedproblemHtml,
          cleanedanswerHtml,
        };
      }
      return {
        status: 400,
        cleanedproblemHtml: null,
        cleanedanswerHtml: null,
      };
    } catch (error) {
      throw error;
    }
  }

  @Post('wolfram')
  async createWolframProblem(@Body() data: any) {
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

    let multipleChoiceProblem = Number(multipleChoice);
    let shortProblem = Number(shortAnswer);
    let totalProblem = multipleChoiceProblem + shortProblem;
    let highLevel = Number(highLevelProblem);
    let mediumLevel = Number(mediumLevelProblem);
    let lowLevel = Number(lowLevelProblem);

    try {
      //  수학공식을
      let promptArray = [
        'Plot[x^3, {x, -10, 10}]',
        'Plot[Power[x,3] - 6Power[x,2] + 4x + 12]',
        'Plot[Log[x], {x, 0.1, 10}]',
        'ParametricPlot[{Cos[t]^3, Sin[t]^3}, {t, 0, 2 Pi}]',
        'ParametricPlot[{Sin[t], Sin[2 t]}, {t, 0, 2 Pi}]',
      ];
      // 아래는 안된다. 흠
      // let promptArray = [
      //   'Graphics3D[{{Opacity[0.3], Blue, InfinitePlane[{0, 0, 0}, {0, 0, 1}]}, {Opacity[0.7], Red, Sphere[{3, -2, 4}, 4]}, {PointSize[Large], Red, Point[{3, -2, 4}]} {PointSize[Large], Darker[Blue], Point[{3, -2, 0}]}, {Thick, Green, Line[{{3, -2, 4}, {3, -2, 0}}]}}, Axes -> True,  AxesLabel -> {"x", "y", "z"},  Boxed -> True, PlotRange -> {{-2, 8}, {-7, 3}, {-1, 9}}]',
      // ];

      const result =
        await this.problemServiceRepository.generateWolframProblems(
          promptArray,
        );

      for (let [index, obj] of result.entries()) {
        const { newImageSrc, formula } = obj;
        console.log('새로운 ImageSrc:', newImageSrc);

        try {
          const imageResponse = await fetch(newImageSrc);
          const buffer = await imageResponse.buffer();
          if (buffer.length === 0) {
            console.warn(`${index}.png: buffer가 비어 있음`);
            continue;
          }
          const filePath = path.resolve('files', `${index}.png`);
          const pngStylePics = await sharp(buffer).png().toBuffer();
          fs.writeFileSync(filePath, pngStylePics);

          console.log(`${index}.png 저장 완료`);
        } catch (err) {
          console.log('에러이다아', err);
        }
      }
      // 문제들 담는 HTML
      let problemPrompt = ``;
      let answerPrompt = ``;
      let finalPrompt = `
        1. 문제 생성 시 필수 사항:
         - 각 문항의 수식은 MathML로 작성한다.
         - MathML 생성 시, 다음 오류를 반드시 피할 것:
          ❌ <mtable>을 <mo>, <mfenced>와 함께 사용 금지
          ❌ <math> 태그에 xmlns 속성을 중복 선언 금지 (한 번만 맨 처음 선언)
          ❌ <mrow> 안에 block-level 요소(<mtable>)만 있는 구조 금지
        - 모든 문항 생성 후, 각 문항의 표현이 올바른지, 계산 과정 및 답이 논리적으로 타당한지 자체적으로 점검하여 문제가 반드시 풀릴 수 있도록 검수한다.
        - 각 문항을 HTML 파일에 넣을 때는 반드시 아래의 템플릿을 지켜서 MathJax 호환성을 유지하도록 한다.
        - 이미지 주소를 img태그 안에  넣어 이미지를 나타나게 한다.

        - 문제와 정답을 다른 HTML에 넣는다

        2. 문제 생성 시 유의 사항:
        - MathML 수식 표기 오류 최소화
        - 논리적으로 일관되고 풀 수 있는 문제 생성
        - 문제 난이도 명확성 증가
        - HTML 구조 오류 제거
        - 문제 출력 형식의 일관성 확보          
        출력형태는 아래와 같다.       
    
        `;
      let fileUrl;
      result.forEach((item, index) => {
        const { formula, ImageSrc } = item;

        fileUrl = `http://localhost:5000/files/${index}.png`;

        const problemNumber = index + 1;
        problemPrompt += `이 이미지들은수학 그래프입니다. 이 이미지와 어울리는 문제를 만들어주세요.
          아래 템플릿 형식은 각각 문제의 템플릿 형식
          <div class="question">
            <h3>문제 ${problemNumber} [난이도 표시: 어려움/보통/쉬움] [유형: 서술형/객관형]</h3>
            <img src=${fileUrl} width="300" height="300" crossorigin="anonymous">
            <p>여기에 문제를 작성(MathML 코드 삽입)</p>
          </div>  
        `;
        answerPrompt += `문제마다의 정답과 해설 템플릿형식
          <div class="answer">
            <h3>문제 ${problemNumber} 정답: [실제 정답 값] </h3>
            <p>문제에 대한 해설을 출력해줘(MathML 코드 삽입)</p>
          </div>
        `;
      });
      finalPrompt += `
       3. HTML 문제 출력 템플릿 
      <!DOCTYPE html>  
       <html lang="ko">
        <head>  
            <meta charset="UTF-8">  
            <script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/mml-chtml.js"></script>  
            <title>${school} ${grade}${subject}${quizSubject} 문제 </title>  
        </head>     
        <div class="question-container">
            ${problemPrompt}   
        </div>
      </html>
      `;
      finalPrompt += `
       4. HTML 정답 출력 템플릿 
      <!DOCTYPE html>
      <html lang="ko">
      <head>  
        <meta charset="UTF-8">  
        <script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/mml-chtml.js"></script>  
        <title>${school} ${grade}${subject}${quizSubject} 정답 </title>  
      </head> 
      <div class="answer-container">
          ${problemPrompt}   
       </div>
      </html>
       `;

      const problempromptResponse =
        await this.problemServiceRepository.generateGeminiProblemsWithHtmlFormat(
          finalPrompt,
        );

      const { problemHtml, answerHtml } = problempromptResponse;

      if (problemHtml && answerHtml) {
        return {
          status: 200,
          cleanedproblemHtml: problemHtml,
          cleanedanswerHtml: answerHtml,
        };
      }
      return {
        status: 400,
        cleanedproblemHtml: null,
        cleanedanswerHtml: null,
      };
    } catch (error) {
      throw error;
    }
  }

  // 비슷한문제 output
  @Get('generation/similar-problems')
  async generateSimilarProblems() {
    let prompt = `
    너는 아래 명시한 조건을 엄격하게 준수하여, 첨부와 유사한 문제 5개를 생성한다.

📝 문제 구성 조건 (총 5문항):
- 쉬운 난이도: 기초 개념을 직접적으로 묻는 간단한 문제 (2문항)
- 보통 난이도: 개념 응용을 묻는 문제로 계산이 필요하거나 간단한 추론을 요구 (2문항)
- 어려운 난이도: 복합적 추론이 필요하거나, 고난이도 연산 및 응용이 요구됨 (1문항)

🔖 문제 형식:
- 객관식: 문제 본문 + 보기(①~⑤) 구성. 보기 중 정답은 반드시 하나.
- 서술형: 풀이 과정을 요구하는 문제로, 답만 나오는 문제 금지.

📐 문제 생성 시 필수 사항:
      - 각 문항의 수식은 MathML로 작성한다.
      - MathML 생성 시, 다음 오류를 반드시 피할 것:
        ❌ <mtable>을 <mo>, <mfenced>와 함께 사용 금지
        ❌ <math> 태그에 xmlns 속성을 중복 선언 금지 (한 번만 맨 처음 선언)
        ❌ <mrow> 안에 block-level 요소(<mtable>)만 있는 구조 금지
      - 모든 문항 생성 후, 각 문항의 표현이 올바른지, 계산 과정 및 답이 논리적으로 타당한지 자체적으로 점검하여 문제가 반드시 풀릴 수 있도록 검수한다.
      - 각 문항을 HTML 파일에 넣을 때는 반드시 아래의 템플릿을 지켜서 MathJax 호환성을 유지하도록 한다.

      📐 문제 생성 시 유의 사항:
      - MathML 수식 표기 오류 최소화
      - 논리적으로 일관되고 풀 수 있는 문제 생성
      - 문제 난이도 명확성 증가
      - HTML 구조 오류 제거
      - 문제 출력 형식의 일관성 확보
      - 유사한 문제를 숫자만 바꾼 문제가 아니라 응용해서 조금씩 다르게 생성
    `;
    try {
      const response =
        await this.problemServiceRepository.generateSimilarProblems(prompt);
    } catch (error) {
      throw error;
    }
  }
}
