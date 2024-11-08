import { Module } from '@nestjs/common';
import { AgentRunBranchService } from './agent.runBranch.service';
import { AgentController } from './agent.controller';
import { AgentService } from './agent.service';

@Module({
  controllers: [AgentController],
  providers: [AgentRunBranchService, AgentService],
})
export class AgentModule {}
