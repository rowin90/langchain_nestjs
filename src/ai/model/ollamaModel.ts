import { Ollama } from '@langchain/community/llms/ollama';

export type ChatOpenAIType = Ollama;

export class OllamaModel {
  createModel(options = {}): Ollama {
    // 返回创建的模型实例
    return new Ollama({
      baseUrl: 'http://localhost:11434',
      model: 'llama3.1',
      ...options
    });
  }
}
