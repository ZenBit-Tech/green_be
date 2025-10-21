import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  UPLOAD_MESSAGES,
  RANDOM_ID_MAX,
} from '@common/constants/upload.constants';

export interface ParsedFromFileDataPayload {
  fileName: string;
  fileType: string;
  extractedText: string;
}

export interface CachedParsedFromFileData extends ParsedFromFileDataPayload {
  id: string;
  receivedAt: Date;
}

export interface CacheOperationResult {
  message: string;
  saved: boolean;
  id: string;
}

export interface ClearCachedDataResult {
  message: string;
}

@Injectable()
export class UploadService {
  private memoryStore: CachedParsedFromFileData[] = [];

  cacheParsedFromFileData(
    payload: ParsedFromFileDataPayload,
  ): CacheOperationResult {
    try {
      const newRecord: CachedParsedFromFileData = {
        id: `${Date.now()}-${Math.floor(Math.random() * RANDOM_ID_MAX)}`,
        receivedAt: new Date(),
        ...payload,
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
}
