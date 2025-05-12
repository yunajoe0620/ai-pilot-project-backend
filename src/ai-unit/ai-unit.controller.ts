import { Body, Controller, Post } from '@nestjs/common';
import { AiUnit } from './ai-unit.entity';
import { AiUnitService } from './ai-unit.service';

@Controller('ai-unit')
export class AiUnitController {
  constructor(private readonly aiUnitService: AiUnitService) {}

  @Post('save')
  async insertQuestion(@Body() body: Partial<AiUnit>) {
    return this.aiUnitService.insertAiUnit(body);
  }
}
