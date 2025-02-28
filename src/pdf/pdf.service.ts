import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as moment from 'moment';
import * as child from 'node:child_process';
import * as path from 'path';

@Injectable()
export class PdfService {
  createTextFile(filename: string, content: string) {
    //  Unix timestamp in milliseconds
    let isPdfFileCreated = false;
    const millisecond = moment().valueOf();
    const timeStampWithFilename = `${filename}${millisecond}`;
    const filePath = path.resolve('files', 'latex', timeStampWithFilename);

    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(`${filePath}.tex`, content);
    child.exec(
      ` cd files & cd latex & dir & xelatex ${timeStampWithFilename}.tex`,
      (e, stdout) => {
        console.log(e);
        console.log(`Number of files ${stdout}`);
        // C:\Users\yunaj\OneDrive\바탕 화면\ai-pilot-project-backend\files\latex\pdfFile1740719793115.pdf
        const pdfFilePath = path.resolve(
          'files',
          'latex',
          `${timeStampWithFilename}.pdf`,
        );

        if (fs.existsSync(pdfFilePath)) {
          console.log('파일이 존재합니다아');
          isPdfFileCreated = true;
        } else {
          isPdfFileCreated = false;
        }
      },
    );

    // TODO: 항상 isPdffileCared가 child.exec보다 먼저 찍혀서 false가 되어 버린다.
    //  child.exec가 실행 된후 아래 로직이 생성되게 만들쟈
    if (isPdfFileCreated) {
      return {
        message: 'pdf파일이 생성하였습니다',
        filename: timeStampWithFilename,
      };
    }
    return {
      message: 'pdf파일 생성에 실패하였습니다',
      filename: '',
    };
  }
}
