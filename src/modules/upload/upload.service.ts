import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  UPLOAD_MESSAGES,
  RANDOM_ID_MAX,
} from '@common/constants/upload.constants';
import { ParsedDataDto } from './dto/parsed-data.dto';

export interface StoredParsedData extends ParsedDataDto {
  id: string;
  receivedAt: Date;
}

export interface AddParsedDataResponse {
  message: string;
  saved: boolean;
  id: string;
}

export interface ClearDataResponse {
  message: string;
}

@Injectable()
export class UploadService {
  private memoryStore: StoredParsedData[] = [];

  addParsedData(payload: ParsedDataDto): AddParsedDataResponse {
    try {
      const newRecord: StoredParsedData = {
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

  getAllParsedData(): StoredParsedData[] {
    return this.memoryStore;
  }

  clearAllData(): ClearDataResponse {
    this.memoryStore = [];
    return { message: UPLOAD_MESSAGES.CLEARED };
  }
}
