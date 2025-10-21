import { Controller, Get, Post, Delete, Body } from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
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
  cacheParsedFromFileData(
    @Body() data: ParsedFromFileDataPayload,
  ): CacheOperationResult {
    return this.uploadService.cacheParsedFromFileData(data);
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
}
