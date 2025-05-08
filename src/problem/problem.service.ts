import {
  createPartFromUri,
  createUserContent,
  GoogleGenAI,
  Type,
} from '@google/genai';
import * as fs from 'fs';
import * as moment from 'moment';
import * as child from 'node:child_process';
import OpenAI from 'openai';
import * as path from 'path';

const dotenv = require('dotenv');
dotenv.config();
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI });

const WolframAlphaAPI = require('@wolfram-alpha/wolfram-alpha-api');

const waApi = WolframAlphaAPI(process.env.WOLFRAM_ALPHA_APP_KEY);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export class ProblemService {
  async generateSimilarProblems(prompt: string) {
    const filePath = path.resolve('files', 'test.png');
    const myfile = await ai.files.upload({
      file: filePath,
      config: { mimeType: 'image/png', name: '' },
    });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro-preview-03-25',
      contents: createUserContent([
        createPartFromUri(myfile.uri, myfile.mimeType),
        prompt,
      ]),
    });
    console.log('response', response.candidates[0].content);
  }

  // 그림문제를 콜 하는 API ()
  async generateWolframProblems(formulaArray: string[]) {
    const results = [];

    for (const formula of formulaArray) {
      try {
        const response = await waApi.getFull({
          input: formula,
          ouput: 'json',
          format: 'image,plaintext',
          imagemode: 'png',
        });
        if (response.success) {
          const ImageSrc = response?.pods[1]?.subpods[0]?.img.src;
          const url = new URL(ImageSrc);
          url.searchParams.set('MSPStoreType', 'image/png');
          const newImageSrc = url.toString();
          results.push({ formula, newImageSrc });
        } else {
          results.push({ formula, newImageSrc: 'NO IMAGE' });
        }
      } catch (error) {
        throw error;
      }
    }

    return results;
  }

  async generateMarkDownFile(markDownString: string, fileName: string) {
    try {
      const timeStampWithFilename = `${fileName}.md`;
      const filePath = path.resolve('pandocs', timeStampWithFilename);
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

  async convertMarkDownToLatex(
    filename: string,
    outputFileName: string,
  ): Promise<{ message: string; filename: string; status: number }> {
    return new Promise((resolve, reject) => {
      const filePath = path.resolve('pandocs');
      const markdownPath = path.resolve(filePath, `${filename}.md`);
      const markdownContent = fs.readFileSync(markdownPath, 'utf-8');
      if (markdownContent) {
        const millisecond = moment().valueOf();
        const timeStampWithFilename = `${outputFileName}${millisecond}`;
        const command = `cd pandocs & dir & pandoc ${filename}.md --template=template.tex -o ${timeStampWithFilename}.tex`;

        child.exec(command, (e, stdout) => {
          const latexFilePath = path.resolve(
            'pandocs',
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

      const parsedResponse = JSON.parse(responseText);
      return {
        problemHtml: parsedResponse.problemHtml,
        answerHtml: parsedResponse.answerHtml,
      };
    } catch (error) {
      console.error('Error generating Gemini problems:', error);
    }
  }
}
