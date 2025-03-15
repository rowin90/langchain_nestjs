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
      ['我是一只晓晓宝', '今年3岁', '我喜欢读书，古诗'],
      { page: 1 },
      this.embeddingsModel,
    );
    console.log(db._index.ntotal()); //  3
    // const res = await db.similaritySearch('我喜欢篮球');
    const res = await db.similaritySearchWithScore('我喜欢篮球');
    db.save('./faiss_index');
    console.log('=>(study.huggingface.service.ts 46) res', res);
    /**
     * [
     *   Document {
     *     pageContent: '我是一只晓晓宝',
     *     metadata: { page: 1 },
     *     id: undefined
     *   },
     *   Document {
     *     pageContent: '今年3岁',
     *     metadata: { page: 1 },
     *     id: undefined
     *   },
     *   Document {
     *     pageContent: '我喜欢读书，古诗',
     *     metadata: { page: 1 },
     *     id: undefined
     *   }
     * ]
     */
    // db.asRetriever();
    // console.log('=>(study.huggingface.service.ts 39) db', db);
  }

  /**
   * faiss_load
   */
  async faiss_load() {
    // 情感分析
    const db = await FaissStore.load('./faiss_index', this.embeddingsModel);
    const res = await db.similaritySearchWithScore('我喜欢篮球', 2);
    console.log('=>(study.huggingface.service.ts 46) res', res);
  }
}
