import { Injectable } from '@nestjs/common';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import * as path from 'path';
import { FaissStore } from '@langchain/community/vectorstores/faiss';
import { EmbeddingModel } from '../ai/model/embeddingModel';
import { Document } from '@langchain/core/documents';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { GlmModelProvider } from '../ai/model/glm';
import { StringOutputParser } from '@langchain/core/output_parsers';

@Injectable()
export class RagService {
  private embeddings: any;

  constructor() {
    this.embeddings = new EmbeddingModel().createModel();
  }

  embeddings_directory = path.resolve(__dirname, '../../db/embeddings');

  async prepareTextToFaiss() {
    const loader = new TextLoader(
      path.resolve(__dirname, '../../doc/example.txt'),
    );

    const docs = await loader.load();

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 100,
      chunkOverlap: 20,
    });

    console.log('开始splitDocs');
    const splitDocs = await splitter.splitDocuments(docs);

    console.log('开始创建vectorStore');
    const vectorStore = await FaissStore.fromDocuments(
      splitDocs,
      this.embeddings,
    );
    console.log('创建完成');
    console.log('准备存入 vectorStore');
    await vectorStore.save(this.embeddings_directory);
    console.log('完成');
    return 'ok';
  }

  async loadFaiss() {
    const vectorstore = await FaissStore.load(
      this.embeddings_directory,
      this.embeddings,
    );

    const retriever = vectorstore.asRetriever(2);
    // const res = await retriever.invoke('事故是怎么产生的');

    // console.log(res);
    return retriever;
  }

  /**
   * 普通的检索回答
   * @param question
   */
  async normalRetriever(question: string) {
    const retriever = await this.loadFaiss();

    const convertDocsToString = (documents: Document[]): string => {
      return documents.map((document) => document.pageContent).join('\n');
    };

    const contextRetrieverChain = RunnableSequence.from([
      (input) => input.question,
      retriever,
      convertDocsToString,
    ]);

    const result = await contextRetrieverChain.invoke({
      question,
    });
    return result;
  }

  /**
   * 优化检索回答
   * @param question
   */
  async highRetriever(question: string) {
    const retriever = await this.loadFaiss();

    const convertDocsToString = (documents: Document[]): string => {
      return documents.map((document) => document.pageContent).join('\n');
    };

    const contextRetrieverChain = RunnableSequence.from([
      (input) => input.question,
      retriever,
      convertDocsToString,
    ]);

    const TEMPLATE = `
你是一个本次事故的分析者，根据文章详细解释和回答问题，你在回答时会引用作品原文。
并且回答时仅根据原文，尽可能回答用户问题，如果原文中没有相关内容，你可以回答“原文中没有相关内容”，

以下是原文中跟用户回答相关的内容：
{context}

现在，你需要基于原文，回答以下问题：
{question}`;

    const prompt = ChatPromptTemplate.fromTemplate(TEMPLATE);

    const model = new GlmModelProvider().createModel();

    const ragChain = RunnableSequence.from([
      {
        context: contextRetrieverChain,
        question: (input) => input.question,
      },
      prompt,
      model,
      new StringOutputParser(),
    ]);

    const answer = await ragChain.invoke({
      question,
    });
    return answer;
  }
}
