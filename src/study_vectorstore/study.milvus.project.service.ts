import { Injectable, Inject } from '@nestjs/common';
import { OllamaEmbeddings } from '@langchain/community/embeddings/ollama';
import { ChatOpenAI } from '@langchain/openai';
import { MilvusClient } from '@zilliz/milvus2-sdk-node';
import { Milvus } from '@langchain/community/vectorstores/milvus';
import { Document } from 'langchain/document';
import {
  RunnableSequence,
  RunnablePassthrough,
} from '@langchain/core/runnables';
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RedisChatMessageHistory } from '@langchain/community/stores/message/ioredis';
import { BufferMemory, BufferWindowMemory } from 'langchain/memory';

@Injectable()
export class StudyMilvusProjectService {
  private memory: BufferMemory;

  constructor(
    @Inject('OLLAMA_EMBEDDINGS')
    private readonly embedding: OllamaEmbeddings,

    @Inject('OPEN_AI')
    private readonly llm: ChatOpenAI,

    @Inject('MILVUS_CLIENT')
    private readonly milvusClient: MilvusClient,
  ) {
    // 初始化 Redis 记忆
    const messageHistory = new RedisChatMessageHistory({
      sessionId: 'conversation_history22',
      url: 'redis://localhost:6379',
    });

    this.memory = new BufferMemory({
      chatHistory: messageHistory,
      returnMessages: true,
      memoryKey: 'chat_history', // 默认的 inputKey：question,outputKey:'response'
    });

    // this.memory = new BufferWindowMemory({
    //   chatHistory: messageHistory,
    //   returnMessages: true,
    //   memoryKey: 'chat_history',
    //   k:2
    // });
  }

  /**
   * 使用LangChain Milvus Retriever搜索
   */
  async searchWithLangchainMilvusRetriever(question: string) {
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
      k: 2,
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
    并且回答时仅根据原文，尽可能回答用户问题，如果原文中没有相关内容，你可以回答"原文中没有相关内容"。

    以下是原文中跟用户回答相关的内容：
    {context}

    以下是之前的对话历史：
  `;

    const prompt = ChatPromptTemplate.fromMessages([
      ['system', SYSTEM_TEMPLATE],
      new MessagesPlaceholder('chat_history'),
      ['human', '现在，你需要基于原文，回答以下问题：\n{question}'],
    ]);

    const chain = RunnableSequence.from([
      {
        context: contextRetrieverChain,
        question: (input) => input.question,
        chat_history: async () => {
          const history = await this.memory.loadMemoryVariables({});
          console.log(
            '=>(study.milvus.project.service.ts 108) history.chat_history',
            history.chat_history,
          );
          return history.chat_history || '';
        },
      },
      prompt,
      this.llm,
      new StringOutputParser(),
    ]);

    const res = await chain.invoke({
      question: question,
    });

    // 保存对话到记忆
    await this.memory.saveContext({ question }, { response: res });

    console.log('=>(study.milvus.service.ts 190) res', res);
    return res;
  }

  /**
   * Embedding 用的 ollama 和 open_ai模型的向量不一致，不能用检索
   * 检索时，会报错：
   * Error: Error: Embedding model does not match vector store model.
   * Embedding model:  'openai/text-embedding-ada-002'
   * Vector store model: 'llama-2-7b-chat-hf'
   *
   * 提示：
   * 1. 创建 Milvus 集合时，需要指定 vector_type 为 float32
   * 2. 创建 Milvus 集合时，需要指定 vector_dim为 1536
   *
   *
   * 使用langchainWithMemory搜索
   */
  async langchainWithMemory(question: string) {
    // const vectorStore = new Milvus(this.embedding, {
    //   collectionName: 'article',
    //   vectorField: 'content_vector',
    //   textField: 'content',
    //   clientConfig: {
    //     address: 'localhost:19530',
    //     timeout: 5000,
    //     database: 'langchain_milvus',
    //   },
    //   indexCreateOptions: {
    //     index_type: 'IVF_HNSW',
    //     metric_type: 'COSINE',
    //   },
    // });
    //
    // const retriever = vectorStore.asRetriever({
    //   k: 2,
    // });
    //
    // const convertDocsToString = (documents: Document[]): string => {
    //   return documents.map((document) => document.pageContent).join('\n');
    // };
    //
    // const contextRetrieverChain = RunnableSequence.from([
    //   (input) => input.question,
    //   retriever,
    //   convertDocsToString,
    // ]);

    const SYSTEM_TEMPLATE = `
    你是一个本次事故的分析者，根据文章详细解释和回答问题，你在回答时会引用作品原文。
    并且回答时仅根据原文，尽可能回答用户问题，如果原文中没有相关内容，你可以回答"原文中没有相关内容"。

    以下是之前的对话历史：
  `;

    const prompt = ChatPromptTemplate.fromMessages([
      ['system', SYSTEM_TEMPLATE],
      new MessagesPlaceholder('chat_history'),
      ['human', '现在，你需要基于原文，回答以下问题：\n{question}'],
    ]);

    const chain = RunnableSequence.from([
      {
        // context: contextRetrieverChain,
        question: (input) => input.question,
        chat_history: async () => {
          const history = await this.memory.loadMemoryVariables({});
          console.log(
            '=>(study.milvus.project.service.ts 108) history.chat_history',
            history.chat_history,
          );
          return history.chat_history || '';
        },
      },
      prompt,
      this.llm,
      new StringOutputParser(),
    ]);

    const res = await chain.invoke({
      question: question,
    });

    // 保存对话到记忆
    await this.memory.saveContext({ question }, { response: res });

    console.log('=>(study.milvus.service.ts 190) res', res);
    return res;
  }

  /**
   * 优化 angchainWithMemoryChain
   * @param question
   */
  async langchainWithMemoryChain(question: string) {
    const SYSTEM_TEMPLATE = `
    你是一个本次事故的分析者，根据文章详细解释和回答问题，你在回答时会引用作品原文。
    并且回答时仅根据原文，尽可能回答用户问题，如果原文中没有相关内容，你可以回答"原文中没有相关内容"。

    以下是之前的对话历史：
  `;

    const prompt = ChatPromptTemplate.fromMessages([
      ['system', SYSTEM_TEMPLATE],
      new MessagesPlaceholder('chat_history'),
      ['human', '现在，你需要基于原文，回答以下问题：\n{question}'],
    ]);

    const chain = RunnableSequence.from([
      {
        question: (input) => input.question,
        chat_history: async () => {
          const history = await this.memory.loadMemoryVariables({});
          return history.chat_history || '';
        },
      },
      prompt,
      this.llm,
      new StringOutputParser(),
      new RunnablePassthrough({
        func: async (input) => {
          // 保存对话到记忆
          await this.memory.saveContext({ question }, { response: input });
        },
      }),
    ]);

    const res = await chain.invoke({
      question: question,
    });

    console.log('=>(study.milvus.service.ts 190) res', res);
    return res;
  }
}
