import { Module } from '@nestjs/common';
import { StudyPromptService } from './study.prompt.service';
import { StudyModalService } from './study.modal.service';

@Module({
  providers: [StudyPromptService, StudyModalService],
})
export class StudyModule {}
