import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as child from 'node:child_process';
import * as path from 'path';
@Injectable()
export class PdfService {
  createTextFile(filename: string, content: string): string {
    console.log('createTextFile 메서드를 호출하였습니다');

    const filePath = path.resolve('files', 'latex', filename);
    console.log('filePath', filePath);

    //   C:\Users\yunaj\OneDrive\바탕 화면\ai-pilot-project-backend\dist\files\Latex에 폴더가 생긴다
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(`${filePath}.tex`, content);
    console.log('pdf파일생성했습니다');

    child.exec(
      ` cd files & cd latex & dir & xelatex ${filename}.tex`,
      (e, stdout) => {
        console.log(e);
        console.log(`Number of files ${stdout}`);
      },
    );

    return `PDF LaTeX file ${filename} created successfully! ohlleh!!!!!`;
  }
}
