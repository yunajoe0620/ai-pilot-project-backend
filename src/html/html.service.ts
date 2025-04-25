import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class HtmlService {
  createHTMLFile(
    cleanedText: string,
    outputFileName: string,
  ): Promise<{ message: string; filename: string; status: number }> {
    return new Promise((resolve, reject) => {
      const outputDir = path.resolve('pandocs');

      const fullPath = path.join(outputDir, outputFileName);
      fs.mkdirSync(outputDir, { recursive: true });
      fs.writeFile(fullPath, cleanedText, 'utf8', (err) => {
        if (err) {
          reject({
            message: 'html파일이 저장에 실패하였습니다',
            status: 400,
            filename: null,
          });
        } else {
          resolve({
            message: 'html파일이 저장이 되었습니다',
            status: 200,
            filename: outputFileName,
          });
        }
      });
    });
  }
}
