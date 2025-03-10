import { Injectable } from '@nestjs/common';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import { ConfigService } from '@nestjs/config';
import {
  StringOutputParser,
  JsonOutputParser,
} from '@langchain/core/output_parsers';

@Injectable()
export class StudyOutputParseService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * string output parser
   */
  async outputParser() {
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

    const parser = new StringOutputParser();

    const content = await parser.invoke(ai_message);
    console.log('=>content', content);
  }

  /**
   * json output parser
   */
  async jsonParser() {
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

    const parser = new JsonOutputParser();

    const content = await parser.invoke(ai_message);
    console.log('=>content', content);
  }
}
