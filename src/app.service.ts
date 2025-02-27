import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as child from 'node:child_process';
import * as path from 'path';
@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  createTextFile(filename: string, content: string): string {
    // __dirname ==>   C:\Users\yunaj\OneDrive\바탕 화면\ai-pilot-project-backend\dist
    // console.log('dir__name======>>>>>>>>', __dirname);

    //  C:\Users\yunaj\OneDrive\바탕 화면\ai-pilot-project-backend\dist\files\LatexTest
    const filePath = path.join(__dirname, '..', 'files', 'latex', filename);

    //   C:\Users\yunaj\OneDrive\바탕 화면\ai-pilot-project-backend\dist\files\Latex에 폴더가 생긴다
    fs.mkdirSync(path.dirname(filePath), { recursive: true });

    // // 내용을 안에 쓰기
    // 폴더안에 tex 라는 content가 생긴다
    fs.writeFileSync(`${filePath}.tex`, content);

    child.exec(
      ` cd files & cd latex & dir & xelatex ${filename}.tex`,
      (e, stdout) => {
        console.log(e);
        console.log(`Number of files ${stdout}`);
      },
    );

    return `LaTeX file ${filename} created successfully`;
  }
}
