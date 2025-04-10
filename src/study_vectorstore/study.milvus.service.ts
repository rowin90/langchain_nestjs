import { Injectable, Inject } from '@nestjs/common';
import { OllamaEmbeddings } from '@langchain/community/embeddings/ollama';
import { ChatOpenAI } from '@langchain/openai';
import { MilvusClient } from '@zilliz/milvus2-sdk-node';
import { Milvus } from '@langchain/community/vectorstores/milvus';
import { documents, texts } from '../share/documents';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { Document } from 'langchain/document';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

@Injectable()
export class StudyMilvusService {
  private db_name = 'blog';
  private connection_name = 'user';
  private field_name = 'name_vector';

  constructor(
    @Inject('OLLAMA_EMBEDDINGS')
    private readonly embedding: OllamaEmbeddings,

    @Inject('OPEN_AI')
    private readonly llm: ChatOpenAI,

    @Inject('MILVUS_CLIENT')
    private readonly milvusClient: MilvusClient,
  ) {}

  /**
   * 添加向量索引
   */
  async addIndex() {
    const dbs = await this.milvusClient.listDatabases();
    if (!dbs.db_names.includes(this.db_name)) {
      await this.milvusClient.createDatabase({ db_name: this.db_name });
    } else {
      await this.milvusClient.useDatabase({ db_name: this.db_name });
      // 获取某个字段上的索引信息
      const indexInfo = await this.milvusClient.describeIndex({
        collection_name: this.connection_name,
        field_name: this.field_name,
      });
      if (indexInfo.index_descriptions.length === 0) {
        // 如果不存在索引，则创建索引
        await this.milvusClient.createIndex({
          collection_name: this.connection_name,
          field_name: this.field_name,
          // index_type: 'IVF_FLAT',
          // metric_type: 'L2',
          // params: { nlist: 1024 },
        });
      } else {
        // 加载 collection
        await this.milvusClient.loadCollection({
          collection_name: this.connection_name,
        });
        return;
      }
    }
  }

  /**
   * 搜索向量
   */
  async search() {
    // await this.milvusClient.useDatabase({ db_name: this.db_name });
    const result = await this.milvusClient.search({
      collection_name: this.connection_name,
      db_name: this.db_name,
      vector: [
        0.5902190208435059, -0.11200595647096634, 0.12274126708507538,
        0.33565473556518555, -0.8785776495933533, -0.44375309348106384,
        0.1753315031528473, 0.6219483613967896, 0.8492100834846497,
        -0.20113205909729004, 0.3085308074951172, -0.6201500296592712,
        -0.7328883409500122, 0.24308262765407562, -0.12292823195457458,
        0.4628101885318756, 0.9029219746589661, -0.700556218624115,
        -0.972892165184021, 0.7692609429359436, -0.29766952991485596,
        0.4485374689102173, -0.6186408996582031, 0.26964032649993896,
        -0.7313908338546753, 0.005769246723502874, -0.3570448160171509,
        0.6139882802963257, 0.3256303071975708, 0.9747477173805237,
        0.7254016399383545, -0.8922491073608398, -0.23357398808002472,
        -0.17622940242290497, -0.19131304323673248, -0.49145960807800293,
        0.9968299865722656, 0.344982773065567, 0.6728342771530151,
        -0.9042068123817444, 0.7804791927337646, -0.06768681854009628,
        -0.17772525548934937, -0.2197965830564499, -0.9578543901443481,
        0.7201477289199829, -0.8839818835258484, 0.18913167715072632,
        -0.05125950649380684, -0.8417770266532898, -0.995111346244812,
        0.5750240087509155, 0.48673704266548157, -0.7569321990013123,
        0.31787821650505066, -0.7602351307868958, 0.39402326941490173,
        0.3225856423377991, 0.006062719039618969, -0.41598957777023315,
        -0.7039762139320374, -0.5417020916938782, 0.9862505793571472,
        -0.9986883997917175, -0.0261505339294672, -0.1779966503381729,
        -0.6411325335502625, -0.2798917591571808, 0.7603484392166138,
        0.315325528383255, 0.4402165114879608, 0.152328222990036,
        0.5916978716850281, 0.8544106483459473, -0.5883209109306335,
        0.922877311706543, -0.4850826859474182, -0.42144790291786194,
        -0.5650210976600647, -0.4953586459159851, -0.11620501428842545,
        -0.6188240051269531, 0.7911940217018127, -0.559877872467041,
        0.41582152247428894, 0.26566728949546814, -0.7493441104888916,
        0.6408793926239014, -0.801697850227356, -0.252885103225708,
        -0.5917843580245972, -0.4308428168296814, -0.08687248826026917,
        0.9203885197639465, -0.4408532381057739, 0.7310339212417603,
        0.5635384917259216, -0.27223315834999084, -0.6916661858558655,
        -0.6242846250534058, 0.22809705138206482, 0.2728366255760193,
        0.41577255725860596, -0.6986161470413208, 0.9475555419921875,
        -0.9592560529708862, 0.2852345407009125, -0.08185034990310669,
        -0.47792714834213257, 0.7349264621734619, -0.5164259076118469,
        0.19454820454120636, 0.7694494724273682, -0.8620014786720276,
        -0.6641857624053955, 0.6140668392181396, 0.4659945070743561,
        0.6442261338233948, -0.7104641795158386, -0.3125358819961548,
        -0.21446268260478973, -0.9754005670547485, -0.2932130694389343,
        0.11112122982740402, 0.9172719717025757, -0.7570464611053467,
        0.058266740292310715, -0.23946557939052582,
      ],
      limit: 5,
      anns_field: this.field_name,
      output_fields: ['name', 'id'],
    });
    console.log('=>(study.milvus.service.ts 124) result', result);
  }

  /**
   * 向量插入
   */
  async insert() {
    await this.milvusClient.useDatabase({ db_name: 'langchain_milvus' });
    // const data = [
    //   {
    //     text: '今天天气真好，大太阳',
    //     text_vector: await this.embedding.embedQuery(
    //       '今天天气真好，大太阳',
    //     ),
    //   },
    // ];

    const row = texts.map(async (text) => ({
      text: text,
      text_vector: await this.embedding.embedQuery(text),
    }));

    const data = await Promise.all(row);
    const res = await this.milvusClient.insert({
      collection_name: 'text',
      fields_data: data,
    });
    console.log('=>(study.milvus.service.ts 146) res', res);

    // 落库
    // await this.milvusClient.flush({
    //   collection_names: ['art'],
    // });
  }

  /**
   * 插入数据后的搜索
   */
  async searchAfterInsert() {
    await this.milvusClient.useDatabase({ db_name: 'test' });
    const result = await this.milvusClient.search({
      collection_name: 'art',
      // db_name: this.db_name,
      vector: await this.embedding.embedQuery('你怎样'),
      limit: 2,
      anns_field: 'name_vector',
      output_fields: ['name', 'id'],
    });
    console.log('=>(study.milvus.service.ts 124) result', result);
  }

  /**
   * 使用LangChain Milvus搜索
   */
  async searchWithLangchainMilvus() {
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

    const res = await vectorStore.similaritySearchWithScore(
      '这次事故的原因是什么？该如何避免',
      4,
    );
    console.log('=>(study.milvus.service.ts 190) res', res);
  }

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

    const chain = retriever.pipe(convertDocsToString);

    const res = await chain.invoke('这次事故的原因是什么？该如何避免');

    console.log('=>(study.milvus.service.ts 190) res', res);
  }

  /**
   * milvus保存文本并搜索
   */
  async milvusSaveTextAndSearch() {
    const vectorStore = await Milvus.fromTexts(texts, {}, this.embedding, {
      collectionName: 'text',
      vectorField: 'text_vector',
      textField: 'text',
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

    const res = await vectorStore.similaritySearchWithScore(
      '天天上班很无聊',
      4,
    );
    console.log('=>(study.milvus.service.ts 190) res', res);
  }

  /**
   * milvus保存文本
   */
  async milvusSaveDocument() {
    // const vectorStore = await Milvus.fromDocuments(documents, this.embedding, {
    //   collectionName: 'text',
    //   vectorField: 'text_vector',
    //   textField: 'text',
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

    const text = new TextLoader('./doc/example.txt');
    const docs = await text.load();
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 200,
      chunkOverlap: 20,
    });
    const splitDocs = await splitter.splitDocuments(docs);

    await Milvus.fromDocuments(splitDocs, this.embedding, {
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
    console.log('=>(study.milvus.service.ts 262) 保存完成');

    // // const res = await vectorStore.similaritySearchWithScore(
    //   '天天上班很无聊',
    //   4,
    // );
    // console.log('=>(study.milvus.service.ts 190) res', res);
  }
}
