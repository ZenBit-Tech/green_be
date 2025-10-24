import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  UPLOAD_MESSAGES,
  RANDOM_ID_MAX,
} from '@common/constants/upload.constants';
import { LangChainService } from '@/modules/langchain/langchain.service';

export interface ParsedFromFileDataPayload {
  fileName: string;
  fileType: string;
  extractedText: string;
}

export interface CachedParsedFromFileData extends ParsedFromFileDataPayload {
  id: string;
  receivedAt: Date;
  analysis?: FileAnalysis;
}

export interface CacheOperationResult {
  message: string;
  saved: boolean;
  id: string;
}

export interface ClearCachedDataResult {
  message: string;
}

export interface FileAnalysis {
  hasBloodMarkers?: boolean;
  bloodMarkersSummary?: string;
  analysisPerformedAt?: Date;
  customQueryResults?: Record<string, string>;
}

export interface BloodMarkerAnalysisResult {
  id: string;
  fileName: string;
  hasBloodMarkers: boolean;
  summary: string;
}

@Injectable()
export class UploadService {
  private memoryStore: CachedParsedFromFileData[] = [];

  constructor(private readonly langChainService: LangChainService) {}

  async cacheParsedFromFileData(
    payload: ParsedFromFileDataPayload,
  ): Promise<CacheOperationResult> {
    try {
      let analysis: FileAnalysis = {};

      if (!payload.extractedText || payload.extractedText.trim().length === 0) {
        throw new InternalServerErrorException(UPLOAD_MESSAGES.NO_TEXT);
      }

      if (payload.extractedText.length > 50000) {
        throw new InternalServerErrorException(UPLOAD_MESSAGES.TOO_LARGE);
      }

      this.clearCachedFileData();
      const bloodMarkerAnalysis =
        await this.langChainService.analyzeBloodMarkers(payload.extractedText);

      analysis = {
        hasBloodMarkers: bloodMarkerAnalysis.toLowerCase().includes('yes'),
        bloodMarkersSummary: bloodMarkerAnalysis,
        analysisPerformedAt: new Date(),
      };

      const newRecord: CachedParsedFromFileData = {
        id: `${Date.now()}-${Math.floor(Math.random() * RANDOM_ID_MAX)}`,
        receivedAt: new Date(),
        ...payload,
        analysis,
      };

      this.memoryStore.push(newRecord);

      return {
        message: UPLOAD_MESSAGES.SUCCESS,
        saved: true,
        id: newRecord.id,
      };
    } catch (error: unknown) {
      throw new InternalServerErrorException(UPLOAD_MESSAGES.FAILED, error);
    }
  }

  getAllCachedFileData(): CachedParsedFromFileData[] {
    return this.memoryStore;
  }

  clearCachedFileData(): ClearCachedDataResult {
    this.memoryStore = [];
    return { message: UPLOAD_MESSAGES.CLEARED };
  }

  async queryCachedData(id: string, query: string): Promise<string> {
    try {
      const record = this.memoryStore.find((item) => item.id === id);
      if (!record) {
        throw new Error(UPLOAD_MESSAGES.NOT_FOUND);
      }
      return await this.langChainService.customQuery(
        record.extractedText,
        query,
      );
    } catch (error) {
      throw new InternalServerErrorException(UPLOAD_MESSAGES.FAILED, error);
    }
  }

  analyzeAllForBloodMarkers(): BloodMarkerAnalysisResult[] {
    try {
      return this.memoryStore
        .filter((record) => record.analysis?.bloodMarkersSummary)
        .map((record) => ({
          id: record.id,
          fileName: record.fileName,
          hasBloodMarkers: record.analysis?.hasBloodMarkers ?? false,
          summary: record.analysis?.bloodMarkersSummary ?? '',
        }));
    } catch (error) {
      throw new InternalServerErrorException(UPLOAD_MESSAGES.FAILED, error);
    }
  }
}
