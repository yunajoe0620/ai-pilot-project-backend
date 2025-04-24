import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'node:path';
import { HTMLController } from './html.controller';
import { HtmlService } from './html.service';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'files', 'html'),
      serveRoot: '/files/html',
    }),
  ],
  controllers: [HTMLController],
  providers: [HtmlService],
})
export class HtmlModule {}
