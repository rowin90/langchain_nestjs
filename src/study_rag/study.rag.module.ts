import { Module } from '@nestjs/common';
import { StudyRAGService } from './study.rag.service';
import { StudyHuggingFaceService } from './study.huggingface.service';
import { StudyDocumentService } from './study.document.service';

@Module({
  providers: [StudyRAGService, StudyHuggingFaceService, StudyDocumentService],
})
export class StudyRagModule {}
