import { Controller, Post, Body } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  /**
   * 单纯记录历史
   * @param question
   * @param sessionId
   */
  @Post('/withHistory')
  async withHistory(
    @Body('question') question: string,
    @Body('sessionId') sessionId: string,
  ) {
    return await this.chatService.withHistory(question, sessionId);
  }

  /**
   * 每次总结历史会话当做上下文
   * @param question
   * @param sessionId
   */
  @Post('/withSummaryHistory')
  async withSummaryHistory(
    @Body('question') question: string,
    @Body('sessionId') sessionId: string,
  ) {
    return await this.chatService.withSummaryHistory(question, sessionId);
  }
}
