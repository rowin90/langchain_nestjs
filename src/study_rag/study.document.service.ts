import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { UnstructuredLoader } from '@langchain/community/document_loaders/fs/unstructured';

@Injectable()
export class StudyDocumentService {
  // private embeddingsModel: OllamaEmbeddings;

  // constructor() {
  //   this.embeddingsModel = new OllamaEmbeddings({
  //     model: 'llama3.1', // default value
  //     baseUrl: 'http://localhost:11434', // default value
  //     requestOptions: {
  //       useMMap: true, // use_mmap 1
  //       numThread: 10, // num_thread 10
  //       numGpu: 1, // num_gpu 1
  //     },
  //   });
  // }

  constructor(private readonly configService: ConfigService) {}

  async textLoader() {
    const text = new TextLoader('./doc/example.txt');
    const docs = await text.load();
    console.log('=>(study.document.service.ts 24) docs', docs);
  }

  async mdLoader() {
    const apiKey = await this.configService.get('UNSTRUCTURED_API_KEY');
    const apiUrl = await this.configService.get('UNSTRUCTURED_API_BASE_URL');
    const mdloader = new UnstructuredLoader('./doc/api.md', {
      apiKey,
      apiUrl,
      encoding: 'utf-8',
    });
    const docs = await mdloader.load();
    console.log('=>(study.document.service.ts 24) docs', docs[0].pageContent);
    console.log('=>(study.document.service.ts 24) docs', docs[0].metadata);
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
    console.log('=>(study.document.service.ts 24) docs', docs[0].pageContent);
    console.log('=>(study.document.service.ts 24) docs', docs[0].metadata);
  }
}
