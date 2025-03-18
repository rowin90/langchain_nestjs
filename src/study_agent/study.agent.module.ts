import { Module } from '@nestjs/common';
import { StudyToolsService } from './study.tools.service';
import { StudyAgentService } from './study.agent.service';

@Module({
  providers: [StudyToolsService, StudyAgentService],
})
export class StudyAgentModule {}
