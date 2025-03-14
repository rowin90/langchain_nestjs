import { Module } from '@nestjs/common';
import { StudyRAGService } from './study.rag.service';

@Module({
  providers: [StudyRAGService],
})
export class StudyRagModule {}
