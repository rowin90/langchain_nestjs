import { Controller, Post, Body } from '@nestjs/common';
import { AgentRunBranchService } from './agent.runBranch.service';
import { AgentService } from './agent.service';

@Controller('agent')
export class AgentController {
  constructor(
    private readonly agentRunBranchService: AgentRunBranchService,
    private readonly agentService: AgentService,
  ) {}

  /**
   * runnableBranch
   */
  @Post('/runnableBranch')
  async runnableBranch(@Body('input') input: string) {
    return await this.agentRunBranchService.runnableBranch(input);
  }
  /**
   * reactAgent
   */
  @Post('/reactAgent')
  async reactAgent(@Body('input') input: string) {
    return await this.agentService.reactAgent(input);
  }
  /**
   * openAIToolsAgent
   */
  @Post('/openAIToolsAgent')
  async openAIToolsAgent(@Body('input') input: string) {
    return await this.agentService.openAIToolsAgent(input);
  }
  /**
   * dynamicTool
   */
  @Post('/dynamicTool')
  async dynamicTool(@Body('input') input: string) {
    return await this.agentService.dynamicTool(input);
  }
  /**
   * dynamicStructuredTool
   */
  @Post('/dynamicStructuredTool')
  async dynamicStructuredTool(@Body('input') input: string) {
    return await this.agentService.dynamicStructuredTool(input);
  }
}
