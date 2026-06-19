import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateGoalDto } from './dto/create-goal.dto';
import { GoalsService } from './goals.service';
import { UpdateGoalDto } from './dto/update-goal.dto';

type AuthedRequest = Request & { user: { sub: string } };

@ApiTags('Goals')
@ApiBearerAuth()
@Controller('goals')
@UseGuards(JwtAuthGuard)
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new goal (deactivates existing)' })
  create(@Req() req: AuthedRequest, @Body() createGoalDto: CreateGoalDto) {
    return this.goalsService.create(req.user.sub, createGoalDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get current active goal' })
  getCurrentGoal(@Req() req: AuthedRequest) {
    return this.goalsService.getCurrentGoal(req.user.sub);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a goal' })
  update(
    @Req() req: AuthedRequest,
    @Param('id') id: string,
    @Body() updateGoalDto: UpdateGoalDto,
  ) {
    return this.goalsService.update(req.user.sub, id, updateGoalDto);
  }

  @Get('progress')
  @ApiOperation({ summary: 'Get macro adherence for a period' })
  @ApiQuery({ name: 'period', required: false, enum: ['today', 'week'] })
  getProgress(
    @Req() req: AuthedRequest,
    @Query('period') period?: 'today' | 'week',
  ) {
    return this.goalsService.getProgress(req.user.sub, period ?? 'today');
  }
}
