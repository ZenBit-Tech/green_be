import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RequestAnalysisDto } from './dto/analysis-request.dto';
import { ResponseAnalysisDto } from './dto/analysis-response.dto';
import { AnalysisService } from './analysis.service';
import { Throttle } from '@nestjs/throttler';

@Controller('medical/analysis')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Post('results')
  @Throttle({ default: { limit: 3, ttl: 60 } })
  @ApiBearerAuth()
  async analyze(@Body() dto: RequestAnalysisDto): Promise<ResponseAnalysisDto> {
    return await this.analysisService.analyze(dto);
  }

  @Get('blood-markers')
  @Throttle({ default: { limit: 3, ttl: 60 } })
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Analyze all cached data for blood marker information',
  })
  analyzeBloodMarkers() {
    return this.analysisService.analyzeAllForBloodMarkers();
  }
}
