import { Module } from '@nestjs/common';
import { FcService } from './fc.service';
import { FcController } from './fc.controller';

@Module({
  controllers: [FcController],
  providers: [FcService]
})
export class FcModule {}
