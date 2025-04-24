import { Module } from '@nestjs/common';
import { HtmlService } from 'src/html/html.service';
import { PdfService } from 'src/pdf/pdf.service';
import { ProblemController } from './problem.controller';
import { ProblemService } from './problem.service';

@Module({
  imports: [],
  controllers: [ProblemController],
  providers: [ProblemService, PdfService, HtmlService],
})
export class ProblemModule {}
