import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Ingestion } from './ingestion.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class IngestionService {
  constructor(
    @InjectRepository(Ingestion)
    private readonly ingestionRepository: Repository<Ingestion>,
    private readonly httpService: HttpService,
  ) {}

  async createIngestion(documentId: number): Promise<Ingestion> {
    const process = this.ingestionRepository.create({ documentId });
    return this.ingestionRepository.save(process);
  }

  async updateStatus(id: number, status: string): Promise<void> {
    await this.ingestionRepository.update(id, {
      status,
      completedAt: status === 'COMPLETED' ? new Date() : null,
    });
  }

  async getIngestionStatus(documentId: number): Promise<Ingestion | null> {
    return this.ingestionRepository.findOne({ where: { documentId } });
  }

  async triggerIngestion(documentId: number): Promise<any> {
    const url = '// here url';
    try {
      const response = await firstValueFrom(
        this.httpService.post(url, { documentId }),
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to trigger ingestion: ${error.message}`);
    }
  }
}
