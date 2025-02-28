import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as moment from 'moment';
import * as child from 'node:child_process';
import * as path from 'path';

@Injectable()
export class PdfService {
  createTextFile(filename: string, content: string) {
    //  Unix timestamp in milliseconds
    const millisecond = moment().valueOf();
    const timeStampWithFilename = `${filename}${millisecond}`;
    const filePath = path.resolve('files', 'latex', timeStampWithFilename);

    //   C:\Users\yunaj\OneDrive\바탕 화면\ai-pilot-project-backend\dist\files\Latex에 폴더가 생긴다
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(`${filePath}.tex`, content);
    console.log('pdf파일생성했습니다');

    child.exec(
      ` cd files & cd latex & dir & xelatex ${timeStampWithFilename}.tex`,
      (e, stdout) => {
        console.log(e);
        console.log(`Number of files ${stdout}`);
      },
    );

    return {
      message: 'pdf파일완료',
      filename: timeStampWithFilename,
    };
  }
}
