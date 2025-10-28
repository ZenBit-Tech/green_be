import { Module } from '@nestjs/common';
import { LangChainService } from '@/modules/langchain/langchain.service';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';

@Module({
  controllers: [UploadController],
  providers: [UploadService, LangChainService],
  exports: [UploadService],
})
export class UploadModule {}
