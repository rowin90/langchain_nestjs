import { Injectable } from '@nestjs/common';
import { DuckDuckGoSearch } from '@langchain/community/tools/duckduckgo_search';
import { DynamicTool, DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { FunctionMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import { ConfigService } from '@nestjs/config';
import { RunnableSequence } from '@langchain/core/runnables';

@Injectable()
export class StudyToolsService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * toolInvoke
   */
  async toolInvoke() {
    const tool = new DuckDuckGoSearch({ maxResults: 1 });
    const res = await tool.invoke('what is the current weather in hangzhou?');
    console.log('=>(study.tools.service.ts 17) res', res);
    console.log('=>(study.tools.service.ts 17) tool', tool);
  }

  async getCurrentWeather(location: string, unit: string) {
    console.log('=>(study.tools.service.ts 24) location, unit', location, unit);
    return `It is currently 72 degrees and sunny in ${location}.`;
  }

  async dynamicTool() {
    const stringReverseTool = new DynamicTool({
      name: 'string-reverser',
      description:
        'reverses a string. input should be the string you want to reverse.',
      func: async (input: string) => input.split('').reverse().join(''),
    });

    const res = await stringReverseTool.invoke('hello world');
    console.log(
      '=>(study.tools.service.ts 33) stringReverseTool',
      stringReverseTool,
    );
    console.log('=>(study.tools.service.ts 33) res', res);

    // const tools = [stringReverseTool];
  }

  _getDateDiffTool() {
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

    return dateDiffTool;
  }

  async dynamicStructuredTool() {
    const tool = this._getDateDiffTool();

    const res = await tool.invoke({
      date1: '2025-03-01',
      date2: '2025-03-31',
    });
    console.log('=>(study.tools.service.ts 61) res', res);
  }

  async chainWithTool(query = 'Today is how many days from 2024-03-16') {
    const prompt = await ChatPromptTemplate.fromMessages([
      {
        role: 'system',
        content: `你是OpenAI开发的聊天机器人，请回答用户的问题，如果需要可以调用工具函数`,
      },
      { role: 'user', content: '{question}' },
    ]);

    const tool = this._getDateDiffTool();
    const llm = new ChatOpenAI({
      modelName: 'gpt-3.5-turbo-16k',
      configuration: {
        baseURL: this.configService.get('OPENAI_API_BASE_URL'),
      },
    });
    const llmWithTools = new ChatOpenAI({
      modelName: 'gpt-3.5-turbo-16k',
      configuration: {
        baseURL: this.configService.get('OPENAI_API_BASE_URL'),
      },
    }).bindTools([tool], { tool_choice: 'auto' });

    // const parser = new StringOutputParser();

    const chain = RunnableSequence.from([prompt, llmWithTools]);

    const res = await chain.invoke({
      question: query,
    });

    /**
     *  "tool_calls": [
     *     {
     *       "name": "date-difference-calculator",
     *       "args": {
     *         "date1": "2024-03-16",
     *         "date2": "today"
     *       },
     *       "type": "tool_call",
     *       "id": "call_RNiMIvbyYseWDjt3GObJwbIj"
     *     }
     *   ],
     */
    // 判断是工具调用还是正常输出结果
    const tool_calls = res.tool_calls;
    if (tool_calls.length <= 0) {
      // 没有调用工具
      console.log(res.content);
    } else {
      const message = (await prompt.invoke(query)).toChatMessages();
      for (const tool_call of tool_calls) {
        const tool = tool_call.name;
        const args = tool_call.args;
        const tool_id = tool_call.id;
        console.log('=>(study.tools.service.ts 141) tool', tool);
        console.log('=>(study.tools.service.ts 142) args', args);

        // todo 调用工具 tool 只取到了名字，这个函数又是在示例上的其他方法，无法直接调用
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const res = await tool.invoke(args);
        message.push(new FunctionMessage(res));
        console.log('=>tool_id', tool_id);
        console.log('=>tool', tool);
        console.log('=>args', args);
        console.log('=>res', res);
      }

      // 最后再把工具的结果返回回去，调用LLM
      return await llm.invoke(message);
    }
    console.log('=>res', res);
  }

  async chainWithStructuredOutput() {
    const prompt = await ChatPromptTemplate.fromMessages([
      {
        role: 'system',
        content: `你是OpenAI开发的聊天机器人，请从用户的描述中提取假设性问题和答案`,
      },
      { role: 'user', content: '{question}' },
    ]);

    const llm = new ChatOpenAI({
      modelName: 'gpt-3.5-turbo-16k',
      configuration: {
        baseURL: this.configService.get('OPENAI_API_BASE_URL'),
      },
    }).withStructuredOutput(
      (z.object({
        question: z.string().describe('假设性问题'),
        answer: z.string().describe('假设性答案'),
      }),
      {}),
    );

    const chain = RunnableSequence.from([prompt, llm]);

    const res = await chain.invoke({
      question: '我叫晓晓宝，我今年3岁了',
    });

    console.log('=>res', res);
  }
}
