import { Controller, Post, Body } from '@nestjs/common';
import { RagService } from './rag.service';

@Controller('rag')
export class RagController {
  constructor(private readonly ragService: RagService) {}

  @Post('/prepareTextToFaiss')
  async prepareTextToFaiss() {
    return await this.ragService.prepareTextToFaiss();
  }

  @Post('/normalRetriever')
  async normalRetriever(@Body('question') question: string) {
    return await this.ragService.normalRetriever(question);
  }

  @Post('/highRetriever')
  async highRetriever(@Body('question') question: string) {
    return await this.ragService.highRetriever(question);
  }
}
