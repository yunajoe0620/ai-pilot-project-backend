import { Module } from '@nestjs/common';
import { MiddleSchoolontroller } from './middleSchool.controller';
import { MiddleSchoolService } from './middleSchool.service';

@Module({
  imports: [],
  controllers: [MiddleSchoolontroller],
  providers: [MiddleSchoolService],
})
export class MiddleSchoolModule {}
