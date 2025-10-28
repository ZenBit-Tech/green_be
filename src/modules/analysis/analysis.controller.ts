import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RequestAnalysisDto } from './dto/analysis-request.dto';
import { ResponseAnalysisDto } from './dto/analysis-response.dto';
import { AnalysisService } from './analysis.service';

@Controller('medical/analysis')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Post('results')
  @ApiBearerAuth()
  async analyze(@Body() dto: RequestAnalysisDto): Promise<ResponseAnalysisDto> {
    return await this.analysisService.analyze(dto);
  }

  @Get('blood-markers')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Analyze all cached data for blood marker information',
  })
  analyzeBloodMarkers() {
    return this.analysisService.analyzeAllForBloodMarkers();
  }
}
