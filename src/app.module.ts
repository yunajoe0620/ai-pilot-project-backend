import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UploadController } from './upload/upload.controller';
import { FileController } from './file/file.controller';

@Module({
  imports: [],
  controllers: [AppController, UploadController, FileController],
  providers: [AppService],
})
export class AppModule {}
