import * as fs from 'fs';
import OpenAI from 'openai';
const openai = new OpenAI();

export class UploadService {
  private openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  async trasnLatbeAudioToText() {
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream('/path/to/file/audio.mp3'),
      response_format: 'verbose_json',
      model: 'whisper-1',
    });
    console.log(transcription.text);
  }
}
