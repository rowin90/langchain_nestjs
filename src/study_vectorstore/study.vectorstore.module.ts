import { Module } from '@nestjs/common';
import { StudyPineconeService } from './study.pinecone.service';
import { StudyMilvusService } from './study.milvus.service';

@Module({
  providers: [StudyPineconeService, StudyMilvusService],
})
export class StudyVectorstoreModule {}
