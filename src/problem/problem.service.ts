const dotenv = require('dotenv');

import OpenAI from 'openai';
dotenv.config();

// C:\Users\yunaj\OneDrive\바탕 화면\ai-pilot-project-backend
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export class ProblemService {
  async transLateAudioToText() {}
}
