import { Injectable } from '@nestjs/common';
import { RunnableWithMessageHistory } from '@langchain/core/runnables';
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts';
import { GlmModelProvider } from '../ai/model/glm';
import { ChatMessageHistory } from 'langchain/memory';
import { StringOutputParser } from '@langchain/core/output_parsers';

@Injectable()
export class ChatService {
  globalHistory = {};

  async withHistory(question: string, sessionId: string) {
    const model = new GlmModelProvider().createModel();

    const prompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        'You are a helpful assistant. Answer all questions to the best of your ability.',
      ],
      new MessagesPlaceholder('history_message'),
      ['human', '{input}'],
    ]);

    const chain = prompt.pipe(model).pipe(new StringOutputParser());

    const chainWithHistory = new RunnableWithMessageHistory({
      runnable: chain,
      getMessageHistory: (sessionId) => this.getHistory(sessionId),
      inputMessagesKey: 'input',
      historyMessagesKey: 'history_message',
    });

    const res = await chainWithHistory.invoke(
      {
        input: question,
      },
      {
        configurable: { sessionId },
      },
    );

    return res;
  }

  getHistory(sessionId: string) {
    if (this.globalHistory[sessionId]) {
      return this.globalHistory[sessionId];
    } else {
      this.globalHistory[sessionId] = new ChatMessageHistory();
      return this.globalHistory[sessionId];
    }
  }
}
