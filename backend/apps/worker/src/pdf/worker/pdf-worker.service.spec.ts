import { Test, TestingModule } from '@nestjs/testing';
import { PdfWorkerService } from './pdf-worker.service';

describe('PdfWorkerService', () => {
  let service: PdfWorkerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PdfWorkerService],
    }).compile();

    service = module.get<PdfWorkerService>(PdfWorkerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
