import { Module } from '@nestjs/common';
import { StudyPromptService } from './study.prompt.service';
import { StudyModalService } from './study.modal.service';
import { StudyOutputParseService } from './study.output.parse.service';
import { StudyRunnableService } from './study.runnable.service';
import { StudyCallbacksService } from './study.callbacks.service';
import { StudyMemoryService } from './study.memory.service';

@Module({
  providers: [
    StudyPromptService,
    StudyModalService,
    StudyOutputParseService,
    StudyRunnableService,
    StudyCallbacksService,
    StudyMemoryService,
  ],
})
export class StudyModule {}
