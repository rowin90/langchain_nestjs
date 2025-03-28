import { Injectable } from '@nestjs/common';
import { pipeline } from '@huggingface/transformers';
import { FaissStore } from '@langchain/community/vectorstores/faiss';
import { OllamaEmbeddings } from '@langchain/community/embeddings/ollama';
import { Document } from '@langchain/core/documents';

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

  /**
   * 转化成向量存储在本地faiss
   */
  async verctor() {
    const documents = [
      new Document({
        pageContent: '笨笨是一只很喜欢睡觉的猫咪',
        metadata: { page: 1 },
      }),
      new Document({
        pageContent: '我喜欢在夜晚听音乐，这让我感到放松。',
        metadata: { page: 2 },
      }),
      new Document({
        pageContent: '猫咪在窗台上打盹，看起来非常可爱',
        metadata: { page: 3 },
      }),
      new Document({
        pageContent: '学习新技能是每个人都应该追求的目标。',
        metadata: { page: 4 },
      }),
      new Document({
        pageContent: '我最喜欢的食物是意大利面，尤其是番茄酱的那种。',
        metadata: { page: 5 },
      }),
      new Document({
        pageContent: '昨晚我做了一个奇怪的梦，梦见自己在太空飞行。',
        metadata: { page: 6 },
      }),
      new Document({
        pageContent: '我的手机突然关机了，让我有些焦虑。',
        metadata: { page: 7 },
      }),
      new Document({
        pageContent: '阅读是我每天都会做的事情，我觉得很充实。',
        metadata: { page: 8 },
      }),
      new Document({
        pageContent: '他们一起计划了一次周末的野餐，希望天气能好。',
        metadata: { page: 9 },
      }),
      new Document({
        pageContent: '我的狗喜欢追逐球，看起来非常开心。',
        metadata: { page: 10 },
      }),
    ];

    // 先存储向量，后续可以直接加载即可，节约时间
    // const db = await FaissStore.fromDocuments(documents, this.embeddingsModel);
    // db.save('./faiss_index');
    const db = await FaissStore.load('./faiss_index', this.embeddingsModel);
    const res = await db.similaritySearchWithScore('我喜欢阅读', 5);
    // const r = res.filter(([doc, score]) => score < 15000);
    // const res = await db.similaritySearch('我养了一只猫，叫笨笨');
    /**
     *    [
     *     { pageContent: '阅读是我每天都会做的事情，我觉得很充实。', metadata: [Object] },
     *     14143.166015625
     *   ],
     *   [
     *     { pageContent: '学习新技能是每个人都应该追求的目标。', metadata: [Object] },
     *     15260.66796875
     *   ],
     *   [
     *     { pageContent: '他们一起计划了一次周末的野餐，希望天气能好。', metadata: [Object] },
     *     16685.11328125
     *   ],
     *   [
     *     { pageContent: '我的狗喜欢追逐球，看起来非常开心。', metadata: [Object] },
     *     16977.6640625
     *   ],
     */
    console.log('=>(study.huggingface.service.ts 129) res', res);
  }
}
