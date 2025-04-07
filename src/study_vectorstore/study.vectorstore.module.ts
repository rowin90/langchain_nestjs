import { Module } from '@nestjs/common';
import { StudyPineconeService } from './study.pinecone.service';

@Module({
  providers: [StudyPineconeService],
})
export class StudyVectorstoreModule {}
