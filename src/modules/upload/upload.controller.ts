import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { Public } from '@modules/auth/decorators/public.decorator';
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

  // TODO: possible @Public removal after team decision on that functionality
  @Public()
  @Get('parsed-data')
  @ApiResponse({
    status: 200,
    description: 'Returns all currently stored parsed data records.',
  })
  getAllCachedFileData(): CachedParsedFromFileData[] {
    return this.uploadService.getAllCachedFileData();
  }

  // TODO: possible @Public removal after team decision on that functionality
  @Public()
  @Delete('parsed-data')
  @ApiResponse({
    status: 200,
    description: 'Successfully cleared all stored parsed data.',
  })
  clearCachedFileData(): ClearCachedDataResult {
    return this.uploadService.clearCachedFileData();
  }

  @Public()
  @Get('parsed-data/:id/query')
  @ApiOperation({ summary: 'Query a specific document using natural language' })
  async queryDocument(
    @Param('id') id: string,

    @Query('q') query: string,
  ): Promise<{ answer: string }> {
    const answer = await this.uploadService.queryCachedData(id, query);

    return { answer };
  }

  @Public()
  @Get('analysis/blood-markers')
  @ApiOperation({
    summary: 'Analyze all cached data for blood marker information',
  })
  analyzeBloodMarkers() {
    return this.uploadService.analyzeAllForBloodMarkers();
  }
}
