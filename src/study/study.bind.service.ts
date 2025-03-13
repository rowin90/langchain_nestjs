import { Injectable } from '@nestjs/common';
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  MessagesPlaceholder,
  SystemMessagePromptTemplate,
} from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import { ConfigService } from '@nestjs/config';
import {
  RunnableSequence,
  RunnableLambda,
  RunnableConfig,
  RunnablePassthrough,
} from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { BufferWindowMemory, BaseChatMemory } from 'langchain/memory';

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
   * ramadaBind
   */
  async ramadaBind() {
    function get_weather(location, config: any) {
      return `${location}天气为24${config.unit}`;
    }

    const get_weather_runnable = RunnableLambda.from(get_weather).bind({
      unit: '摄氏度',
    });

    const res = await get_weather_runnable.invoke('北京');
    console.log('=>(study.bind.service.ts 55) res', res);
  }

  /**
   * withRetry，withFallbacks，withListeners
   */
  async retry() {
    let counter = -1;

    function count(x: number) {
      counter += 1;
      console.log(`当前的值为counter: ${counter}`);
      const random = Math.random();
      console.log('=>(study.bind.service.ts 68) random', random);
      if (random > 0.1) {
        throw new Error('counter is too high');
      }
    }

    const retry_chain = RunnableLambda.from(count)
      .withRetry({
        stopAfterAttempt: 4,
        onFailedAttempt: (err, attempt) => {
          console.log(`第${attempt}次尝试失败，错误信息为：${err.message}`);
        },
      })
      .withFallbacks([
        RunnableLambda.from(() => {
          console.log('fall back');
        }),
      ])
      .withListeners({
        onStart: () => {
          console.log('开始执行');
        },
        onEnd: () => {
          console.log('执行结束');
        },
        onError: (err) => {
          console.log('执行错误', err);
        },
      });

    const res = await retry_chain.invoke(2);
    console.log('=>(study.bind.service.ts 55) res', res);
  }

  /**
   * autoMemory 可以实现自动记忆功能
   */
  async autoMemory() {
    const chatPrompt = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(
        'The following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific details from its context. If the AI does not know the answer to a question, it truthfully says it does not know.',
      ),
      new MessagesPlaceholder('history'),
      HumanMessagePromptTemplate.fromTemplate('{input}'),
    ]);

    function count(x: any, config: any) {
      // todo 可以自己加记忆   const m = this.getMemory();
      // if (config?.memory) {
      //   console.log('config?.memory', config?.memory);
      //   // 调用 memory 加载记忆
      //   // const mem = memory.loadMemoryVariables({input:''})
      // }

      // return

      return { history: config.configurable.memory, x };
    }

    const retry_chain = RunnableSequence.from([
      RunnableLambda.from(count),
      RunnablePassthrough.assign({
        text: () => 1,
        input: new RunnablePassthrough(),
      }),
      // chatPrompt,
    ]).withListeners({
      onEnd: () => {
        // save_memory() 存储记忆
        console.log('执行结束');
      },
    });

    const res = await retry_chain.invoke(
      { input: 2 },
      {
        configurable: { memory: '这是历史消息' },
      },
    );
    console.log('=>(study.bind.service.ts 55) res', res);
  }

  getMemory(m = {}): BaseChatMemory {
    return new BufferWindowMemory({ memoryKey: 'history', k: 2 });
  }
}
