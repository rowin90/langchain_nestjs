import { Module } from '@nestjs/common';
import { StudyPromptService } from './study.prompt.service';

@Module({
  providers: [StudyPromptService],
})
export class StudyModule {}
