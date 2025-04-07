import { Injectable } from '@nestjs/common';
import { OllamaEmbeddings } from '@langchain/community/embeddings/ollama';
import { ChatOpenAI } from '@langchain/openai';
import { ConfigService } from '@nestjs/config';
import { Document } from '@langchain/core/documents';
import { PineconeEmbeddings, PineconeStore } from '@langchain/pinecone';

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

/**
 * 先访问 https://app.pinecone.io/organizations/-OMZvN95jJThIY57JTD0/projects/a28b80e6-2c2d-448e-baf1-bdb5c9b13f91/indexes
 * 先在里面添加了测试数据向量
 */
@Injectable()
export class StudyPineconeService {
  private embeddingsModel: OllamaEmbeddings;
  private llm: ChatOpenAI;

  constructor(private readonly configService: ConfigService) {
    this.embeddingsModel = new OllamaEmbeddings({
      model: 'nomic-embed-text', // default value
      baseUrl: 'http://localhost:11434', // default value
      requestOptions: {
        useMMap: true, // use_mmap 1
        numThread: 10, // num_thread 10
        numGpu: 1, // num_gpu 1
      },
    });

    this.llm = new ChatOpenAI({
      modelName: 'gpt-3.5-turbo-16k',
      configuration: {
        baseURL: this.configService.get('OPENAI_API_BASE_URL'),
      },
    });
  }

  /**
   * 先添加数据到向量数据库
   */
  async addPineconeStore() {
    console.log('开始创建store');

    const db = new PineconeStore(this.embeddingsModel, {
      pineconeConfig: {
        indexName: 'llmops',
        config: {
          apiKey: this.configService.get('PINECONE_API_KEY'),
        },
        // namespace: 'dataset',
        // namespace: 'dataset',
      },
    });

    console.log('开始添加文档');
    await db.addDocuments(documents);
    console.log('结束添加文档');
  }

  /**
   * pineconeStore查询
   */
  async pineconeStore() {
    // const embeddings = new PineconeEmbeddings({
    //   apiKey: this.configService.get('PINECONE_API_KEY'),
    // });

    console.log('开始创建store');

    const db = new PineconeStore(this.embeddingsModel, {
      pineconeConfig: {
        indexName: 'llmops',
        config: {
          apiKey: this.configService.get('PINECONE_API_KEY'),
        },
        namespace: 'dataset',
        // namespace: 'dataset',
      },
    });

    // console.log('开始添加文档');
    // await db.addDocuments(documents);
    // console.log('结束添加文档');
    // return;
    console.log('开始检索');
    const res = await db.similaritySearchWithScore('我喜欢猫', 2, {
      page: {
        $lte: 5,
      },
    });
    console.log('=>(study.rag.enhance.service.ts 50) res', res);
    /**
     * > =>(study.rag.enhance.service.ts 50) res [
     *   [
     *     Document {
     *       pageContent: '我喜欢在夜晚听音乐，这让我感到放松。',
     *       metadata: [Object],
     *       id: '9fb1cb7c-2e63-4877-af98-eb2307b7b40f'
     *     },
     *     0.838231862
     *   ],
     *   [
     *     Document {
     *       pageContent: '我最喜欢的食物是意大利面，尤其是番茄酱的那种。',
     *       metadata: [Object],
     *       id: '1e465eb1-03a7-4ee8-8111-fd151a684115'
     *     },
     *     0.760830104
     *   ]
     * ]
     */
  }
}
