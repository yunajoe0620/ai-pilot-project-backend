import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as moment from 'moment';
import * as child from 'node:child_process';
import * as path from 'path';
@Injectable()
export class PdfService {
  createPdfFile(
    filename: string,
  ): Promise<{ message: string; filename: string; status: number }> {
    return new Promise((resolve, reject) => {
      const outputDir = path.resolve('files', 'pdf');
      const inputDir = path.resolve('pandocs', 'markdown');
      const texFilePath = path.join(inputDir, `${filename}.tex`);

      // files폴더 아래에 pdf폴더를 생성한다.

      fs.mkdirSync(outputDir, { recursive: true });
      const command = `cd pandocs & cd markdown & dir & lualatex -output-directory="${outputDir}" "${texFilePath}"`;

      child.exec(command, (e, stdout) => {
        const pdfFilePath = path.resolve('files', 'pdf', `${filename}.pdf`);
        if (fs.existsSync(pdfFilePath)) {
          resolve({
            message: 'pdf파일이 생성하였습니다',
            filename: filename,
            status: 200,
          });
        } else {
          reject({
            message: 'pdf파일 생성에 실패하였습니다',
            filename: null,
            status: 400,
          });
        }
      });
    });
  }
  createTextFile(filename: string, content: string) {
    return new Promise((resolve, reject) => {
      const millisecond = moment().valueOf();
      const timeStampWithFilename = `${filename}${millisecond}`;
      const filePath = path.resolve('files', 'latex', timeStampWithFilename);

      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(`${filePath}.tex`, content);

      child.exec(
        `cd files & cd latex & dir & lualatex ${timeStampWithFilename}.tex`,
        (e, stdout) => {
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
