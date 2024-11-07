import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { OpenAIModel, ChatOpenAIType } from '../ai/model/openAIModel';
import { JsonOutputToolsParser } from '@langchain/core/output_parsers/openai_tools';
import { ChatPromptTemplate } from '@langchain/core/prompts';

@Injectable()
export class FcService {
  private model: ChatOpenAIType;

  constructor() {
    this.model = new OpenAIModel().createModel();
  }

  async withTools() {
    const getCurrentWeatherSchema = z.object({
      location: z
        .string()
        .describe('The city and state, e.g. San Francisco, CA'),
      unit: z
        .enum(['celsius', 'fahrenheit'])
        .describe('The unit of temperature'),
    });

    const paramSchema = zodToJsonSchema(getCurrentWeatherSchema);

    const modelWithTools = this.model.bind({
      tools: [
        {
          type: 'function',
          function: {
            name: 'getCurrentWeather',
            description: 'Get the current weather in a given location',
            parameters: paramSchema,
          },
        },
      ],
    });

    return await modelWithTools.invoke('北京的天气怎么样');
  }

  async controlWithTools() {
    const getCurrentWeatherSchema = z.object({
      location: z
        .string()
        .describe('The city and state, e.g. San Francisco, CA'),
      unit: z
        .enum(['celsius', 'fahrenheit'])
        .describe('The unit of temperature'),
    });

    const paramSchema = zodToJsonSchema(getCurrentWeatherSchema);

    const modelWithTools = this.model.bind({
      tools: [
        {
          type: 'function',
          function: {
            name: 'getCurrentWeather',
            description: 'Get the current weather in a given location',
            parameters: paramSchema,
          },
        },
      ],
      // tool_choice: "none",
      tool_choice: {
        type: 'function',
        function: {
          name: 'getCurrentWeather',
        },
      },
    });

    return await modelWithTools.invoke('北京的天气怎么样');
  }

  async tagToData(input: string) {
    const taggingSchema = z.object({
      emotion: z.enum(['pos', 'neg', 'neutral']).describe('文本的情感'),
      language: z.string().describe('文本的核心语言（应为ISO 639-1代码）'),
    });

    const paramSchema = zodToJsonSchema(taggingSchema);

    const modelTagging = this.model.bind({
      tools: [
        {
          type: 'function',
          function: {
            name: 'tagging',
            description: '为特定的文本片段打上标签',
            parameters: paramSchema,
          },
        },
      ],
      tool_choice: {
        type: 'function',
        function: {
          name: 'tagging',
        },
      },
    });

    const prompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        '仔细思考，你有充足的时间进行严谨的思考，然后按照指示对文本进行标记',
      ],
      ['human', '{input}'],
    ]);

    const chain = prompt.pipe(modelTagging).pipe(new JsonOutputToolsParser());

    return await chain.invoke({ input });
  }

  async relationExtract(input: string) {
    const personExtractionSchema = z
      .object({
        name: z.string().describe('人的名字'),
        age: z.number().optional().describe('人的年龄'),
      })
      .describe('提取关于一个人的信息');

    const relationExtractSchema = z.object({
      people: z.array(personExtractionSchema).describe('提取所有人'),
      relation: z.string().describe('人之间的关系, 尽量简洁'),
    });

    const schema = zodToJsonSchema(relationExtractSchema);

    const modelExtract = this.model.bind({
      tools: [
        {
          type: 'function',
          function: {
            name: 'relationExtract',
            description: '提取数据中人的信息和人的关系',
            parameters: schema,
          },
        },
      ],
      tool_choice: {
        type: 'function',
        function: {
          name: 'relationExtract',
        },
      },
    });

    const prompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        '仔细思考，你有充足的时间进行严谨的思考，然后提取文中的相关信息，如果没有明确提供，请不要猜测，可以仅提取部分信息',
      ],
      ['human', '{input}'],
    ]);

    const chain = prompt.pipe(modelExtract).pipe(new JsonOutputToolsParser());

    return await chain.invoke({ input });
  }
}
