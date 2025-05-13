import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiUnit } from './ai-unit.entity';

// @Injectable은 import에 넣으면 안되고 porivider에 넣어야 한다
@Injectable()
export class AiUnitService {
  constructor(
    @InjectRepository(AiUnit)
    private readonly aiUnitRepository: Repository<AiUnit>,
  ) {}

  async insertAiUnit(data: Partial<AiUnit>) {
    // save메서드는, 성공시 update랑 insert의 메서드를 수행하면서, entity 자체를 return한다고 한다.
    const result = await this.aiUnitRepository.save(data);

    return result.id;
  }
}
