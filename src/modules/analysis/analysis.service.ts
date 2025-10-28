import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { LangChainService } from '@/modules/langchain/langchain.service';
import { UploadService } from '@/modules/upload/upload.service';
import { UPLOAD_MESSAGES } from '@/common/constants/upload.constants';
import { RequestAnalysisDto } from './dto/analysis-request.dto';
import { ResponseAnalysisDto } from './dto/analysis-response.dto';

@Injectable()
export class AnalysisService {
  constructor(
    private readonly langChainService: LangChainService,
    private readonly uploadService: UploadService,
  ) {}

  async analyze(payload: RequestAnalysisDto): Promise<ResponseAnalysisDto> {
    try {
      const result = await this.langChainService.generateFullAnalysis(payload);
      return result;
    } catch (err) {
      throw new InternalServerErrorException(UPLOAD_MESSAGES.FAILED, err);
    }
  }

  async analyzeAllForBloodMarkers(): Promise<RequestAnalysisDto> {
    const checkedRecords = this.uploadService.memoryStore.filter(
      (record) => record.analysis?.hasBloodMarkers,
    );
    if (checkedRecords.length === 0) {
      throw new Error(UPLOAD_MESSAGES.NOT_FOUND);
    }

    return await this.langChainService.analyzeBloodMarkers(
      checkedRecords.map((record) => record.extractedText).join('\n'),
    );
  }
}
