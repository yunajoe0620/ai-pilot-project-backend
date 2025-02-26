import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FileController } from './file/file.controller';
import { FileService } from './file/file.service';
import { ProblemModule } from './problem/problem.module';
import { RecommendationsModule } from './survey/recommendations.module';

// 주로 Single Page Application(SPA)처럼 정적 콘텐츠를 제공하는 데 유용
/*  
MVC 애플리케이션을 구축하거나 이미지, 문서와 같은 자산 파일을 제공하고자 할 경우, 
대신 useStaticAssets() 메서드를 사용하는 것이 좋습니다(자세한 내용은 여기를 참조하세요).
*/
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
    RecommendationsModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'files', 'latex'),
      serveRoot: '/pdf', // URL 경로 설정 (ex: /images/image.jpg)
    }),
  ],
  controllers: [AppController, FileController],
  providers: [AppService, FileService],
})
export class AppModule {}
