import { Injectable } from '@nestjs/common';
import { OllamaEmbeddings } from '@langchain/community/embeddings/ollama';
import { CacheBackedEmbeddings } from 'langchain/embeddings/cache_backed';
import { LocalFileStore } from 'langchain/storage/file_system';
import * as path from 'path';

@Injectable()
export class StudyRAGService {
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
   */
  async embeddings_cache() {
    const store = await LocalFileStore.fromPath('.cache');
    const embeddings_with_cache = CacheBackedEmbeddings.fromBytesStore(
      this.embeddingsModel,
      store,
      {
        namespace: 'ollama_embeddings_llama3.1',
      },
    );

    const documents_vector = await embeddings_with_cache.embedDocuments([
      '我叫晓晓宝',
      '今年3岁了',
      '我喜欢读书，玩玩具',
    ]);

    const query_vector = await embeddings_with_cache.embedQuery('我喜欢玩玩具');
    console.log('=>(study.rag.service.ts 47) query_vector', query_vector);
    console.log(
      '=>(study.rag.service.ts 45) documents_vector',
      documents_vector,
    );
  }
}
