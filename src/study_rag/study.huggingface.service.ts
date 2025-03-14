import { Injectable } from '@nestjs/common';
import { pipeline } from '@huggingface/transformers';
import { FaissStore } from '@langchain/community/vectorstores/faiss';
import { OllamaEmbeddings } from '@langchain/community/embeddings/ollama';

@Injectable()
export class StudyHuggingFaceService {
  private embeddingsModel: OllamaEmbeddings;

  constructor() {
    this.embeddingsModel = new OllamaEmbeddings({
      model: 'llama3.1', // default value
      baseUrl: 'http://localhost:11434', // default value
      requestOptions: {
        useMMap: true, // use_mmap 1
        numThread: 10, // num_thread 10
        numGpu: 1, // num_gpu 1
      },
    });
  }

  /**
   * embeddings_cache
   * @description huggingFace 终端访问模型，fetch 超时，暂时不可用
   */
  async hugging_face_embeddings() {
    // 情感分析
    const classifier = await pipeline('sentiment-analysis');

    const result = await classifier('I love transformers!');
    console.log('=>(study.huggingface.service.ts 20) result', result);
  }

  /**
   * faiss
   */
  async faiss() {
    // 情感分析
    const db = await FaissStore.fromTexts(
      ['我是一只晓晓宝'],
      { page: 1 },
      this.embeddingsModel,
    );
    console.log('=>(study.huggingface.service.ts 39) db', db);
  }
}
