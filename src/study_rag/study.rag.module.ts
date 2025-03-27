import { Module } from '@nestjs/common';
import { StudyRAGService } from './study.rag.service';
import { StudyHuggingFaceService } from './study.huggingface.service';
import { StudyDocumentService } from './study.document.service';
import { StudyRagEnhanceService } from './study.rag.enhance.service';

@Module({
  providers: [
    StudyRAGService,
    StudyHuggingFaceService,
    StudyDocumentService,
    StudyRagEnhanceService,
  ],
})
export class StudyRagModule {}
