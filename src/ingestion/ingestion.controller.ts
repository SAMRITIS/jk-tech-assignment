import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { IngestionService } from './ingestion.service';

@Controller('ingestion-management')
export class IngestionManagementController {
  constructor(private readonly ingestionService: IngestionService) {}

  @Post('start')
  async startIngestion(@Body('documentId') documentId: number) {
    return this.ingestionService.createIngestion(documentId);
  }

  @Patch('update/:id')
  async updateIngestionStatus(
    @Param('id') id: number,
    @Body('status') status: string,
  ) {
    return this.ingestionService.updateStatus(id, status);
  }

  @Get('status/:documentId')
  async getStatus(@Param('documentId') documentId: number) {
    return this.ingestionService.getIngestionStatus(documentId);
  }
}
