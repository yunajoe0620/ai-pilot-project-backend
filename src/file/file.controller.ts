import { Body, Controller, Get, Post } from '@nestjs/common';
import { FileService } from './file.service';

@Controller('file')
export class FileController {
  constructor(private readonly fileServiceRepository: FileService) {}

  @Get('test')
  async getTest(): Promise<string> {
    return this.fileServiceRepository.getHello();
  }

  @Post('translate')
  async transLateAudioToText(@Body() audioFile: any) {
    return this.fileServiceRepository.transLateAudioToText(audioFile);
  }
}
