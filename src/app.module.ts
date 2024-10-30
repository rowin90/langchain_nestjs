import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OllamaModule } from './ollama/ollama.module';
@Module({
  imports: [OllamaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
