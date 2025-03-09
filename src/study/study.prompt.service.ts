import { Injectable } from '@nestjs/common';
import {
  ChatPromptTemplate,
  PromptTemplate,
  PipelinePromptTemplate,
} from '@langchain/core/prompts';

@Injectable()
export class StudyPromptService {
  // private model: ChatOpenAIType;

  // constructor() {
  //   this.model = new OpenAIModel().createModel();
  // }

  /**
   * PromptTemplate
   */
  async prompt() {
    const autoInferTemplate = PromptTemplate.fromTemplate(
      'good {timeOfDay}, {name}',
    );

    const template = autoInferTemplate;

    const prompt_value = await template.invoke({
      timeOfDay: 'evening',
      name: 'lisi',
    });

    console.log(prompt_value.toString());
    // ['timeOfDay', 'name']

    const formattedAutoInferTemplate = await autoInferTemplate.format({
      timeOfDay: 'morning',
      name: 'Kai',
    });
  }

  /**
   * ChatPromptTemplate
   */
  async chatPrompt() {
    const autoInferTemplate = ChatPromptTemplate.fromTemplate(
      'good {timeOfDay}, {name}',
    );

    const prompt_value = await autoInferTemplate.invoke({
      timeOfDay: 'evening',
      name: 'lisi',
    });

    // console.log(prompt_value);
    console.log(prompt_value.toChatMessages());
  }

  /**
   * PipelinePromptTemplate
   */
  async pipelinePrompt() {
    const full_template = PromptTemplate.fromTemplate(
      `{instruction}

    {example}

    {start}`,
    );

    // 描述模板
    const instruction_prompt =
      PromptTemplate.fromTemplate('你正在模拟{person}');

    // 示例模板
    const example_prompt = PromptTemplate.fromTemplate(`下面是一个交互例子：

    Q: {example_q}
    A: {example_a}`);

    // 开始模板
    const start_prompt =
      PromptTemplate.fromTemplate(`现在，你是一个真实的人，请回答用户的问题:

    Q: {input}
    A:`);

    const pipeline = new PipelinePromptTemplate({
      pipelinePrompts: [
        {
          name: 'instruction',
          prompt: instruction_prompt,
        },
        {
          name: 'example',
          prompt: example_prompt,
        },
        {
          name: 'start',
          prompt: start_prompt,
        },
      ],
      finalPrompt: full_template,
    });

    const formattedPrompt = await pipeline.invoke({
      person: 'Alice',
      example_q: '你好',
      example_a: '你好，我是Alice',
      input: '你好',
    });
    console.log('=>formattedPrompt', formattedPrompt);
  }
}
