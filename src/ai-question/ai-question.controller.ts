import { Controller } from '@nestjs/common';
import { AiQuestionService } from './ai-question.service';

@Controller('ai-question')
export class AiQuestionController {
  constructor(private readonly aiquestionService: AiQuestionService) {}
}
