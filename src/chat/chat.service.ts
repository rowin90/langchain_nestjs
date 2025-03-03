import { Injectable } from '@nestjs/common';
import {
  RunnableWithMessageHistory,
  RunnableSequence,
  RunnablePassthrough,
} from '@langchain/core/runnables';
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts';
import { OllamaModel } from '../ai/model/ollamaModel';
import { ChatMessageHistory, getBufferString } from 'langchain/memory';
import { StringOutputParser } from '@langchain/core/output_parsers';

@Injectable()
export class ChatService {
  private model: any;

  constructor() {
    this.model = new OllamaModel().createModel();
  }

  globalHistory = {};
  globalSummary = {};

  async withHistory(question: string, sessionId: string) {
    const prompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        'You are a helpful assistant. Answer all questions to the best of your ability.',
      ],
      new MessagesPlaceholder('history_message'),
      ['human', '{input}'],
    ]);

    const chain = prompt.pipe(this.model).pipe(new StringOutputParser());

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

  getSummary(sessionId: string) {
    if (this.globalSummary[sessionId]) {
      return this.globalSummary[sessionId];
    } else {
      this.globalSummary[sessionId] = {};
      return this.globalSummary[sessionId];
    }
  }

  /**
   * 带历史记录总结的对话
   * @param question
   * @param sessionId
   */
  async withSummaryHistory(question: string, sessionId: string) {
    // 总结chain
    const summaryPrompt = ChatPromptTemplate.fromTemplate(`
Progressively summarize the lines of conversation provided, adding onto the previous summary returning a new summary

Current summary:
{summary}

New lines of conversation:
{new_lines}

New summary:
`);

    const summaryChain = RunnableSequence.from([
      summaryPrompt,
      this.model,
      new StringOutputParser(),
    ]);

    const chatPrompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        `You are a helpful assistant. Answer all questions to the best of your ability.

    Here is the chat history summary:
    {history_summary}
    `,
      ],
      ['human', '{input}'],
    ]);
    const history = this.getHistory(sessionId);
    const summary = this.getSummary(sessionId);

    const chatChain = RunnableSequence.from([
      {
        input: new RunnablePassthrough({
          func: (input) => history.addUserMessage(input),
        }),
      },
      RunnablePassthrough.assign({
        history_summary: () => {
          // console.log('=>(chat.service.ts 144) summary', summary);
          return summary;
        },
      }),
      chatPrompt,
      this.model,
      new StringOutputParser(),
      new RunnablePassthrough({
        func: async (input) => {
          history.addAIChatMessage(input);
          const messages = await history.getMessages();
          const new_lines = getBufferString(messages);
          const newSummary = await summaryChain.invoke({
            summary,
            new_lines,
          });
          history.clear();
          // 记录新的总结
          this.globalSummary[sessionId] = newSummary;
        },
      }),
    ]);

    return await chatChain.invoke(question);
  }
}
