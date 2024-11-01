import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OllamaModule } from './ollama/ollama.module';
import { AiModule } from './ai/ai.module';
import { ConfigModule } from '@nestjs/config';
import { RagModule } from './rag/rag.module';
@Module({
  imports: [ConfigModule.forRoot(), OllamaModule, AiModule, RagModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
