import { GoogleGenAI, Type } from '@google/genai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';
import * as moment from 'moment';
import * as child from 'node:child_process';
import OpenAI from 'openai';
import * as path from 'path';

const dotenv = require('dotenv');
dotenv.config();
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI });
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
const model = genAI.getGenerativeModel({
  model: 'gemini-pro', // or 'gemini-pro'
});
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
    } catch (error) {
      throw error;
    }
  }

  // string을 markdown파일로 만드는 함수
  async generateMarkDownFile(markDownString: string, fileName: string) {
    try {
      const timeStampWithFilename = `${fileName}.md`;
      const filePath = path.resolve(
        'pandocs',
        'markdown',
        timeStampWithFilename,
      );
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, markDownString, 'utf-8');
      const file = fs.readFileSync(filePath);
      if (typeof file == 'object') {
        return {
          status: 200,
          message: '마크다운 변환에 성공하였습니다',
        };
      }
      return {
        status: 400,
        message: '마크다운 변환에 실패하였습니다.',
      };
    } catch (error) {
      throw error;
    }
  }
  // markdown파일을 읽고 tex 파일로 변환하는 펑션
  // filename은 problemMarkdown과 answerMarkDown2가지일뿐이다.
  // outpufilename problem과 output2가지일뿐이다.
  async convertMarkDownToLatex(
    filename: string,
    outputFileName: string,
  ): Promise<{ message: string; filename: string; status: number }> {
    return new Promise((resolve, reject) => {
      const filePath = path.resolve('pandocs', 'markdown');
      const markdownPath = path.resolve(filePath, `${filename}.md`);
      const markdownContent = fs.readFileSync(markdownPath, 'utf-8');
      if (markdownContent) {
        const millisecond = moment().valueOf();
        const timeStampWithFilename = `${outputFileName}${millisecond}`;
        const command = `cd pandocs & cd markdown & dir & pandoc ${filename}.md --template=template.tex -o ${timeStampWithFilename}.tex`;

        child.exec(command, (e, stdout) => {
          const latexFilePath = path.resolve(
            'pandocs',
            'markdown',
            `${timeStampWithFilename}.tex`,
          );
          if (fs.existsSync(latexFilePath)) {
            resolve({
              message: 'latex파일에 성공하였습니다',
              filename: timeStampWithFilename,
              status: 200,
            });
          } else {
            reject({
              message: 'latex파일에 실패하였습니다.',
              filename: null,
              status: 400,
            });
          }
        });
      } else {
        reject({
          message: 'markdown 파일이 존재하지 않거나 비어 있습니다.',
          filename: null,
          status: 400,
        });
      }
    });
  }

  // gpt
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
  // gemini
  async generateGeminiProblems(prompt: string) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro-preview-03-25',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                level: {
                  type: Type.STRING,
                  enum: ['상', '중', '하'],
                  description: '문제 난이도 (상, 중, 하)',
                },
                problem: {
                  type: Type.STRING,
                  description: '문제 내용 (문제 번호를 포함하지 않음)',
                },
                answer: {
                  type: Type.OBJECT,
                  properties: {
                    result: {
                      type: Type.STRING,
                      description: '답 (오직 답만)',
                    },
                    explain: {
                      type: Type.STRING,
                      description: '문제 풀이 과정',
                    },
                  },
                  required: ['result', 'explain'],
                },
              },
              required: ['level', 'problem', 'answer'],
            },
          },
        },
      });
      return response.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Error generating Gemini problems:', error);
    }
  }
  // gemini
  async generateGeminiProblemsWithHtmlFormat(prompt: string) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro-preview-03-25',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              problemHtml: {
                type: Type.STRING,
                description: '문제 HTML 형식',
              },
              answerHtml: {
                type: Type.STRING,
                description: '답안 HTML 형식',
              },
            },
            required: ['problemHtml', 'answerHtml'],
          },
        },
      });
      if (
        !response.candidates ||
        response.candidates.length === 0 ||
        !response.candidates[0].content ||
        !response.candidates[0].content.parts ||
        response.candidates[0].content.parts.length === 0
      ) {
        return { problemHtml: null, answerHtml: null };
      }

      const responseText = response.candidates[0].content.parts[0].text;
      try {
        const parsedResponse = JSON.parse(responseText);
        return {
          problemHtml: parsedResponse.problemHtml,
          answerHtml: parsedResponse.answerHtml,
        };
      } catch (error) {}
    } catch (error) {
      console.error('Error generating Gemini problems:', error);
    }
  }
}
