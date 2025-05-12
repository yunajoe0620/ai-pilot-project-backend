import { Module } from '@nestjs/common';
import { AiQuestionModule } from 'src/ai-question/ai-question.module';
import { AiUnitModule } from 'src/ai-unit/ai-unit.module';
import { HtmlService } from 'src/html/html.service';
import { PdfService } from 'src/pdf/pdf.service';
import { ProblemController } from './problem.controller';
import { ProblemService } from './problem.service';

@Module({
  imports: [AiQuestionModule, AiUnitModule],
  controllers: [ProblemController],
  providers: [ProblemService, PdfService, HtmlService],
})
export class ProblemModule {}
