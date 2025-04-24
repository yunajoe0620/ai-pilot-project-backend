import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'node:path';
import { PdfController } from './pdf.controller';
import { PdfService } from './pdf.service';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'files', 'pdf'),
      serveRoot: '/files/pdf',
    }),
  ],
  controllers: [PdfController],
  providers: [PdfService],
})
export class PdfModule {}
