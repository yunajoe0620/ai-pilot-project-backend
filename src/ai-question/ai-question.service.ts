import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiQuestion } from './ai-question.entity';

// @Injectable은 import에 넣으면 안되고 porivider에 넣어야 한다
@Injectable()
export class AiQuestionService {
  constructor(
    @InjectRepository(AiQuestion)
    // peORM에서 제공하는 객체로, AiQuestion 엔티티에 대한 데이터베이스 작업(CRUD 작업)을 처리하는 데 사용
    //   ai_question 테이블에 대한 인터페이
    private readonly aiQuestionRepository: Repository<AiQuestion>,
  ) {}

  async insertAiQuestion(data: Partial<AiQuestion>) {
    // save()는 TypeORM에서 제공하는 함수로, 전달한 데이터를 삽입 또는 업데이트
    return await this.aiQuestionRepository.save(data);
  }
}
