import { Injectable } from '@nestjs/common';
import { PromptTemplate, ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import { ConfigService } from '@nestjs/config';
import {
  createToolCallingAgent,
  createReactAgent,
  AgentExecutor,
} from 'langchain/agents';
import { SerpAPI } from '@langchain/community/tools/serpapi';
import { pull } from 'langchain/hub';
import { Calculator } from '@langchain/community/tools/calculator';

@Injectable()
export class StudyAgentService {
  serpAPI: SerpAPI;
  calculator: Calculator;
  constructor(private readonly configService: ConfigService) {
    this.serpAPI = new SerpAPI(this.configService.get('SERP_KEY'));
    this.calculator = new Calculator();
  }

  /**
   * @deprecated
   * reactAgent v0.3版本暂时不可用（最终的解析输出会出错）
   */
  async reactAgent() {
    const tools = [this.serpAPI, this.calculator];

    // const prompt = await pull<PromptTemplate>('hwchase17/react');

    const prompt =
      PromptTemplate.fromTemplate(`Answer the following questions as best you can. You have access to the following tools:

{tools}

Use the following format:

Question: the input question you must answer
Thought: you should always think about what to do
Action: the action to take, should be one of [{tool_names}]
Action Input: the input to the action
Observation: the result of the action
... (this Thought/Action/Action Input/Observation can repeat N times)
Thought: I now know the final answer
Final Answer: the final answer to the original input question

Begin!

Question: {input}
Thought:{agent_scratchpad}`);

    const llm = new ChatOpenAI({
      configuration: {
        baseURL: this.configService.get('OPENAI_API_BASE_URL'),
      },
    });

    const agent = await createReactAgent({
      llm,
      tools,
      prompt,
    });

    const agentExecutor = new AgentExecutor({
      agent,
      tools,
    });

    const res = await agentExecutor.invoke({
      input: 'what is LangChain?',
    });
    console.log('=>(study.agent.service.ts 52) res', res);
  }

  /**
   * toolAgent
   */
  async toolAgent() {
    const tools = [this.serpAPI, this.calculator];

    const prompt = await pull<ChatPromptTemplate>(
      'hwchase17/openai-tools-agent',
    );

    //     const prompt = `
    //      System: You are a helpful assistant
    // Human: {input}
    // Human: {agent_scratchpad}`;

    const llm = new ChatOpenAI({
      configuration: {
        baseURL: this.configService.get('OPENAI_API_BASE_URL'),
      },
    });

    const agent = await createToolCallingAgent({
      llm,
      tools,
      prompt,
    });

    const agentExecutor = new AgentExecutor({
      agent,
      tools,
    });

    const res = await agentExecutor.invoke({
      input: 'what is LangChain?',
    });
    console.log('=>(study.agent.service.ts 52) res', res);
    /**
     * {
     *   input: 'what is LangChain?',
     *   output: 'LangChain is a composable framework used to build with Language Model Libraries (LLMs). It is developed by Harrison Chase and supports programming languages like Python and JavaScript. LangChain was initially released in October 2022 and is available under the MIT License. You can find more information about LangChain on their GitHub repository at github.com/langchain-ai/langchain. The stable release version is 0.1.16, which was released on 11th April 2024.'
     * }
     */
  }
}
