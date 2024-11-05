import { Injectable } from '@nestjs/common';
import { BufferMemory } from 'langchain/memory';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import {
  RunnablePassthrough,
  RunnableSequence,
} from '@langchain/core/runnables';
import { GlmModelProvider } from '../ai/model/glm';

@Injectable()
export class MemoryService {
  private model: any;
  private memory: any;

  constructor() {
    this.model = new GlmModelProvider().createModel();
    this.memory = new BufferMemory();
  }

  async withBufferMemory(question: string) {
    const TEMPLATE = `
你是一个乐于助人的 ai 助手。尽你所能回答所有问题。

这是跟人类沟通的聊天历史:
{history}

据此回答人类的问题:
{input}
`;
    const prompt = ChatPromptTemplate.fromTemplate(TEMPLATE);

    let tempInput = '';

    const chain = RunnableSequence.from([
      {
        input: new RunnablePassthrough(),
        memoryObject: async (input) => {
          // memory调用的loadMemoryVariables，返回值是一个对象
          const history = await this.memory.loadMemoryVariables({
            input,
          });
          // console.log('=>(memory.service.ts 42) history', history);

          tempInput = input;
          return history;
        },
      },
      RunnablePassthrough.assign({
        history: (input) => input.memoryObject.history,
      }),
      prompt,
      this.model,
      new StringOutputParser(),
      new RunnablePassthrough({
        func: async (output) => {
          await this.memory.saveContext(
            {
              input: tempInput,
            },
            {
              output,
            },
          );
        },
      }),
    ]);

    return await chain.invoke(question);
  }
}
