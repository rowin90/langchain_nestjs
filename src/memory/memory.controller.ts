import { Controller, Post, Body } from '@nestjs/common';
import { MemoryService } from './memory.service';

@Controller('memory')
export class MemoryController {
  constructor(private readonly memoryService: MemoryService) {}

  /**
   * 自己手动存储memory过程
   * @param question
   */
  @Post('/withBufferMemory')
  async withBufferMemory(@Body('question') question: string) {
    return await this.memoryService.withBufferMemory(question);
  }

  /**
   * 自己实现本地文件存储memory
   */
  @Post('/withCustomLocalHistory')
  async withCustomLocalHistory() {
    return await this.memoryService.withCustomLocalHistory();
  }
}
