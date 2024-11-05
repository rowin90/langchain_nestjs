import { Controller, Post, Body } from '@nestjs/common';
import { MemoryService } from './memory.service';

@Controller('memory')
export class MemoryController {
  constructor(private readonly memoryService: MemoryService) {}

  @Post('/withBufferMemory')
  async withBufferMemory(@Body('question') question: string) {
    return await this.memoryService.withBufferMemory(question);
  }
}
