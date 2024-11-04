import { Controller, Post, Body } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('/withHistory')
  async withHistory(
    @Body('question') question: string,
    @Body('sessionId') sessionId: string,
  ) {
    return await this.chatService.withHistory(question, sessionId);
  }
}
