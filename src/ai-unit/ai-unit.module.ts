import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AiUnitController } from './ai-unit.controller';
import { AiUnit } from './ai-unit.entity';
import { AiUnitService } from './ai-unit.service';

@Module({
  imports: [TypeOrmModule.forFeature([AiUnit])],
  controllers: [AiUnitController],
  exports: [AiUnitService], // 이게 필요함

  providers: [AiUnitService],
})
export class AiUnitModule {}
