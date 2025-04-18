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
import { documents } from '../share/documents';

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
