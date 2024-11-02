import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OllamaModule } from './ollama/ollama.module';
import { AiModule } from './ai/ai.module';
import { ConfigModule } from '@nestjs/config';
import { RagModule } from './rag/rag.module';
import { ChatModule } from './chat/chat.module';
@Module({
  imports: [ConfigModule.forRoot(), OllamaModule, AiModule, RagModule, ChatModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
