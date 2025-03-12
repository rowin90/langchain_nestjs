import { Injectable } from '@nestjs/common';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import { ConfigService } from '@nestjs/config';
import { RunnableSequence, RunnableLambda } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';

@Injectable()
export class StudyBindService {
  constructor(private readonly configService: ConfigService) {}

  async bind() {
    const prompt = ChatPromptTemplate.fromMessages([
      {
        role: 'system',
        content: `你是OpenAI开发的聊天机器人，请重复用户的输入，其他的任何字符不要输出`,
      },
      { role: 'user', content: '{query}' },
    ]);

    const llm = new ChatOpenAI({
      modelName: 'gpt-3.5-turbo-16k',
      configuration: {
        baseURL: this.configService.get('OPENAI_API_BASE_URL'),
      },
    });

    const parser = new StringOutputParser();

    const chain = RunnableSequence.from([
      prompt,
      llm.bind({
        stop: ['world'],
      }),
      parser,
    ]);

    const res = await chain.invoke({ query: 'hello world' });
    console.log('=>(study.bind.service.ts 39) res', res);
  }

  /**
   * @deprecated
   */
  ramadaBind(location: string, unit: string) {
    function get_weather({ location, unit }) {
      return `${location}天气为24${unit}`;
    }

    const get_weather_runnable = RunnableLambda.from(get_weather);
  }
}
