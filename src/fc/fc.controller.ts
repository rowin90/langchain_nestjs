import { Controller, Post, Body } from '@nestjs/common';
import { FcService } from './fc.service';

@Controller('fc')
export class FcController {
  constructor(private readonly fcService: FcService) {}

  /**
   * 给语义打标
   */
  @Post('/tagToData')
  async tagToData(@Body('input') input: string) {
    return await this.fcService.tagToData(input);
  }

  /**
   * 使用 function call工具
   */
  @Post('/withTools')
  async withTools() {
    return await this.fcService.withTools();
  }

  /**
   * 强制使用 function call工具
   */
  @Post('/controlWithTools')
  async controlWithTools() {
    return await this.fcService.controlWithTools();
  }
  /**
   * 提取人物关系
   */
  @Post('/relationExtract')
  async relationExtract(@Body('input') input: string) {
    return await this.fcService.relationExtract(input);
  }
}
