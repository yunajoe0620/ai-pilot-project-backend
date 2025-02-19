import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class RecommendationsService {
  private openai: OpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not defined!');
    }
    this.openai = new OpenAI({ apiKey });
  }

  async getRecommendations(userResponses: any): Promise<any> {
    const prompt = `
학생이 다음과 같이 설문에 응답했습니다:
${JSON.stringify(userResponses, null, 2)}

이 학생의 응답을 바탕으로 아래 요구사항에 맞춰 답변해 주세요:

1) 학생의 성향과 강점을 요약 분석하고, 관심 분야와 적합한 학습 방식을 분석합니다.
2) 추천 학과 (TOP 3-5):
    - 각 학과의 특징과 추천 이유를 간단히 서술합니다.
    - 예시: 1️⃣ 컴퓨터공학과 / AI학과, 2️⃣ 수학과 / 통계학과, 3️⃣ 전자공학과 / 전기공학과 등.
3) 추천 유망 직업 (TOP 3-5):
    - 전공과 연계된 유망 직업 목록을 제시합니다.
    - 각 직업의 주요 업무, 필요한 역량 및 적합한 전공을 서술합니다.
4) 준비 전략:
    - **기술 역량**: 필수 역량(예: Python 기초, 데이터 분석, AI 프레임워크)과 선택 역량(예: 클라우드 인증, 프로젝트 관리) 제시.
    - **비즈니스 감각**: 스타트업 사례 분석, 글로벌 시장 리포트 독해 등.
    - **경험 쌓기**: 대학 내 AI 해커톤 참여, 해외 테크 컨퍼런스 네트워킹 등.

아래 JSON 형식으로만 출력해 주세요 (키 이름 변경하지 말 것). 불필요한 문장은 출력하지 마세요:

{
  "analysis": "string",
  "recommendedMajors": [
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
  ],
  "recommendedJobs": [
    {
      "jobTitle": "string",
      "description": "string",
      "requiredSkills": "string"
    }
  ],
  "preparationPlan": "string",
  "userDesiredMajorFeedback": "string",
  
}
`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful career advisor.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
      });

      if (!response.choices || response.choices.length === 0) {
        throw new Error('No choices returned from OpenAI API');
      }

      const rawContent = response.choices[0].message.content;
      let parsed;
      try {
        parsed = JSON.parse(rawContent);
      } catch (err) {
        throw new Error(`Failed to parse JSON from GPT response: ${rawContent}`);
      }

      return parsed;
    } catch (error) {
      console.error('Error with OpenAI API:', error.response?.data || error.message);
      throw error;
    }
  }

  async getAlternativeMajors(userResponses: any): Promise<any> {
    const prompt = `
      학생이 다음과 같이 설문에 응답했습니다:
      ${JSON.stringify(userResponses, null, 2)}

      위 결과를 바탕으로, 기존 추천 학과와는 다른 관점에서 추가로 대체 가능한 학과를 추천해 주세요.
      아래 JSON 형식으로만 출력해 주세요 (키 이름 변경하지 말 것). 불필요한 문장은 출력하지 마세요:

      {
        "recommendedOtherMajors": [
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

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful career advisor.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
      });

      if (!response.choices || response.choices.length === 0) {
        throw new Error('No choices returned from OpenAI API');
      }

      const rawContent = response.choices[0].message.content;
      let parsed;
      try {
        parsed = JSON.parse(rawContent);
      } catch (err) {
        throw new Error(`Failed to parse JSON from GPT response: ${rawContent}`);
      }
      return parsed;
    } catch (error) {
      console.error('Error with OpenAI API:', error.response?.data || error.message);
      throw error;
    }
  }

  async getMajorSuggestion(suggestion: string, userResponses: any): Promise<any> {
    const prompt = `
      학생이 다음과 같이 설문에 응답했습니다:
      ${JSON.stringify(userResponses, null, 2)}
      
      추가로 사용자가 원하는 학과 제안: ${suggestion}
      
      이 학생의 응답과 추가 제안을 바탕으로, 해당 학과가 학생의 성향에 적합한지 분석하고 피드백과과 추천 학과 추가로 작성해해주세요.
      아래 JSON 형식으로만 출력해 주세요 (키 이름 변경하지 말 것). 불필요한 문장은 출력하지 마세요:
      
      {
        "userDesiredMajorFeedback": "string"
      }
    `;
  
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful career advisor.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
      });
  
      if (!response.choices || response.choices.length === 0) {
        throw new Error('No choices returned from OpenAI API');
      }
  
      const rawContent = response.choices[0].message.content;
      let parsed;
      try {
        parsed = JSON.parse(rawContent);
      } catch (err) {
        throw new Error(`Failed to parse JSON from GPT response: ${rawContent}`);
      }
      return parsed;
    } catch (error) {
      console.error('Error with OpenAI API:', error.response?.data || error.message);
      throw error;
    }
  }

  async getAlternativeMajorsWithPrompt(prompt: string): Promise<any> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful career advisor.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
      });
  
      if (!response.choices || response.choices.length === 0) {
        throw new Error('No choices returned from OpenAI API');
      }
  
      const rawContent = response.choices[0].message.content;
      let parsed;
      try {
        parsed = JSON.parse(rawContent);
      } catch (err) {
        throw new Error(`Failed to parse JSON from GPT response: ${rawContent}`);
      }
      return parsed;
    } catch (error) {
      console.error('Error with OpenAI API:', error.response?.data || error.message);
      throw error;
    }
  }
  
}
