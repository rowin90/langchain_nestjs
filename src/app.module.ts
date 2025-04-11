import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OllamaModule } from './ollama/ollama.module';
import { AiModule } from './ai/ai.module';
import { ConfigModule } from '@nestjs/config';
import { RagModule } from './rag/rag.module';
import { ChatModule } from './chat/chat.module';
import { MemoryModule } from './memory/memory.module';
import { FcModule } from './fc/fc.module';
import { AgentModule } from './agent/agent.module';

import { StudyModule } from './study/study.module';
import { StudyRagModule } from './study_rag/study.rag.module';
import { StudyAgentModule } from './study_agent/study.agent.module';
import { StudyVectorstoreModule } from './study_vectorstore/study.vectorstore.module';
import { LibModule } from './lib/lib.module';
import { RedisModule } from '@nestjs-modules/ioredis';
import { StudyMilvusProjectService } from './study_vectorstore/study.milvus.project.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RedisModule.forRoot({
      type: 'single',
      url: 'redis://localhost:6379',
    }),
    LibModule,
    OllamaModule,
    AiModule,
    RagModule,
    ChatModule,
    MemoryModule,
    FcModule,
    AgentModule,
    StudyModule,
    StudyRagModule,
    StudyAgentModule,
    StudyVectorstoreModule,
  ],
  controllers: [AppController],
  providers: [AppService, StudyMilvusProjectService],
})
export class AppModule {}
