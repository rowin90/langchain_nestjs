import { Module, Global } from '@nestjs/common';
import { OllamaEmbeddings } from '@langchain/community/embeddings/ollama';
import { ChatOpenAI } from '@langchain/openai';
import { ConfigService } from '@nestjs/config';
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

@Global()
@Module({
  providers: [
    {
      provide: 'OLLAMA_EMBEDDINGS',
      useValue: new OllamaEmbeddings({
        model: 'nomic-embed-text', // default value
        baseUrl: 'http://localhost:11434', // default value
        requestOptions: {
          useMMap: true, // use_mmap 1
          numThread: 10, // num_thread 10
          numGpu: 1, // num_gpu 1
        },
      }),
    },
    {
      provide: 'OPEN_AI',
      useFactory: (configService: ConfigService) => {
        return new ChatOpenAI({
          modelName: 'gpt-3.5-turbo-16k',
          configuration: {
            baseURL: configService.get('OPENAI_API_BASE_URL'),
          },
        });
      },
      inject: [ConfigService],
    },
    {
      provide: 'MILVUS_CLIENT',
      useValue: new MilvusClient({
        address: 'localhost:19530',
        timeout: 5000,
      }),
    },
  ],
  exports: ['OLLAMA_EMBEDDINGS', 'OPEN_AI', 'MILVUS_CLIENT'],
})
export class LibModule {}
