import { ChatOpenAI, OpenAICallOptions } from '@langchain/openai';

export type ChatOpenAIType = ChatOpenAI;
export type OpenAICallOptionsType = OpenAICallOptions & { temperature: number };

export class OpenAIModel {
  createModel(options = {}): ChatOpenAI {
    // 返回创建的模型实例
    return new ChatOpenAI({
      configuration: {
        baseURL: 'https://api.shellgpt.top/v1',
      },
      ...options,
    });
  }
}
