import { Controller, Post, Body } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';

@Controller()
export class RecommendationsController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  @Post('recommendations')
  async create(@Body() userResponses: any) {
    const result = await this.recommendationsService.getRecommendations(userResponses);
    return { recommendation: result };
  }

  @Post('other-majors')
  async otherMajors(@Body() userResponses: any) {
    const result = await this.recommendationsService.getAlternativeMajors(userResponses);
    return { alternativeRecommendation: result };
  }

  @Post('/major-suggestion')
  async handleMajorSuggestion(@Body() body: { suggestion: string; userResponses?: any }): Promise<any> {
    const { suggestion, userResponses = {} } = body;
    const response = await this.recommendationsService.getMajorSuggestion(suggestion, userResponses);
    return response;
  }

  @Post('/additional-majors')
  async handleAdditionalMajors(@Body() body: { additionalResponses: any, originalResponses: any }): Promise<any> {
    const prompt = `
      학생이 다음과 같이 설문에 응답했습니다:
      ${JSON.stringify(body.originalResponses, null, 2)}

      추가 질문에 대한 답변:
      ${JSON.stringify(body.additionalResponses, null, 2)}

      위 답변들을 종합하여, 학생에게 더 적합한 학과를 3개 추천해 주세요.
      아래 JSON 형식으로만 출력해 주세요 (키 이름 변경하지 말 것). 불필요한 문장은 출력하지 마세요:
      {
        "recommendedAdditionalMajors": [
          {
            "major": "string",
            "reason": "string"
          },
          {
            "major": "string",
            "reason": "string"
          },
          {
            "major": "string",
            "reason": "string"
          }
        ]
      }
      `;
        return await this.recommendationsService.getAlternativeMajorsWithPrompt(prompt);
      }
    }
