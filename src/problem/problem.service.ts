import * as fs from 'fs';
import * as moment from 'moment';
import * as child from 'node:child_process';
import OpenAI from 'openai';
import * as path from 'path';

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

  // string을 markdown파일로 만드는 함수
  async generateMarkDownFile(markDownString: string, fileName: string) {
    console.log('markDownString', markDownString, 'fileName', fileName);
    try {
      const timeStampWithFilename = `${fileName}.md`;
      const filePath = path.resolve(
        'pandocs',
        'markdown',
        timeStampWithFilename,
      );
      // 둘다 동기 함슈..
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
  async convertMarkDownToLatex(filename: string, outputFileName: string) {
    return new Promise((resolve, reject) => {
      const filePath = path.resolve('pandocs', 'markdown');
      const markdownPath = path.resolve(filePath, `${filename}.md`);
      const markdownContent = fs.readFileSync(markdownPath, 'utf-8');
      if (markdownContent) {
        const millisecond = moment().valueOf();
        // problem1231313123(와 같은 형태태)
        const timeStampWithFilename = `${outputFileName}${millisecond}`;

        const command = `cd pandocs & cd markdown & dir & pandoc ${filename}.md --template=template.tex -o ${timeStampWithFilename}.tex`;

        child.exec(command, (e, stdout) => {
          console.log('라텍스 파일에 변환 성공', e, stdout);
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
