import { Body, Controller, Post } from '@nestjs/common';
import { PdfService } from './pdf.service';

@Controller('pdf')
export class PdfController {
  constructor(private readonly pdfService: PdfService) {}
  // pdf/generate
  @Post('/generate')
  async postPdf(@Body() data: { data: string }) {
    return this.pdfService.createTextFile('Latex', data.data);
  }
}
