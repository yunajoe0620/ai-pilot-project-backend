import { Body, Controller, Post } from '@nestjs/common';
import { AiUnitService } from 'src/ai-unit/ai-unit.service';
import { AiQuestion } from './ai-question.entity';
import { AiQuestionService } from './ai-question.service';

@Controller('ai-question')
export class AiQuestionController {
  constructor(
    private readonly aiquestionService: AiQuestionService,
    private readonly aiUnitService: AiUnitService,
  ) {}

  @Post('save')
  async insertQuestion(@Body() body: Partial<AiQuestion>) {
    console.log('body', body);
    return this.aiquestionService.insertAiQuestion(body);
  }
}
