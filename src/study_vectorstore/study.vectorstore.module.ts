import { Module } from '@nestjs/common';
import { StudyPineconeService } from './study.pinecone.service';
import { StudyMilvusService } from './study.milvus.service';
import { StudyMilvusProjectService } from './study.milvus.project.service';

@Module({
  providers: [
    StudyPineconeService,
    StudyMilvusService,
    StudyMilvusProjectService,
  ],
})
export class StudyVectorstoreModule {}
