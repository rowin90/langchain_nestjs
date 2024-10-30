import { Module } from '@nestjs/common';
import { OllamaService } from './ollama.service';
import { OllamaController } from './ollama.controller';

@Module({
  controllers: [OllamaController],
  providers: [OllamaService]
})
export class OllamaModule {}
