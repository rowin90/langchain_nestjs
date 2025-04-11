import { Injectable, Inject } from '@nestjs/common';
import { OllamaEmbeddings } from '@langchain/community/embeddings/ollama';
import { ChatOpenAI } from '@langchain/openai';
import { MilvusClient } from '@zilliz/milvus2-sdk-node';
import { Milvus } from '@langchain/community/vectorstores/milvus';
import { documents, texts } from '../share/documents';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { Document } from 'langchain/document';
import { RunnableSequence } from '@langchain/core/runnables';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';

@Injectable()
export class StudyMilvusProjectService {
  constructor(
    @Inject('OLLAMA_EMBEDDINGS')
    private readonly embedding: OllamaEmbeddings,

    @Inject('OPEN_AI')
    private readonly llm: ChatOpenAI,

    @Inject('MILVUS_CLIENT')
    private readonly milvusClient: MilvusClient,
  ) {}

  /**
   * 使用LangChain Milvus Retriever搜索
   */
  async searchWithLangchainMilvusRetriever() {
    const vectorStore = new Milvus(this.embedding, {
      collectionName: 'article',
      vectorField: 'content_vector',
      textField: 'content',
      clientConfig: {
        address: 'localhost:19530',
        timeout: 5000,
        database: 'langchain_milvus',
      },
      indexCreateOptions: {
        index_type: 'IVF_HNSW',
        metric_type: 'COSINE',
      },
    });

    const retriever = vectorStore.asRetriever({
      k: 4,
    });

    const convertDocsToString = (documents: Document[]): string => {
      return documents.map((document) => document.pageContent).join('\n');
    };

    const contextRetrieverChain = RunnableSequence.from([
      (input) => input.question,
      retriever,
      convertDocsToString,
    ]);

    const SYSTEM_TEMPLATE = `
    你是一个本次事故的分析者，根据文章详细解释和回答问题，你在回答时会引用作品原文。
    并且回答时仅根据原文，尽可能回答用户问题，如果原文中没有相关内容，你可以回答“原文中没有相关内容”，

    以下是原文中跟用户回答相关的内容：
    {context}
  `;

    const prompt = ChatPromptTemplate.fromMessages([
      ['system', SYSTEM_TEMPLATE],
      ['human', '现在，你需要基于原文，回答以下问题：\n{question}`'],
    ]);

    const chain = RunnableSequence.from([
      {
        context: contextRetrieverChain,
        question: (input) => input.question,
      },
      prompt,
      this.llm,
      new StringOutputParser(),
    ]);

    const res = await chain.invoke({
      question: '这次事故的原因是什么？该如何避免',
    });

    console.log('=>(study.milvus.service.ts 190) res', res);
  }
}
