import { BaseModelProvider } from '../base/BaseModelProvider';

// 导入智谱AI的聊天模型
import { ChatZhipuAI } from '@langchain/community/chat_models/zhipuai';
import * as process from 'node:process';

// 定义一个 GlmModelProvider 类，它继承自 BaseModelProvider，并指定模型类型为 ChatZhipuAI
export class GlmModelProvider extends BaseModelProvider<ChatZhipuAI> {
  constructor() {
    super();
  }
  // 异步创建模型方法
  async createModel() {
    // 设置智谱AI的API密钥
    const aiKey = process.env.ZHIPU_API_KEY;
    // 设置模型名称
    const model_name = 'glm-4';

    // 使用 ChatZhipuAI 类创建模型实例
    const model = new ChatZhipuAI({
      // 设置 API 密钥
      apiKey: aiKey,
      // 设置模型名称
      model: model_name,
      // 设置温度参数，用于控制模型的随机性，取值范围为 0 到 1，建议不要使用 1.0，因为有些模型不支持
      temperature: 0.95,
      // 设置最大重试次数，如果请求失败，会尝试重试最多 3 次
      maxRetries: 3,
      // 设置是否显示详细日志，true 表示显示
      verbose: true,
    });

    // 返回创建的模型实例
    return model;
  }
}
