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
    console.log('data', data);

    const unitData = {
      category_code: '대/중/소분류 코드',
      parent_unit_id: '',
      title: '',
      subject_code: '수학',
      grade_level_code: '31',
      staff_name: null,
    };

    return await this.aiUnitRepository.save(data);
  }
}
