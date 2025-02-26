import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as child from 'node:child_process';
import path from 'path';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  // exec(): 셸에서 명령을 실행하고 출력을 버퍼링
  // execFile(): 셸 없이 파일을 직접 실행합니다. 간단한 스크립트나 명령의 경우 exec()보다 효율적
  // spawn(): 주어진 명령으로 새 프로세스를 시작하고 stdin, stdout, stderr에 대한 스트림을 제공
  // fork(): 새로운 Node.js 프로세스를 생성하고 부모와 자식 간의 통신 채널을 설정하도록 특별히 설계된 spawn()의 특수 버전

  createTextFile(filename: string, content: string): string {
    const filePath = path.join(__dirname, '..', 'files', filename);
    console.log('filePath입니다아아', filePath);
    // 만약에 경로가 없다면은 파일 만들기
    fs.mkdirSync(path.dirname(filePath), { recursive: true });

    // 내용을 안에 쓰기
    fs.writeFileSync(`${filePath}.tex`, content);

    child.exec(` cd files & dir & pdflatex ${filename}.tex`, (e, stdout) => {
      console.log(e);
      console.log(`Number of files ${stdout}`);
    });

    return `LaTeX file ${filename} created successfully at ${filePath}`;
  }
}
