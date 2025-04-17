import OpenAI from 'openai';
const dotenv = require('dotenv');
dotenv.config();

const WolframAlphaAPI = require('@wolfram-alpha/wolfram-alpha-api');

const waApi = WolframAlphaAPI(process.env.WOLFRAM_ALPHA_APP_KEY);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const deepSeekOpenAI = new OpenAI({
  baseURL: process.env.DEEP_SEEK_BASE_URL,
  apiKey: process.env.DEEP_SEEK_API_KEY,
});

export class ProblemService {
  async generateWolframProblems(prompt: string) {
    try {
      const response = await waApi.getFull({
        input: 'plot y = 2x + 3',
        output: 'json',
      });
      // console.log('response', response);
      const pods = await response.pods;
      const plotPod = pods.find((pod) =>
        pod.title.toLowerCase().includes('plot'),
      );
      const imageUrl = plotPod?.subpods[0]?.img?.src;
      if (imageUrl) {
        return {
          status: 200,
          imageUrl,
        };
      }

      // const result = pods.find((pod) => pod.title === 'Result');
      // const { position, error, subpods } = result;
      // const [{ title, img, plaintext }] = subpods;
      // console.log('title, img, plantext', title, img, plaintext);
    } catch (error) {
      throw error;
    }
  }
  // async generateWolframProblems(prompt: string) {
  //   try {
  //     const url = `https://api.wolframalpha.com/v2/query?input=draw+the+function+graph&format=image,plaintext,sound,html&output=JSON&appid=${process.env.WOLFRAM_ALPHA_APP_KEY}`;
  //     const response = await fetch(url);
  //     const jsonData = await response.json();
  //     console.log('response', jsonData);
  //   } catch (error) {
  //     throw error;
  //   }
  // }
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
