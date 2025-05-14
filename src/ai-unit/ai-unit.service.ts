import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiUnit } from './ai-unit.entity';

@Injectable()
export class AiUnitService {
  constructor(
    @InjectRepository(AiUnit)
    private readonly aiUnitRepository: Repository<AiUnit>,
  ) {}

  async insertAiUnit(data: Partial<AiUnit>) {
    const result = await this.aiUnitRepository.save(data);
    return result.id;
  }

  async findLastCategory(data: string) {
    const result = await this.aiUnitRepository.findOne({
      where: { title: data },
    });
    return result ? result.id : null;
  }
}
