import { Injectable } from '@nestjs/common';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import { ConfigService } from '@nestjs/config';
import { InMemoryChatMessageHistory } from '@langchain/core/chat_history';
import { ConversationSummaryBufferMemory } from 'langchain/memory';
import {
  SystemMessagePromptTemplate,
  MessagesPlaceholder,
  HumanMessagePromptTemplate,
} from '@langchain/core/prompts';
import {
  RunnableSequence,
  RunnableWithMessageHistory,
} from '@langchain/core/runnables';
import { ConversationChain } from 'langchain/chains';
import { StringOutputParser } from '@langchain/core/output_parsers';

@Injectable()
export class StudyMemoryService {
  private store: Record<string, any>;
  constructor(private readonly configService: ConfigService) {
    this.store = {};
  }

  /**
   * memory
   */
  async memory() {
    const chat_history = new InMemoryChatMessageHistory();

    chat_history.addUserMessage('我是小小宝');
    chat_history.addAIMessage('你好，小小宝，我是你的AI助手');
    console.log(
      '=>(study.memory.service.ts 19) chat_history',
      await chat_history.getMessages(),
    );
  }

  /**
   * conversationSummary
   * 不能很好的融合在 LCEL 模式下，不推荐使用
   */
  async conversationSummary() {
    // Initialize the memory with a specific model and token limit
    const memory = new ConversationSummaryBufferMemory({
      llm: new ChatOpenAI({
        modelName: 'gpt-3.5-turbo-16k',
        configuration: {
          baseURL: this.configService.get('OPENAI_API_BASE_URL'),
        },
      }),
      maxTokenLimit: 10,
    });

    // Save conversation context to memory
    await memory.saveContext(
      { input: '你好，我叫晓晓宝' },
      { output: '你好，晓晓宝，我是你的AI助手' },
    );
    await memory.saveContext(
      { input: '我喜欢篮球，唱歌，你呢' },
      { output: '太棒了' },
    );

    // Load the conversation history from memory
    const history = await memory.loadMemoryVariables({});
    console.log({ history });

    // Create a chat prompt using the conversation history
    const chatPrompt = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(
        'The following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific details from its context. If the AI does not know the answer to a question, it truthfully says it does not know.',
      ),
      new MessagesPlaceholder('history'),
      HumanMessagePromptTemplate.fromTemplate('{input}'),
    ]);

    // Initialize the conversation chain with the model, memory, and prompt
    const chain = new ConversationChain({
      llm: new ChatOpenAI({
        modelName: 'gpt-3.5-turbo-16k',
        configuration: {
          baseURL: this.configService.get('OPENAI_API_BASE_URL'),
        },
        verbose: true,
      }),
      memory: memory,
      prompt: chatPrompt,
    });

    const res = await chain.invoke({ input: '我叫什么，我喜欢什么' });
    console.log('=>(study.memory.service.ts 76) res', res);
  }

  async withHistory(query: string, sessionId = 'xiaobao') {
    const prompt = await ChatPromptTemplate.fromMessages([
      {
        role: 'system',
        content: `你是OpenAI开发的聊天机器人，请回答用户的问题，现在的时间是{now}`,
      },
      new MessagesPlaceholder('history'),
      { role: 'user', content: '{query}' },
    ]).partial({ now: () => new Date().toLocaleDateString() });

    const llm = new ChatOpenAI({
      modelName: 'gpt-3.5-turbo-16k',
      configuration: {
        baseURL: this.configService.get('OPENAI_API_BASE_URL'),
      },
    });

    const parser = new StringOutputParser();

    const chain = RunnableSequence.from([prompt, llm, parser]);

    const withHistoryChain = new RunnableWithMessageHistory({
      runnable: chain,
      getMessageHistory: (sessionId) => {
        return this._getHistory(sessionId);
      },
      historyMessagesKey: 'history',
      inputMessagesKey: 'query',
    });

    const res = await withHistoryChain.invoke(
      { query },
      {
        configurable: {
          sessionId,
        },
      },
    );
    console.log('=>(study.memory.service.ts 134) res', res);
  }

  _getHistory(sessionId: string) {
    if (this.store[sessionId]) {
      return this.store[sessionId];
    } else {
      this.store[sessionId] = new InMemoryChatMessageHistory();
      return this.store[sessionId];
    }
  }
}
