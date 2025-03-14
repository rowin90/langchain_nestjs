import { Injectable } from '@nestjs/common';
import { pipeline } from '@huggingface/transformers';

@Injectable()
export class StudyHuggingFaceService {
  constructor() {}

  /**
   * embeddings_cache
   */
  async hugging_face_embeddings() {
    // 情感分析
    const classifier = await pipeline('sentiment-analysis');

    const result = await classifier('I love transformers!');
    console.log('=>(study.huggingface.service.ts 20) result', result);
  }
}
