import { Injectable } from '@nestjs/common';
import * as path from 'path';
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts';
import { GlmModelProvider } from '../ai/model/glm';
import { StringOutputParser } from '@langchain/core/output_parsers';
import {
  RunnableSequence,
  RunnablePassthrough,
  RunnableWithMessageHistory,
} from '@langchain/core/runnables';
import { JSONChatHistory } from '../memory/JSONChatHistory';
import { RagCommonService } from './rag.common.service';

@Injectable()
export class RagHistoryService {
  private model: any;

  constructor(private ragCommonService: RagCommonService) {
    this.model = new GlmModelProvider().createModel();
  }

  async rephraseRetrieverWithLocalMemoryStore(
    question: string,
    sessionId: string,
  ) {
    const rephraseChainPrompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        '给定以下对话和一个后续问题，请将后续问题重述为一个独立的问题。请注意，重述的问题应该包含足够的信息，使得没有看过对话历史的人也能理解。',
      ],
      new MessagesPlaceholder('history'),
      ['human', '将以下问题重述为一个独立的问题：\n{question}'],
    ]);

    const rephraseChain = RunnableSequence.from([
      rephraseChainPrompt,
      this.model,
      new StringOutputParser(),
    ]);

    const contextRetrieverChain =
      await this.ragCommonService._contextRetrieverChain();

    const SYSTEM_TEMPLATE = `
    你是一个本次事故的分析者，根据文章详细解释和回答问题，你在回答时会引用作品原文。
    并且回答时仅根据原文，尽可能回答用户问题，如果原文中没有相关内容，你可以回答“原文中没有相关内容”，

    以下是原文中跟用户回答相关的内容：
    {context}
  `;

    const prompt = ChatPromptTemplate.fromMessages([
      ['system', SYSTEM_TEMPLATE],
      new MessagesPlaceholder('history'),
      ['human', '现在，你需要基于原文，回答以下问题：\n{standalone_question}`'],
    ]);

    const ragChain = RunnableSequence.from([
      RunnablePassthrough.assign({
        standalone_question: rephraseChain,
      }),
      RunnablePassthrough.assign({
        context: contextRetrieverChain,
      }),
      prompt,
      this.model,
      new StringOutputParser(),
    ]);

    const chatHistoryDir = path.join(__dirname, '../../chat_data');

    const ragChainWithHistory = new RunnableWithMessageHistory({
      runnable: ragChain,
      getMessageHistory: (sessionId) =>
        new JSONChatHistory({ sessionId, dir: chatHistoryDir }),
      historyMessagesKey: 'history',
      inputMessagesKey: 'question',
    });

    const res = await ragChainWithHistory.invoke(
      {
        question,
      },
      {
        configurable: { sessionId },
      },
    );

    return res;
  }
}
