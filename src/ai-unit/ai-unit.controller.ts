import { Controller } from '@nestjs/common';
import { AiUnitService } from './ai-unit.service';

@Controller('ai-unit')
export class AiUnitController {
  constructor(private readonly aiUnitService: AiUnitService) {}
}
