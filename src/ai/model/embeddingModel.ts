import { OllamaEmbeddings } from '@langchain/community/embeddings/ollama';

export class EmbeddingModel {
  createModel() {
    // 返回创建的模型实例
    return new OllamaEmbeddings({
      model: 'llama3.1', // default value
      baseUrl: 'http://localhost:11434', // default value
      requestOptions: {
        useMMap: true, // use_mmap 1
        numThread: 10, // num_thread 10
        numGpu: 1, // num_gpu 1
      },
    });
  }
}
