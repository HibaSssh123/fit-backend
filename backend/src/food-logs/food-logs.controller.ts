import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateFoodLogDto } from './dto/create-food-log.dto';
import { FoodLogsService } from './food-logs.service';

type AuthedRequest = Request & { user: { sub: string } };

@ApiTags('Food Logs')
@ApiBearerAuth()
@Controller('food-logs')
@UseGuards(JwtAuthGuard)
export class FoodLogsController {
  constructor(private readonly foodLogsService: FoodLogsService) {}

  @Post()
  @ApiOperation({ summary: 'Log food consumption' })
  create(
    @Req() req: AuthedRequest,
    @Body() createFoodLogDto: CreateFoodLogDto,
  ) {
    return this.foodLogsService.create(req.user.sub, createFoodLogDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get daily food logs with totals' })
  @ApiQuery({ name: 'date', required: true, example: '2026-06-19' })
  getDailyLogs(@Req() req: AuthedRequest, @Query('date') date: string) {
    return this.foodLogsService.getDailyLogs(req.user.sub, date);
  }

  @Get('totals')
  @ApiOperation({ summary: 'Get aggregated daily nutrition totals' })
  @ApiQuery({ name: 'date', required: true, example: '2026-06-19' })
  getDailyTotals(@Req() req: AuthedRequest, @Query('date') date: string) {
    return this.foodLogsService.getDailyTotals(req.user.sub, date);
  }
}
