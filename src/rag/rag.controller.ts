import { Controller, Post, Body } from '@nestjs/common';
import { RagService } from './rag.service';
import { RagCommonService } from './rag.common.service';
import { RagHistoryService } from './rag.history.service';

@Controller('rag')
export class RagController {
  constructor(
    private readonly ragService: RagService,
    private readonly ragCommonService: RagCommonService,
    private readonly ragHistoryService: RagHistoryService,
  ) {}

  /**
   * 读取文件并且向量化本地存储
   */
  @Post('/prepareTextToFaiss')
  async prepareTextToFaiss() {
    return await this.ragCommonService.prepareTextToFaiss();
  }

  /**
   * 普通的检索增强
   * @param question
   */
  @Post('/normalRetriever')
  async normalRetriever(@Body('question') question: string) {
    return await this.ragService.normalRetriever(question);
  }

  /**
   * 高质量的检索增强
   * @param question
   */
  @Post('/highRetriever')
  async highRetriever(@Body('question') question: string) {
    return await this.ragService.highRetriever(question);
  }

  /**
   * 重写提问并带有本地存储的检索
   * @param question
   * @param sessionId
   */
  @Post('/rephraseRetrieverWithLocalMemoryStore')
  async rephraseRetrieverWithLocalMemoryStore(
    @Body('question') question: string,
    @Body('sessionId') sessionId: string = 'test-history',
  ) {
    return await this.ragHistoryService.rephraseRetrieverWithLocalMemoryStore(
      question,
      sessionId,
    );
  }
}
