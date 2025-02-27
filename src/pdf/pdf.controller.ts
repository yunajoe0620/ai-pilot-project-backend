import { Body, Controller, Post } from '@nestjs/common';
import { PdfService } from './pdf.service';

@Controller('pdf')
export class PdfController {
  constructor(private readonly pdfService: PdfService) {}
  // pdf/generate
  @Post('/generate')
  async postPdf(@Body() data: { data: string }) {
    console.log(
      'pdf/generate가 call하였습니다아아이이이잉',
      data.data,
      typeof data,
    );
    return this.pdfService.createTextFile('Latex', data.data);
  }
}
