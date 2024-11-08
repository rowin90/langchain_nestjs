import { Injectable } from '@nestjs/common';
import { ChatOpenAIType, OpenAIModel } from '../ai/model/openAIModel';

import { SerpAPI } from '@langchain/community/tools/serpapi';
import { AgentExecutor, createReactAgent } from 'langchain/agents';
import { pull } from 'langchain/hub';
import type { PromptTemplate } from '@langchain/core/prompts';
import { Calculator } from '@langchain/community/tools/calculator';

@Injectable()
export class AgentService {
  private model: ChatOpenAIType;

  constructor() {
    this.model = new OpenAIModel().createModel();
  }

  async reactAgent(input: string) {
    const tools = [new SerpAPI(process.env.SERP_KEY), new Calculator()];

    const prompt = await pull<PromptTemplate>('hwchase17/react');

    const agent = await createReactAgent({
      llm: this.model,
      tools,
      prompt,
    });

    const agentExecutor = new AgentExecutor({
      agent,
      tools,
    });

    return await agentExecutor.invoke({
      input,
    });
  }
}
