const dotenv = require('dotenv');

import OpenAI from 'openai';
dotenv.config();

// C:\Users\yunaj\OneDrive\바탕 화면\ai-pilot-project-backend
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export class ProblemService {
  async generateProblems(prompt: string) {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
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
}
