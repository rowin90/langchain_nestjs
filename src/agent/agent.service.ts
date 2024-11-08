import { Injectable } from '@nestjs/common';
import { ChatOpenAIType, OpenAIModel } from '../ai/model/openAIModel';
import { z } from 'zod';
import { SerpAPI } from '@langchain/community/tools/serpapi';
import {
  AgentExecutor,
  createReactAgent,
  createOpenAIToolsAgent,
} from 'langchain/agents';
import { pull } from 'langchain/hub';
import type {
  PromptTemplate,
  ChatPromptTemplate,
} from '@langchain/core/prompts';
import { Calculator } from '@langchain/community/tools/calculator';
import { DynamicTool, DynamicStructuredTool } from 'langchain/tools';

@Injectable()
export class AgentService {
  private model: ChatOpenAIType;

  constructor() {
    this.model = new OpenAIModel().createModel();
  }

  async reactAgent(input: string) {
    const tools = [new SerpAPI(process.env.SERP_KEY), new Calculator()];

    /**
     * Answer the following questions as best you can.
     *
     * You have access to the following tools:
     *
     * {tools}
     *
     * Use the following format:
     *
     * Question: the input question you must answer
     * Thought: you should always think about what to do
     * Action: the action to take, should be one of [{tool_names}]
     * Action Input: the input to the action
     * Observation: the result of the action
     * ... (this Thought/Action/Action Input/Observation can repeat N times)
     * Thought: I now know the final answer
     * Final Answer: the final answer to the original input question
     *
     * Begin!
     *
     * Question: {input}
     * Thought:{agent_scratchpad}
     */
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

  async openAIToolsAgent(input: string) {
    const tools = [new SerpAPI(process.env.SERP_KEY), new Calculator()];

    const prompt = await pull<ChatPromptTemplate>(
      'hwchase17/openai-tools-agent',
    );
    /**
     * [
     *     ["system", "You are a helpful assistant"],
     *     {chat_history},
     *     ["HUMAN", "{input}"],
     *     {agent_scratchpad}
     * ]
     */

    const agent = await createOpenAIToolsAgent({
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

  async dynamicTool(input: string) {
    const stringReverseTool = new DynamicTool({
      name: 'string-reverser',
      description:
        'reverses a string. input should be the string you want to reverse.',
      func: async (input: string) => input.split('').reverse().join(''),
    });

    const tools = [stringReverseTool];

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

  async dynamicStructuredTool(input: string) {
    const dateDiffTool = new DynamicStructuredTool({
      name: 'date-difference-calculator',
      description: '计算两个日期之间的天数差',
      schema: z.object({
        date1: z.string().describe('第一个日期，以YYYY-MM-DD格式表示'),
        date2: z.string().describe('第二个日期，以YYYY-MM-DD格式表示'),
      }),
      func: async ({ date1, date2 }) => {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        const difference = Math.abs(d2.getTime() - d1.getTime());
        const days = Math.ceil(difference / (1000 * 60 * 60 * 24));
        return days.toString();
      },
    });

    const tools = [dateDiffTool];

    //   const agents = await createReactAgentWithTool(tools);
    const agents = await this._createToolAgentWithTool(tools);
    return await agents.invoke({ input });
  }

  /**
   * _createToolAgentWithTool 自己定义的tools尽量用这个，限制比较少
   * @param tools
   */
  async _createToolAgentWithTool(tools) {
    const prompt = await pull<ChatPromptTemplate>(
      'hwchase17/openai-tools-agent',
    );

    // createOpenAIToolsAgent这个不用 tools 和 tools_name，，只有 内置的 SerpApi有这些属性
    const agent = await createOpenAIToolsAgent({
      llm: this.model,
      tools,
      prompt,
    });

    const agentExecutor = new AgentExecutor({
      agent,
      tools,
    });
    return agentExecutor;
  }

  /**
   * _createReactAgentWithTool  内置的 SerpApi可以使用这个
   * @param tools
   */
  async _createReactAgentWithTool(tools) {
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

    return agentExecutor;
  }
}
