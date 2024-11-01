import { Module } from '@nestjs/common';
import { RagService } from './rag.service';
import { RagController } from './rag.controller';

@Module({
  controllers: [RagController],
  providers: [RagService]
})
export class RagModule {}
