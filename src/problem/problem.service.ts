const dotenv = require('dotenv');

import OpenAI from 'openai';
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const deepSeekOpenAI = new OpenAI({
  baseURL: process.env.DEEP_SEEK_BASE_URL,
  apiKey: process.env.DEEP_SEEK_API_KEY,
});

export class ProblemService {
  async generateProblems(prompt: string, model: string) {
    console.log('선택한 gpt Model', model);
    const response = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: 'developer',
          content: [
            {
              type: 'text',
              text: `
                  You are a helpful assistant that answers in korean                  
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
      store: true,
    });

    return {
      response: response.choices[0].message.content,
    };
  }

  // for deepseek
  async generateDeepSeekproblems(prompt: string, model: string) {
    console.log('선택한 deepSeek Model', model);
    const response = await deepSeekOpenAI.chat.completions.create({
      model: model,
      messages: [
        {
          role: 'system',
          content: [
            {
              type: 'text',
              text: `
                  You are a helpful assistant that answers in korean                  
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
      store: true,
    });

    return {
      response: response.choices[0].message.content,
    };
  }
}
