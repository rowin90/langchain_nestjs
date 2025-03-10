import { Injectable } from '@nestjs/common';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import { ConfigService } from '@nestjs/config';
import { StringOutputParser } from '@langchain/core/output_parsers';
import {
  RunnableAssign,
  RunnableLambda,
  RunnableParallel,
  RunnablePassthrough,
} from '@langchain/core/runnables';

@Injectable()
export class StudyRunnableService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * chain
   */
  async chain() {
    const prompt = await ChatPromptTemplate.fromMessages([
      {
        role: 'system',
        content: `你是OpenAI开发的聊天机器人，请回答用户的问题，现在的时间是{now}`,
      },
      { role: 'user', content: '{question}' },
    ]).partial({ now: () => new Date().toLocaleDateString() });

    const llm = new ChatOpenAI({
      modelName: 'gpt-3.5-turbo-16k',
      configuration: {
        baseURL: this.configService.get('OPENAI_API_BASE_URL'),
      },
    });

    const parser = new StringOutputParser();

    const chain = prompt.pipe(llm).pipe(parser);

    const res = await chain.invoke({
      question: '请讲一个关于程序员的冷笑话',
    });

    console.log('=>res', res);
  }

  /**
   * parallel
   */
  async parallel() {
    const prompt = await ChatPromptTemplate.fromMessages([
      {
        role: 'system',
        content: `你是OpenAI开发的聊天机器人，请回答用户的问题，现在的时间是{now}`,
      },
      { role: 'user', content: '{question}' },
    ]).partial({ now: () => new Date().toLocaleDateString() });

    const llm = new ChatOpenAI({
      modelName: 'gpt-3.5-turbo-16k',
      configuration: {
        baseURL: this.configService.get('OPENAI_API_BASE_URL'),
      },
    });

    const parser = new StringOutputParser();

    const chain = prompt.pipe(llm).pipe(parser);

    const map_chain = RunnableParallel.from({
      question1: chain,
      question2: chain,
    });

    const res = await map_chain.invoke({
      question: '请讲一个关于程序员的冷笑话',
    });

    console.log('=>res', res);
  }

  async generateQuestionChain() {
    const prompt = await ChatPromptTemplate.fromMessages([
      {
        role: 'system',
        content: `你是OpenAI开发的聊天机器人，请回答用户的问题，现在的时间是{now}`,
      },
      { role: 'user', content: '{a} + {b} 等于什么' },
    ]).partial({ now: () => new Date().toLocaleDateString() });

    const llm = new ChatOpenAI({
      modelName: 'gpt-3.5-turbo-16k',
      configuration: {
        baseURL: this.configService.get('OPENAI_API_BASE_URL'),
      },
    });

    const parser = new StringOutputParser();

    return prompt.pipe(llm).pipe(parser);
  }

  /**
   * parallel
   */
  async parallel2chain() {
    const chain = await this.generateQuestionChain();
    const map_chain = RunnableParallel.from({
      a: (input) => input + '222',
      b: (input) => input + '333',
    });
    console.log('=>(study.runnable.service.ts 112) map_chain', map_chain);

    console.log('=>res', await map_chain.pipe(chain).invoke('444'));
  }

  /**
   * Lambda
   */
  async lambda() {
    const chain = await this.generateQuestionChain();

    const fun = RunnableLambda.from(() => ({ a: 111, b: 222 }));

    console.log('=>res', await fun.pipe(chain).invoke({}));
  }

  /**
   * assgin
   */
  async assgin() {
    const chain = await this.generateQuestionChain();
    const rrr = RunnableParallel.from({
      a: () => 666,
    });

    const runnableAssign = new RunnableAssign({ mapper: rrr });
    console.log('=>res', await runnableAssign.pipe(chain).invoke({ b: 222 }));
  }

  /**
   * passthrough
   */
  async passthrough() {
    const chain = await this.generateQuestionChain();
    const rrr = RunnableParallel.from({
      a: (input: number) => input + 444,
      b: new RunnablePassthrough(),
    });

    console.log('=>res', await rrr.pipe(chain).invoke(222));
  }
}
