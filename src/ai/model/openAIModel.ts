import { ChatOpenAI } from '@langchain/openai';

export type ChatOpenAIType = ChatOpenAI;

export class OpenAIModel {
  createModel(): ChatOpenAI {
    // 返回创建的模型实例
    return new ChatOpenAI({
      configuration: {
        baseURL: 'https://api.shellgpt.top/v1',
      },
    });
  }
}
