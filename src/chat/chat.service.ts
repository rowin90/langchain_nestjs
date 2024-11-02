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
  async withHistory(question: string) {
    const history = new ChatMessageHistory();
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
      getMessageHistory: (sessionId) => history,
      inputMessagesKey: 'input',
      historyMessagesKey: 'history_message',
    });

    const res1 = await chainWithHistory.invoke(
      {
        input: 'hi, my name is Kai',
      },
      {
        configurable: { sessionId: 'none' },
      },
    );

    const res2 = await chainWithHistory.invoke(
      {
        input: question,
      },
      {
        configurable: { sessionId: 'none' },
      },
    );

    return res2;
  }
}
