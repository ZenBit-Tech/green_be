import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiResponse,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import {
  UploadService,
  ParsedFromFileDataPayload,
  CachedParsedFromFileData,
  CacheOperationResult,
  ClearCachedDataResult,
} from './upload.service';

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('parsed-data')
  @ApiBearerAuth()
  @Throttle({ default: { limit: 3, ttl: 60 } })
  @ApiResponse({
    status: 201,
    description: 'The parsed data has been successfully stored.',
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to store the parsed data due to a server error.',
  })
  async cacheParsedFromFileData(
    @Body() data: ParsedFromFileDataPayload,
  ): Promise<CacheOperationResult> {
    return await this.uploadService.cacheParsedFromFileData(data);
  }

  @Get('parsed-data')
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Returns all currently stored parsed data records.',
  })
  getAllCachedFileData(): CachedParsedFromFileData[] {
    return this.uploadService.getAllCachedFileData();
  }

  @Delete('parsed-data')
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Successfully cleared all stored parsed data.',
  })
  clearCachedFileData(): ClearCachedDataResult {
    return this.uploadService.clearCachedFileData();
  }

  @Get('parsed-data/:id/query')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Query a specific document using natural language' })
  async queryDocument(
    @Param('id') id: string,

    @Query('q') query: string,
  ): Promise<{ answer: string }> {
    const answer = await this.uploadService.queryCachedData(id, query);

    return { answer };
  }

  @Get('analysis/blood-markers')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Analyze all cached data for blood marker information',
  })
  analyzeBloodMarkers() {
    return this.uploadService.analyzeAllForBloodMarkers();
  }
}
