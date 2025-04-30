import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { HtmlModule } from './html/html.module';
import { PdfModule } from './pdf/pdf.module';
import { ProblemModule } from './problem/problem.module';
import { MiddleSchoolModule } from './school/middleSchool.module';
import { RecommendationsModule } from './survey/recommendations.module';

const SYNC = false;

const dbConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: '1234',
  database: 'ai-database',
  entities: [],
  synchronize: SYNC,
} as TypeOrmModuleOptions;

@Module({
  imports: [
    // TypeOrmModule.forRoot(dbConfig),
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    ProblemModule,
    PdfModule,
    RecommendationsModule,
    MiddleSchoolModule,
    HtmlModule,
    // sevverd에서 static 파일을 보려면은 아래와 같은 경로로 간다.
    // ServeStaticModule.forRoot({
    //   rootPath: join(__dirname, '..', 'files', 'latex'),
    //   serveRoot: '/pdf', // pdf/pdf파일이름 이렇게 지정이 된다.
    // }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'files'),
      serveRoot: '/files',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
