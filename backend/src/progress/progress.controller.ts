import { Controller, Get, Post, Req, UseGuards, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProgressService } from './progress.service';

type AuthedRequest = Request & { user: { sub: string } };

@ApiTags('Progress')
@ApiBearerAuth()
@Controller('progress')
@UseGuards(JwtAuthGuard)
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Post('record')
  @ApiOperation({ summary: 'Record daily progress metrics' })
  async recordProgress(@Req() req: AuthedRequest) {
    return this.progressService.recordDailyProgress(req.user.sub);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get progress summary for a period' })
  @ApiQuery({ name: 'days', required: false, type: Number, example: 30 })
  async getProgressSummary(
    @Req() req: AuthedRequest,
    @Query('days') days?: string,
  ): Promise<Record<string, any> | null> {
    const daysNum = days ? parseInt(days, 10) : 30;
    return this.progressService.getProgressSummary(req.user.sub, daysNum);
  }

  @Get('predictions')
  @ApiOperation({ summary: 'Get weight predictions via linear regression' })
  async getPredictions(@Req() req: AuthedRequest) {
    return this.progressService.getProgressPredictions(req.user.sub);
  }

  @Get('weight-history')
  @ApiOperation({ summary: 'Get weight history for charting' })
  @ApiQuery({ name: 'days', required: false, type: Number, example: 30 })
  async getWeightHistory(
    @Req() req: AuthedRequest,
    @Query('days') days?: string,
  ) {
    const daysNum = days ? parseInt(days, 10) : 30;
    return this.progressService.getWeightHistory(req.user.sub, daysNum);
  }

  @Get('calorie-history')
  @ApiOperation({ summary: 'Get calorie tracking history' })
  @ApiQuery({ name: 'days', required: false, type: Number, example: 30 })
  async getCalorieHistory(
    @Req() req: AuthedRequest,
    @Query('days') days?: string,
  ) {
    const daysNum = days ? parseInt(days, 10) : 30;
    return this.progressService.getCalorieHistory(req.user.sub, daysNum);
  }
}
