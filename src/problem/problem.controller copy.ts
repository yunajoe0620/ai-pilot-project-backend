import { Body, Controller, Get, Post } from '@nestjs/common';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import fetch from 'node-fetch';
import * as path from 'path';
import { AiQuestionService } from 'src/ai-question/ai-question.service';
import { AiUnitService } from 'src/ai-unit/ai-unit.service';
import { Difficulty, Question } from 'src/enum/ai-question';
import { ProblemService } from './problem.service';

const sharp = require('sharp');
const { exec } = require('child_process');

@Controller('problem')
export class ProblemController {
  constructor(
    private readonly problemServiceRepository: ProblemService,
    private readonly aiquestionServiceRepository: AiQuestionService,
    private readonly aiunitServiceRepository: AiUnitService,
  ) {}

  // 데이터 저장
  @Get('save')
  async saveProblems() {
    let school,
      grade,
      subject,
      mainCategory,
      subCategory,
      subSubCategory,
      detailCategory,
      quizSubject,
      shortProblem,
      // 난이도
      competition,
      advanced,
      highLevel,
      mediumLevel,
      lowLevel,
      gradeLevelCode,
      // 대, 중, 소, 디테일 코드
      mainCategoryId,
      subCategoryId,
      subSubCategoryId,
      detailCategoryId;

    try {
      school = '중학교';
      grade = 1;
      subject = '수학';
      mainCategory = '자연수';
      subCategory = '소수와 합성수';
      subSubCategory = '';
      detailCategory = '';
      quizSubject = `${mainCategory}${subCategory}${subSubCategory}${detailCategory}`;

      shortProblem = 5;

      // 경시대회
      competition = 0;

      // 심화
      advanced = 0;
      // 고난이도
      highLevel = 0;
      // 보통난이도
      mediumLevel = 0;

      // 기본난이도
      lowLevel = 5;
      gradeLevelCode = '21';

      let prompt = '';
      prompt = `${school} ${grade}학년 과목은${subject}이며 ${quizSubject}에 관한 주관식 문제 ${shortProblem}개를 보내줘. 
        난이도가 경시대회 수준의 문제는 ${competition}개, 심화 문제는 ${advanced}개,  고난이도 문제는 ${highLevel}개, 보통 난이도 문제는 ${mediumLevel}개, 기본 문제는 ${lowLevel}개 이고. 
        난이도 경시대회 수준의 문제, 심화 문제, 고난이도 문제, 보통 난이도 문제, 기본 문제의 갯수의 합은  ${shortProblem}갯수와 같아야 해.  
        난이도 경시대회 수준의 문제는 국제/국내 수학 경시대회 수준(IMO, KMO), 난이도가 심화 문제는 수학 올림피아트 초급 수준, 난이도가 고난이도 문제는 복합적 추론이 필요하거나, 고난이도 연산 및 응용이 요구되어야 해. 난이도가 보통 난이도 문제는 개념 응용을 묻는 문제로 계산이 필요하거나 간단한 추론을 요구되어야 해. 난이도 하 문제는 기초 개념을 직접적으로 묻는 간단한 문제  

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
              <h3 class="level">[문제 번호] [난이도: 경시대회/심화/고난이도/보통/기본] [유형: 단답형]</h3>  
              <p class="only-question">여기에 문제를 작성(MathML 코드 삽입)</p>  
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
              <h2 class="only-answer">[실제 정답 값] </h2> 
              <p class="answer-explanation">문제에 대한 해설를 출력해줘(MathML 코드 삽입)</p>  
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

      // 소분류가 마지막 일때
      if (subSubCategory) {
        subSubCategoryId =
          await this.aiunitServiceRepository.findLastCategory(subSubCategory);

        // lastCategoryId 가 없으면은, 해당 소분류유형이 없는것이므로 ai_unit테이블에 저장 (mainCategory, subCateogry, subSubCategory)
        // 이때 mainCategory랑, subCategory 도 확인을 해 봐야한다.

        // mainCategory은 동일하가 subCateogry는 틀린 경우
        // mainCategory랑 subCategory가 틀린 경우
        if (!subSubCategoryId) {
          mainCategoryId =
            await this.aiunitServiceRepository.findLastCategory(mainCategory);
          subCategoryId =
            await this.aiunitServiceRepository.findLastCategory(subCategory);
          console.log('mainCateogryID입니다아', mainCategoryId);
          console.log('subCategoryID입니다아', subCategoryId);

          // main Category은 랑 subCategory가 동일한 경우 마지막 소분류만 저장
          if (mainCategoryId && subCategoryId) {
            await this.aiunitServiceRepository.insertAiUnit({
              category_code: 'S',
              parent_unit_id: subCategoryId,
              title: subSubCategory,
              subject_code: subject,
              grade_level_code: gradeLevelCode,
              staff_name: null,
              exposure_order: 2,
            });
          }

          //대분류는 동일하고 중분류가 다른경우 중분류, 소분류만 저장
          // 이때 중분류는 같지 않으로 새롭게 ID를 얻어서 넣어줘야 한다.
          if (mainCategoryId && !subCategoryId) {
            subCategoryId = await this.aiunitServiceRepository.insertAiUnit({
              category_code: 'M',
              parent_unit_id: mainCategoryId,
              title: subCategory,
              subject_code: subject,
              grade_level_code: gradeLevelCode,
              staff_name: null,
              exposure_order: 1,
            });
            await this.aiunitServiceRepository.insertAiUnit({
              category_code: 'S',
              parent_unit_id: subCategoryId,
              title: subSubCategory,
              subject_code: subject,
              grade_level_code: gradeLevelCode,
              staff_name: null,
              exposure_order: 2,
            });
          }
          // 대분류,중분류 두개 다른 경우
          if (!mainCategoryId && !subCategoryId) {
            mainCategoryId = await this.aiunitServiceRepository.insertAiUnit({
              category_code: 'L',
              parent_unit_id: null,
              title: mainCategory,
              subject_code: subject,
              grade_level_code: gradeLevelCode,
              staff_name: null,
              exposure_order: 0,
            });
            subCategoryId = await this.aiunitServiceRepository.insertAiUnit({
              category_code: 'M',
              parent_unit_id: mainCategoryId,
              title: subCategory,
              subject_code: subject,
              grade_level_code: gradeLevelCode,
              staff_name: null,
              exposure_order: 1,
            });
            await this.aiunitServiceRepository.insertAiUnit({
              category_code: 'S',
              parent_unit_id: subCategoryId,
              title: subSubCategory,
              subject_code: subject,
              grade_level_code: gradeLevelCode,
              staff_name: null,
              exposure_order: 2,
            });
          }
        }
      }

      // 중분류가 마지막일때
      else if (subCategory) {
        mainCategoryId =
          await this.aiunitServiceRepository.findLastCategory(mainCategory);
        subCategoryId =
          await this.aiunitServiceRepository.findLastCategory(subCategory);

        // 대분류랑 중분류랑 다른경우 둘다 넣는다.
        if (!mainCategoryId && !subCategoryId) {
          mainCategoryId = await this.aiunitServiceRepository.insertAiUnit({
            category_code: 'L',
            parent_unit_id: null,
            title: mainCategory,
            subject_code: subject,
            grade_level_code: gradeLevelCode,
            staff_name: null,
            exposure_order: 0,
          });
          subCategoryId = await this.aiunitServiceRepository.insertAiUnit({
            category_code: 'M',
            parent_unit_id: mainCategoryId,
            title: subCategory,
            subject_code: subject,
            grade_level_code: gradeLevelCode,
            staff_name: null,
            exposure_order: 1,
          });
        }
        // 대분류은 같으나 중분류가 다른 경우 중분류만 넣는다
        else if (mainCategoryId && !subCategoryId) {
          await this.aiunitServiceRepository.insertAiUnit({
            category_code: 'M',
            parent_unit_id: mainCategoryId,
            title: subCategory,
            subject_code: subject,
            grade_level_code: gradeLevelCode,
            staff_name: null,
            exposure_order: 1,
          });
        }
      }

      // 대분류가 마지막일때
      else if (mainCategory) {
        // 대분류가 있는값인지 아닌값이지만 확인
        mainCategoryId =
          await this.aiunitServiceRepository.findLastCategory(mainCategory);
        if (!mainCategoryId) {
          await this.aiunitServiceRepository.insertAiUnit({
            category_code: 'L',
            parent_unit_id: null,
            title: mainCategory,
            subject_code: subject,
            grade_level_code: gradeLevelCode,
            staff_name: null,
            exposure_order: 0,
          });
        }
      }

      // unit 테이블에 데이터 저장 완료!

      // GPT한테 문제를 return해 온다
      const result = await this.problemServiceRepository.prolemSaveToDB(prompt);

      if (result.length === 0) {
        throw new Error('문제가 생성되지 않았습니다');
      }

      for (let i = 0; i < result.length; i++) {
        let value = result[i];
        const problemHtml = value.problemHtml;
        const answerHtml = value.answerHtml;
        const $problem = cheerio.load(problemHtml);
        const $answer = cheerio.load(answerHtml);
        const questionHtml = $problem('.only-question').html()?.trim(); //

        const levelText = $problem('.level').text()?.trim();
        const difficultyMatch = levelText.match(/\[난이도:\s*(.*?)\]/); // 난이도
        const typeMatch = levelText.match(/\[유형:\s*(.*?)\]/); // 유형

        const onlyAnswerHtml = $answer('.only-answer').html()?.trim();
        const answerExplanationHtml = $answer('.answer-explanation')
          .html()
          ?.trim();
        const difficultyCode = difficultyMatch?.[1] as Difficulty;
        const typeCode = typeMatch?.[1] as Question;

        await this.aiquestionServiceRepository.insertAiQuestion({
          unit_id: subSubCategoryId || subCategoryId || mainCategoryId,
          suneung_yn: 'N',
          difficulty_code: difficultyCode,
          type_code: typeCode,
          question_text: questionHtml,
          answer_text: onlyAnswerHtml,
          explanation_text: answerExplanationHtml,
          image_yn: 'N',
          wolfram_id: null,
          media_url: null,
          national_code: 'KOR',
        });
      }
    } catch (error) {
      throw error;
    }
  }

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
        prompt = `${school}${grade}학년${subject}과목에 대한 ${quizSubject}에 관한 주관식 문제 ${shortProblem}개를 보내줘. 
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
            <title>${school}${grade} ${subject} ${quizSubject} 문제 </title>  
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
      const wolframCode = `Export["output.png",
      Graphics3D[
        {
        {Opacity[0.3], Blue, InfinitePlane[{0, 0, 0}, {0, 0, 1}]},
        {Opacity[0.7], Red, Sphere[{3, -2, 4}, 4]},
        {PointSize[Large], Red, Point[{3, -2, 4}]},
        {PointSize[Large], Darker[Blue], Point[{3, -2, 0}]},
        {Thick, Green, Line[{{3, -2, 4}, {3, -2, 0}}]}
        },
        Axes -> True,
        AxesLabel -> {"x", "y", "z"},
        Boxed -> True,
        PlotRange -> {{-2, 8}, {-7, 3}, {-1, 9}}
       ]
      ]`;

      exec(
        `wolframscript -code '${wolframCode.replace(/\n/g, ' ')}'`,
        (error, stdout, stderr) => {
          if (error) {
            console.log('Wolfram Error', error);
            return;
          }
          console.log(`stdout: ${stdout}`);
          console.error(`stderr: ${stderr}`);

          const filePath = path.resolve('files', 'output.png');
        },
      );
      console.log('wolframCode', wolframCode);

      return;
      let promptArray = [
        'Graphics3D[{{Opacity[0.3], Blue, InfinitePlane[{0, 0, 0}, {0, 0, 1}]}, {Opacity[0.7], Red, Sphere[{3, -2, 4}, 4]}, {PointSize[Large], Red, Point[{3, -2, 4}]} {PointSize[Large], Darker[Blue], Point[{3, -2, 0}]}, {Thick, Green, Line[{{3, -2, 4}, {3, -2, 0}}]}}, Axes -> True,  AxesLabel -> {"x", "y", "z"},  Boxed -> True, PlotRange -> {{-2, 8}, {-7, 3}, {-1, 9}}]',
      ];

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
