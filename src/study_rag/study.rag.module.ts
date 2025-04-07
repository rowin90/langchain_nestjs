import { Module } from '@nestjs/common';
import { StudyRAGService } from './study.rag.service';
import { StudyHuggingFaceService } from './study.huggingface.service';
import { StudyDocumentService } from './study.document.service';
import { StudyRagEnhanceService } from './study.rag.enhance.service';
import { StudyVectorstoreService } from './study.vectorstore.service';

@Module({
  providers: [
    StudyRAGService,
    StudyHuggingFaceService,
    StudyDocumentService,
    StudyRagEnhanceService,
    StudyVectorstoreService,
  ],
})
export class StudyRagModule {}
