import { Injectable } from '@nestjs/common';
import {
  ChatPromptTemplate,
  PromptTemplate,
  PipelinePromptTemplate,
} from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StudyModalService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * modal invoke
   */
  async modal() {
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

    const prompt_value = await prompt.invoke({
      question: '现在是几点，请讲一个关于程序员的冷笑话',
    });

    const ai_message = await llm.invoke(prompt_value);
    console.log('=>ai_message', ai_message);
  }

  /**
   * modal batch
   */
  async batch() {
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

    const prompt_value = await prompt.invoke({
      question: '现在是几点，请讲一个关于程序员的冷笑话',
    });

    const ai_message = await llm.batch([
      prompt_value,
      await prompt.invoke({
        question: '请讲一个关于医生的冷笑话',
      }),
    ]);
  }

  /**
   * modal stream
   */
  async stream() {
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

    const prompt_value = await prompt.invoke({
      question: '现在是几点，请讲一个关于程序员的冷笑话',
    });

    const streamValue = await llm.stream(prompt_value);
    for await (const truck of streamValue) {
      console.log(truck.content);
    }
  }
}
