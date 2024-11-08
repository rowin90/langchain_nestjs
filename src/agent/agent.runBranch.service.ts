import { Injectable } from '@nestjs/common';
import {
  ChatOpenAIType,
  OpenAICallOptionsType,
  OpenAIModel,
} from '../ai/model/openAIModel';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { ChatPromptTemplate, PromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence, RunnableBranch } from '@langchain/core/runnables';
import { JsonOutputToolsParser } from '@langchain/core/output_parsers/openai_tools';
import { StringOutputParser } from '@langchain/core/output_parsers';

@Injectable()
export class AgentRunBranchService {
  private createModel: (options?: OpenAICallOptionsType) => ChatOpenAIType;

  constructor() {
    this.createModel = (options?: OpenAICallOptionsType) =>
      new OpenAIModel().createModel(options);
  }

  async runnableBranch(input: string) {
    // 1. 给问题分类
    const classifySchema = z.object({
      type: z.enum(['科普', '编程', '一般问题']).describe('用户提问的分类'),
    });

    const modelWithTools = this.createModel({ temperature: 0 }).bind({
      tools: [
        {
          type: 'function',
          function: {
            name: 'classifyQuestion',
            description: '对用户的提问进行分类',
            parameters: zodToJsonSchema(classifySchema),
          },
        },
      ],
      tool_choice: {
        type: 'function',
        function: {
          name: 'classifyQuestion',
        },
      },
    });

    const prompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        `仔细思考，你有充足的时间进行严谨的思考，然后对用户的问题进行分类，
    当你无法分类到特定分类时，可以分类到 "一般问题"`,
      ],
      ['human', '{input}'],
    ]);

    const classifyChain = RunnableSequence.from([
      prompt,
      modelWithTools,
      new JsonOutputToolsParser(),
      (input) => {
        const type = input[0]?.args?.type;
        return type ? type : '一般问题';
      },
    ]);

    // const classifyResult = classifyChain.invoke({ input });

    // 2. 构建不同领域的专家
    const answeringModel = this.createModel({ temperature: 0.7 });

    const sciencePrompt = PromptTemplate.fromTemplate(
      `作为一位科普专家，你需要解答以下问题，尽可能提供详细、准确和易于理解的答案：

问题：{input}
答案：`,
    );

    const programmingPrompt = PromptTemplate.fromTemplate(
      `作为一位编程专家，你需要解答以下编程相关的问题，尽可能提供详细、准确和实用的答案：

问题：{input}
答案：`,
    );

    const generalPrompt = PromptTemplate.fromTemplate(
      `请回答以下一般性问题，尽可能提供全面和有深度的答案：

问题：{input}
答案：`,
    );

    const scienceChain = RunnableSequence.from([
      sciencePrompt,
      answeringModel,
      new StringOutputParser(),
      {
        output: (input) => input,
        role: () => '科普专家',
      },
    ]);

    const programmingChain = RunnableSequence.from([
      programmingPrompt,
      answeringModel,
      new StringOutputParser(),
      {
        output: (input) => input,
        role: () => '编程大师',
      },
    ]);

    const generalChain = RunnableSequence.from([
      generalPrompt,
      answeringModel,
      new StringOutputParser(),
      {
        output: (input) => input,
        role: () => '通识专家',
      },
    ]);

    // 3. 分支路由
    const branch = RunnableBranch.from([
      [(input) => input.type.includes('科普'), scienceChain],
      [(input) => input.type.includes('编程'), programmingChain],
      generalChain,
    ]);

    // 4. 最终回答
    const outputTemplate = PromptTemplate.fromTemplate(
      `感谢您的提问，这是来自 {role} 的专业回答：

{output}
`,
    );

    const finalChain = RunnableSequence.from([
      {
        type: classifyChain,
        input: (input) => input.input,
      },
      branch,
      (input) => outputTemplate.format(input),
    ]);

    return await finalChain.invoke({ input });
  }
}
