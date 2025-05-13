import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiQuestion } from './ai-question.entity';

// @Injectable은 import에 넣으면 안되고 porivider에 넣어야 한다
@Injectable()
export class AiQuestionService {
  constructor(
    @InjectRepository(AiQuestion)
    private readonly aiQuestionRepository: Repository<AiQuestion>,
  ) {}

  async insertAiQuestion(data: Partial<AiQuestion>) {
    console.log('data', data);

    return await this.aiQuestionRepository.save(data);
  }
}
