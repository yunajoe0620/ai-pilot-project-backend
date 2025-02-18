import { Body, Controller, Post } from '@nestjs/common';
import { CreateProblems } from 'src/dto/problem';
import { ProblemService } from './problem.service';

@Controller('problem')
export class ProblemController {
  constructor(private readonly problemServiceRepository: ProblemService) {}

  @Post('generate')
  async createProblems(@Body() data: CreateProblems) {
    const prompt = data.formattedData.trim();
    return this.problemServiceRepository.generateProblems(prompt);
  }
}
