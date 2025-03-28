import { Injectable } from '@nestjs/common';
import { OllamaEmbeddings } from '@langchain/community/embeddings/ollama';
import { MultiQueryRetriever } from 'langchain/retrievers/multi_query';
import { FaissStore } from '@langchain/community/vectorstores/faiss';
import { BM25Retriever } from '@langchain/community/retrievers/bm25';
import { EnsembleRetriever } from 'langchain/retrievers/ensemble';
import { ChatOpenAI } from '@langchain/openai';
import { ConfigService } from '@nestjs/config';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { Document } from '@langchain/core/documents';

@Injectable()
export class StudyRagEnhanceService {
  private embeddingsModel: OllamaEmbeddings;
  private llm: ChatOpenAI;

  constructor(private readonly configService: ConfigService) {
    this.embeddingsModel = new OllamaEmbeddings({
      model: 'llama3.1', // default value
      baseUrl: 'http://localhost:11434', // default value
      requestOptions: {
        useMMap: true, // use_mmap 1
        numThread: 10, // num_thread 10
        numGpu: 1, // num_gpu 1
      },
    });

    this.llm = new ChatOpenAI({
      temperature: 0.1,
      configuration: {
        baseURL: this.configService.get('OPENAI_API_BASE_URL'),
      },
    });
  }

  /**
   * 多查询检索器
   */
  async multiQueryRetriever() {
    // 向量数据库
    const db = await FaissStore.load(
      './faiss_index/api_md_faiss_index',
      this.embeddingsModel,
    );
    // 转化成检索器
    // FAISS 不支持 mmr
    const retriever = db.asRetriever({
      searchType: 'similarity',
      k: 10,
    });
    const multi_query_retriever = MultiQueryRetriever.fromLLM({
      retriever,
      llm: this.llm,
      // 不传 prompt 会有默认的英文prompt
      prompt: ChatPromptTemplate.fromTemplate(`
        "你是一个AI语言模型助手。你的任务是生成给定用户问题的3个不同版本，以从向量数据库中检索相关文档。"

        "通过提供用户问题的多个视角，你的目标是帮助用户克服基于距离的相似性搜索的一些限制。" 
        "请用换行符分隔这些替代问题。"

        "原始问题:{question}"
      `),
    });

    const docs = await multi_query_retriever.invoke(
      '关于LLMOps应用配置的文档有哪些',
      { configurable: { temperature: 0.3 } },
    );
    console.log('=>(study.rag.enhance.service.ts 50) docs', docs);
    for (const doc of docs) {
      console.log('=>(study.rag.enhance.service.ts 50) doc', doc.pageContent);
    }
    console.log('=>(study.rag.enhance.service.ts 50) length', docs.length);
  }

  /**
   * 集成检索器
   */
  async ensemble() {
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

    const retriever = BM25Retriever.fromDocuments(documents, { k: 3 });
    const db = await FaissStore.load('./faiss_index', this.embeddingsModel);

    const faiss_retriever = db.asRetriever({ k: 3 });

    // 4.初始化集成检索器

    const ensemble_retriever = new EnsembleRetriever({
      retrievers: [retriever, faiss_retriever],
      weights: [0.5, 0.5],
    });

    const res = await ensemble_retriever.invoke('除了猫，你养了什么宠物呢？');
    console.log('=>(study.rag.enhance.service.ts 133) res', res);
  }
}
