import { Injectable } from '@nestjs/common';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import * as path from 'path';
import { FaissStore } from '@langchain/community/vectorstores/faiss';
import { EmbeddingModel } from '../ai/model/embeddingModel';
import { Document } from '@langchain/core/documents';
import { RunnableSequence } from '@langchain/core/runnables';

@Injectable()
export class RagCommonService {
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

  async _contextRetrieverChain() {
    const retriever = await this.loadFaiss();

    const convertDocsToString = (documents: Document[]): string => {
      return documents.map((document) => document.pageContent).join('\n');
    };

    const contextRetrieverChain = RunnableSequence.from([
      (input) => input.question,
      retriever,
      convertDocsToString,
    ]);

    return contextRetrieverChain;
  }
}
