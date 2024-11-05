import { Module } from '@nestjs/common';
import { RagService } from './rag.service';
import { RagController } from './rag.controller';
import { RagHistoryService } from './rag.history.service';
import { RagCommonService } from './rag.common.service';

@Module({
  controllers: [RagController],
  providers: [RagCommonService, RagService, RagHistoryService],
})
export class RagModule {}
