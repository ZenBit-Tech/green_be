import { Module } from '@nestjs/common';
import { LangChainService } from '@/modules/langchain/langchain.service';
import { UploadModule } from '@modules/upload/upload.module';
import { AnalysisController } from './analysis.controller';
import { AnalysisService } from './analysis.service';

@Module({
  imports: [UploadModule],
  controllers: [AnalysisController],
  providers: [AnalysisService, LangChainService],
})
export class AnalysisModule {}
