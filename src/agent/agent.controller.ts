import { Controller, Post, Body } from '@nestjs/common';
import { AgentService } from './agent.service';

@Controller('agent')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  /**
   * runnableBranch
   */
  @Post('/runnableBranch')
  async runnableBranch(@Body('input') input: string) {
    return await this.agentService.runnableBranch(input);
  }
}
