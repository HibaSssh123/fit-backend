import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DashboardService } from './dashboard.service';

type AuthedRequest = Request & { user: { sub: string } };

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('daily')
  @ApiOperation({ summary: 'Get daily nutrition and goal adherence' })
  @ApiQuery({ name: 'date', required: false, example: '2026-06-19' })
  getDaily(@Req() req: AuthedRequest, @Query('date') date?: string) {
    return this.dashboardService.getDailyProgress(req.user.sub, date);
  }
}
