import { Controller, Get, Post, Delete, Body } from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import {
  UploadService,
  StoredParsedData,
  AddParsedDataResponse,
  ClearDataResponse,
} from './upload.service';
import { ParsedDataDto } from './dto/parsed-data.dto';

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Public() // temporary until client api is ready
  @Post('parsed-data')
  @ApiResponse({
    status: 201,
    description: 'The parsed data has been successfully stored.',
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to store the parsed data due to a server error.',
  })
  addParsedData(@Body() data: ParsedDataDto): AddParsedDataResponse {
    return this.uploadService.addParsedData(data);
  }

  @Public() // temporary until client api is ready
  @Get('parsed-data')
  @ApiResponse({
    status: 200,
    description: 'Returns all currently stored parsed data records.',
  })
  getAllParsedData(): StoredParsedData[] {
    return this.uploadService.getAllParsedData();
  }

  @Delete('parsed-data')
  @ApiResponse({
    status: 200,
    description: 'Successfully cleared all stored parsed data.',
  })
  clearAllParsedData(): ClearDataResponse {
    return this.uploadService.clearAllData();
  }
}
