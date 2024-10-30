import type { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { InMemoryChatMessageHistory } from '@langchain/core/chat_history';
import { BaseMessage, MessageContent } from '@langchain/core/messages';
import type { AIMessageChunk } from '@langchain/core/messages';
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts';
import {
  Runnable,
  RunnableWithMessageHistory,
} from '@langchain/core/runnables';
import type { RunnableConfig } from '@langchain/core/runnables';
import { z } from 'zod';

// 定义一个类型别名，表示一个值可能是 Promise 或者直接的值
type MaybePromise<T> = T | Promise<T>;

// 定义创建 Runnable 的选项，包括是否使用历史记录、历史记录消息和信号
export interface BaseModelProviderCreateRunnableOptions {
  useHistory?: boolean;
  historyMessages?: BaseMessage[];
  signal?: AbortSignal;
}

// 定义创建结构化输出 Runnable 的选项，包括是否使用历史记录、历史记录消息和 Zod schema
export interface BaseModelProviderCreateStructuredOutputRunnableOptions<
  ZSchema extends z.ZodType<any> = z.ZodType<any>,
> {
  useHistory?: boolean;
  historyMessages?: BaseMessage[];
  zodSchema?: ZSchema;
}

// 定义一个抽象类，用于提供基础模型
export abstract class BaseModelProvider<Model extends BaseChatModel> {
  // 定义一个静态属性，用于存储会话 ID 和历史记录的映射
  static sessionIdHistoriesMap: Record<string, InMemoryChatMessageHistory> = {};

  // 定义一个静态方法，用于将答案内容转换为文本
  static answerContentToText(content: MessageContent): string {
    // 如果内容是字符串，直接返回
    if (typeof content === 'string') {
      return content;
    }

    // 如果内容是数组，则遍历数组，将每个元素的文本拼接起来
    return content
      .map((c) => {
        // 如果元素类型是文本，则返回文本内容
        if (c.type === 'text') {
          return c.text;
        }
        // 否则返回空字符串
        return '';
      })
      .join('');
  }

  // 定义一个可选的模型属性
  model?: Model;

  // 定义一个抽象方法，用于创建模型
  abstract createModel(): MaybePromise<Model>;

  // 定义一个异步方法，用于获取模型
  async getModel(): Promise<Model> {
    // 如果模型不存在，则创建模型
    if (!this.model) {
      this.model = await this.createModel();
    }
    // 返回模型
    return this.model;
  }

  // 定义一个方法，用于创建提示
  createPrompt(options?: {
    useHistory?: boolean;
  }): MaybePromise<ChatPromptTemplate> {
    // 获取选项，默认使用历史记录
    const { useHistory = true } = options ?? {};
    // 创建提示模板，包含历史记录占位符和人类消息模板
    const prompt = ChatPromptTemplate.fromMessages(
      [
        useHistory ? new MessagesPlaceholder('history') : '',
        HumanMessagePromptTemplate.fromTemplate('{input}'),
      ].filter(Boolean),
    );
    // 返回提示模板
    return prompt;
  }

  // 定义一个异步方法，用于获取历史记录
  async getHistory(
    sessionId: string,
    appendHistoryMessages?: BaseMessage[],
  ): Promise<InMemoryChatMessageHistory> {
    // 如果会话 ID 的历史记录不存在，则创建新的历史记录
    if (BaseModelProvider.sessionIdHistoriesMap[sessionId] === undefined) {
      const messageHistory = new InMemoryChatMessageHistory();

      // 如果存在追加的历史记录消息，则添加到历史记录中
      if (appendHistoryMessages && appendHistoryMessages.length > 0) {
        await messageHistory.addMessages(appendHistoryMessages);
      }

      // 将会话 ID 和历史记录映射保存到静态属性中
      BaseModelProvider.sessionIdHistoriesMap[sessionId] = messageHistory;
    }
    // 返回会话 ID 对应的历史记录
    return BaseModelProvider.sessionIdHistoriesMap[sessionId];
  }

  // 定义一个方法，用于创建带历史记录的 Runnable
  createRunnableWithMessageHistory<Chunk extends AIMessageChunk>(
    chain: Runnable<any, Chunk, RunnableConfig>,
    historyMessages: BaseMessage[],
  ) {
    // 创建一个带历史记录的 Runnable，并设置相关参数
    return new RunnableWithMessageHistory({
      runnable: chain,
      // 获取历史记录的回调函数
      getMessageHistory: async (sessionId) =>
        await this.getHistory(sessionId, historyMessages),
      // 输入消息的键
      inputMessagesKey: 'input',
      // 历史消息的键
      historyMessagesKey: 'history',
    });
  }

  // 定义一个异步方法，用于创建 Runnable
  async createRunnable(options?: BaseModelProviderCreateRunnableOptions) {
    // 获取选项，默认使用历史记录
    const { useHistory = true, historyMessages = [], signal } = options ?? {};
    // 获取模型
    const model = await this.getModel();
    // 创建提示
    const prompt = await this.createPrompt({ useHistory });
    // 创建链，将提示和模型连接起来
    const chain = prompt.pipe(signal ? model.bind({ signal }) : model);
    // 如果使用历史记录，则创建带历史记录的 Runnable
    return useHistory
      ? await this.createRunnableWithMessageHistory(
          chain,
          historyMessages || [],
        )
      : chain;
  }

  // 定义一个异步方法，用于创建结构化输出 Runnable
  async createStructuredOutputRunnable<ZSchema extends z.ZodType<any>>(
    options?: BaseModelProviderCreateStructuredOutputRunnableOptions<ZSchema>,
  ) {
    // 获取选项，默认使用历史记录
    const {
      useHistory = true,
      historyMessages = [],
      zodSchema,
    } = options ?? {};
    // 获取模型
    const model = await this.getModel();
    // 创建提示
    const prompt = await this.createPrompt({ useHistory });
    // 创建链，将提示和模型连接起来
    const chain = prompt.pipe(model);
    // 如果使用历史记录，则创建带历史记录的 Runnable
    return useHistory
      ? await this.createRunnableWithMessageHistory(
          chain,
          historyMessages || [],
        )
      : chain;
  }
}
