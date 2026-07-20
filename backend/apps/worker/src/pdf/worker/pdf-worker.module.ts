import { Module } from '@nestjs/common';
import { PdfWorkerService } from './pdf-worker.service';
import { PdfModule } from '../pdf.module';

@Module({
  imports: [PdfModule],
  providers: [PdfWorkerService],
})
export class PdfWorkerModule {}
