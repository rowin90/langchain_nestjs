import { Module } from '@nestjs/common';
import { StudyRAGService } from './study.rag.service';
import { StudyHuggingFaceService } from './study.huggingface.service';

@Module({
  providers: [StudyRAGService, StudyHuggingFaceService],
})
export class StudyRagModule {}
