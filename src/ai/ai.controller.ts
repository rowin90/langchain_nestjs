import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  // 构造函数，注入 AI 服务
  constructor(private readonly aiService: AiService) {}

  // 处理 POST 请求，用于代码生成
  // 路径为 /ai/lib/chat
  // 接收请求体中的 message 参数，类型为字符串
  // 返回一个 Promise 对象，解析后为一个对象
  @Post('/lib/chat')
  async codeGenerate(@Body('message') message: string): Promise<object> {
    // 调用 AI 服务的 codeGenerate 方法，传入 message 参数
    // 返回结果存储在 result 变量中
    const result = await this.aiService.codeGenerate(message);
    // 返回一个包含代码执行结果的对象
    // code 字段表示状态码，0 表示成功
    // msg 字段表示消息，success 表示成功
    // data 字段包含生成代码和配置信息
    return {
      code: 0,
      msg: 'success',
      data: {
        // jsx 字段存储生成的 JSX 代码
        jsx: result[0],
        // config 字段存储生成的配置信息
        config: result[1],
      },
    };
  }
}
