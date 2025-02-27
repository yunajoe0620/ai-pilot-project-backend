import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FileController } from './file/file.controller';
import { FileService } from './file/file.service';
import { PdfModule } from './pdf/pdf.module';
import { ProblemModule } from './problem/problem.module';
import { RecommendationsModule } from './survey/recommendations.module';

// 주로 Single Page Application(SPA)처럼 정적 콘텐츠를 제공하는 데 유용
/*  
MVC 애플리케이션을 구축하거나 이미지, 문서와 같은 자산 파일을 제공하고자 할 경우, 
대신 useStaticAssets() 메서드를 사용하는 것이 좋습니다(자세한 내용은 여기를 참조하세요).
*/

// .aux파일은  LaTeX 문서에서 여러 번의 컴파일을 통해 필요한 정보를 저장하고, 이를 바탕으로 인용, 참조, 목차, 레퍼런스 등을 정확하게 처리
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
    // sevverd에서 static 파일을 보려면은 아래와 같은 경로로 간다.
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'files', 'latex'),
      serveRoot: '/pdf', // pdf/pdf파일이름 이렇게 지정이 된다.
    }),
  ],
  controllers: [AppController, FileController],
  providers: [AppService, FileService],
})
export class AppModule {}
