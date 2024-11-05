import { Injectable } from '@nestjs/common';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { GlmModelProvider } from '../ai/model/glm';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RagCommonService } from './rag.common.service';

@Injectable()
export class RagService {
  constructor(private ragCommonService: RagCommonService) {}

  /**
   * 普通的检索回答
   * @param question
   */
  async normalRetriever(question: string) {
    const contextRetrieverChain =
      await this.ragCommonService._contextRetrieverChain();

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
    const contextRetrieverChain =
      await this.ragCommonService._contextRetrieverChain();

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
