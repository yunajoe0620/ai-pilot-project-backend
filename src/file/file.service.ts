const dotenv = require('dotenv');
// const fs = require('fs');
import { createReadStream } from 'fs';

// 왜 아래 import는 왜 되는거야? common JS 형식이긴 한데?
import OpenAI from 'openai';
dotenv.config();

console.log('gggg', process.env.OPENAI_API_KEY);
// C:\Users\yunaj\OneDrive\바탕 화면\ai-pilot-project-backend
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export class FileService {
  async getHello() {
    return '안녕';
  }

  async transLateAudioToText(audioFile: any) {
    const transcription = await openai.audio.transcriptions.create({
      file: createReadStream('./src/files/test2.mp3'),
      response_format: 'verbose_json',
      model: 'whisper-1',
    });
    console.log(transcription.text);
  }
}
