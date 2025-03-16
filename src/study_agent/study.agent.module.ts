import { Module } from '@nestjs/common';
import { StudyToolsService } from './study.tools.service';

@Module({
  providers: [StudyToolsService],
})
export class StudyAgentModule {}
