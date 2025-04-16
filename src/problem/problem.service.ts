import OpenAI from 'openai';
const WolframAlphaAPI = require('wolfram-alpha-api');
const waApi = WolframAlphaAPI(process.env.WOLFRAM_ALPHA_APP_KEY);
const dotenv = require('dotenv');

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const deepSeekOpenAI = new OpenAI({
  baseURL: process.env.DEEP_SEEK_BASE_URL,
  apiKey: process.env.DEEP_SEEK_API_KEY,
});

export class ProblemService {
  async generateWolframProblems() {
    try {
      const response = await waApi.getFull('show me the function graphq');
    } catch (error) {
      throw error;
    }
  }

  async generateProblems(prompt: string, model: string) {
    try {
      const response = await openai.chat.completions.create({
        model: model,
        messages: [
          {
            role: 'system',
            content: [
              {
                type: 'text',
                text: `
                    You are a math tutor that answers in korean                  
                  `,
              },
            ],
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt,
              },
            ],
          },
        ],
        response_format: {
          type: 'json_object',
        },
        temperature: 0.7,
      });
      return {
        response: response.choices[0].message.content,
      };
    } catch (error) {
      throw error;
    }
  }

  // for deepseek
  async generateDeepSeekproblems(prompt: string, model: string) {
    try {
      const response = await deepSeekOpenAI.chat.completions.create({
        model: model,
        messages: [
          {
            role: 'system',
            content: [
              {
                type: 'text',
                text: `
                    You are a math tutor that answers in korean                  
                  `,
              },
            ],
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt,
              },
            ],
          },
        ],
      });
      return {
        response: response.choices[0].message.content,
      };
    } catch (error) {
      throw error;
    }
  }
}
