import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as moment from 'moment';
import * as child from 'node:child_process';
import * as path from 'path';

@Injectable()
export class PdfService {
  createTextFile(filename: string, content: string) {
    return new Promise((resolve, reject) => {
      //  Unix timestamp in milliseconds
      const millisecond = moment().valueOf();
      const timeStampWithFilename = `${filename}${millisecond}`;
      const filePath = path.resolve('files', 'latex', timeStampWithFilename);

      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(`${filePath}.tex`, content);

      child.exec(
        ` cd files & cd latex & dir & xelatex ${timeStampWithFilename}.tex`,
        (e) => {
          console.log(e);

          // C:\Users\yunaj\OneDrive\바탕 화면\ai-pilot-project-backend\files\latex\pdfFile1740719793115.pdf
          const pdfFilePath = path.resolve(
            'files',
            'latex',
            `${timeStampWithFilename}.pdf`,
          );
          if (fs.existsSync(pdfFilePath)) {
            resolve({
              message: 'pdf파일이 생성하였습니다',
              filename: timeStampWithFilename,
            });
          } else {
            reject({
              message: 'pdf파일 생성에 실패하였습니다',
              filename: null,
            });
          }
        },
      );
    });
  }
}
