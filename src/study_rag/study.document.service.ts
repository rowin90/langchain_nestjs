import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { UnstructuredLoader } from '@langchain/community/document_loaders/fs/unstructured';
import { BaseDocumentLoader } from 'langchain/document_loaders/base';
import { Document } from '@langchain/core/documents';
import {
  CharacterTextSplitter,
  RecursiveCharacterTextSplitter,
} from 'langchain/text_splitter';
import { OllamaEmbeddings } from '@langchain/community/embeddings/ollama';
import { FaissStore } from '@langchain/community/vectorstores/faiss';

@Injectable()
export class StudyDocumentService {
  constructor(
    private readonly configService: ConfigService,
    @Inject('OLLAMA_EMBEDDINGS') private readonly embeddings: OllamaEmbeddings,
  ) {}

  async textLoader() {
    const text = new TextLoader('./doc/example.txt');
    const docs = await text.load();
    console.log('=>(study.document.service.ts 24) docs', docs);
  }

  async mdLoader() {
    const apiKey = await this.configService.get('UNSTRUCTURED_API_KEY');
    const apiUrl = await this.configService.get('UNSTRUCTURED_API_BASE_URL');
    const mdloader = new UnstructuredLoader('./doc/example.txt', {
      apiKey,
      apiUrl,
      encoding: 'utf-8',
    });
    const docs = await mdloader.load();
    console.log('=>(study.document.service.ts 24) docs', docs);
    console.log('=>(study.document.service.ts 24) docs', docs[0].pageContent);
    console.log('=>(study.document.service.ts 24) len', docs.length);
    console.log('=>(study.document.service.ts 24) docs', docs[0].metadata);
  }

  /**
   * 存入向量库
   */
  async saveMdLoader() {
    const apiKey = await this.configService.get('UNSTRUCTURED_API_KEY');
    const apiUrl = await this.configService.get('UNSTRUCTURED_API_BASE_URL');
    const mdloader = new UnstructuredLoader('./doc/api.md', {
      apiKey,
      apiUrl,
      encoding: 'utf-8',
    });
    // console.log('=>(study.document.service.ts 63) 加载');
    const docs = await mdloader.load();
    // console.log('=>(study.document.service.ts 64) docs', docs);
    // console.log('=>(study.document.service.ts 63) 加载结束');
    const db = await FaissStore.fromDocuments(docs, this.embeddings);
    db.save('./faiss_index/api_md_faiss_index');
    console.log('=>保存');
  }

  async xlxLoader() {
    const apiKey = await this.configService.get('UNSTRUCTURED_API_KEY');
    const apiUrl = await this.configService.get('UNSTRUCTURED_API_BASE_URL');
    const xlxLoader = new UnstructuredLoader('./doc/巴乔明细.xlsx', {
      apiKey,
      apiUrl,
      encoding: 'utf-8',
    });
    const docs = await xlxLoader.load();
    console.log('=>(study.document.service.ts 24) docs', docs);
    console.log('=>(study.document.service.ts 24) len', docs.length);
    console.log('=>(study.document.service.ts 24) docs', docs[0].pageContent);
    console.log('=>(study.document.service.ts 24) docs', docs[0].metadata);
  }

  /**
   * 自定义文档加载器
   */
  async customLoader() {
    const cusLoader = new CustomDocumentLoader('./doc/巴乔明细.xlsx');
    const docs = await cusLoader.load();
    console.log('=>(study.document.service.ts 24) docs', docs[0].pageContent);
    console.log('=>(study.document.service.ts 24) docs', docs[0].metadata);
  }

  /**
   * 分割器
   */
  async textSplit() {
    const text = new TextLoader('./doc/example.txt');
    const docs = await text.load();
    const splitter = new CharacterTextSplitter({
      chunkSize: 200,
      chunkOverlap: 20,
    });
    const splitDocs = await splitter.splitDocuments(docs);
    splitDocs.forEach((doc: Document) => {
      console.log('块大小', doc.pageContent.length);
    });
    console.log('=>(study.document.service.ts 81) splitDocs', splitDocs.length);
  }

  /**
   * 递归分割器
   */
  async reTextSplit() {
    const text = new TextLoader('./doc/example.txt');
    const docs = await text.load();
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 200,
      chunkOverlap: 20,
    });
    const splitDocs = await splitter.splitDocuments(docs);
    splitDocs.forEach((doc: Document) => {
      console.log('块大小', doc.pageContent.length);
    });
    console.log('=>(study.document.service.ts 81) splitDocs', splitDocs);
  }

  /**
   * 递归分割器
   */
  async reCodeSplit() {
    const text = new TextLoader('./doc/start.js');
    const docs = await text.load();
    const splitter = RecursiveCharacterTextSplitter.fromLanguage('js', {
      chunkSize: 200,
      chunkOverlap: 20,
    });
    const splitDocs = await splitter.splitDocuments(docs);
    splitDocs.forEach((doc: Document) => {
      console.log('块大小', doc.pageContent.length);
    });
    console.log('=>(study.document.service.ts 81) splitDocs', splitDocs);
    console.log(
      '=>(study.document.service.ts 81) splitDocs.length',
      splitDocs.length,
    );
  }
}

/**
 * 自定义文档加载器
 */
class CustomDocumentLoader extends BaseDocumentLoader {
  constructor(public filePath: string) {
    super();
  }

  async load(): Promise<Document[]> {
    const docs = [
      {
        pageContent: 'Hello world',
        metadata: { source: this.filePath },
      },
    ];
    return docs;
  }
}
