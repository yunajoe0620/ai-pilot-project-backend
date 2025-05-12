import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiUnitModule } from 'src/ai-unit/ai-unit.module';
import { AiQuestionController } from './ai-question.controller';
import { AiQuestion } from './ai-question.entity';
import { AiQuestionService } from './ai-question.service';

@Module({
  // 이곳에는 모듈 (@Module) 클래스만 들어가야 한다.
  // NestJS는 이 배열을 통해 다른 모듈에서 선언된 provider들을 불러올 수 있게 해준다

  imports: [TypeOrmModule.forFeature([AiQuestion]), AiUnitModule],
  controllers: [AiQuestionController],

  providers: [AiQuestionService],
  exports: [AiQuestionService],
})
export class AiQuestionModule {}
