import { Injectable } from '@nestjs/common';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import { ConfigService } from '@nestjs/config';
import { StringOutputParser } from '@langchain/core/output_parsers';

import { BaseCallbackHandler } from '@langchain/core/callbacks/base';

class LLMOpsCallbackHandler extends BaseCallbackHandler {
  name = 'LLMOps';

  async handleLLMStart(llm: any, prompts: any, _: any, __: any, ___: any) {
    console.log('LLMOps handleLLMStart', llm, prompts);
  }

  async handleLLMEnd(output: any) {
    console.log('LLMOps handleLLMEnd', output);
  }

  async handleLLMError(err: any) {
    console.log('LLMOps handleLLMError', err);
  }
}

@Injectable()
export class StudyCallbacksService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * PromptTemplate
   */
  async callbacks() {
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
      // callbacks: [new LLMOpsCallbackHandler()], // 不推荐在这里配置
    });

    const parser = new StringOutputParser();

    const chain = prompt
      .pipe(llm)
      .pipe(parser)
      .withConfig({ callbacks: [new LLMOpsCallbackHandler()] });

    const res = await chain.invoke({
      question: '请讲一个关于程序员的冷笑话',
    });
    console.log('=>(study.callbacks.service.ts 60) res', res);
  }
}
