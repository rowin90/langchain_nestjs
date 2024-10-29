import {
  Controller,
  Get,
  Body,
  Post,
  Sse,
  Header,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { Observable, Subject } from 'rxjs';
import { Ollama } from '@langchain/community/llms/ollama';
import { AppService } from './app.service';

@Controller()
export class AppController {
  private messageSubject = new Subject<MessageEvent>();

  private model: Ollama;

  constructor(private readonly appService: AppService) {
    this.model = new Ollama({
      baseUrl: 'http://localhost:11434',
      model: 'llama3.1',
    });
  }

  @Sse('sse')
  @Header('Content-Type', 'text/event-stream')
  sse(): Observable<MessageEvent> {
    return this.messageSubject.asObservable();
  }

  @Post('question')
  async addList(@Body() body: { question: string }): Promise<any> {
    const stream = await this.model.stream(body.question);

    for await (const str of stream) {
      this.messageSubject.next({
        data: JSON.stringify({ answer: str, end: false }),
      } as MessageEvent);
    }

    this.messageSubject.next({
      data: JSON.stringify({ answer: '', end: true }),
    } as MessageEvent);
  }

  @Get('invoke')
  async invoke(@Query('q') q: string): Promise<any> {
    console.log('=>(app.controller.ts 50) q', q);

    return await this.model.invoke(q);
  }

  @Get('stream')
  async stream(@Query('q') q: string, @Res() res: Response): Promise<any> {
    const stream = await this.model.stream(q);

    // 设置响应头
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    for await (const str of stream) {
      console.log('=>(app.controller.ts 66) str', str);

      res.write(str);
    }
    // 结束响应
    res.end();
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
