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
import { CreateFoodDto } from './dto/create-food.dto';
import { FoodsService } from './foods.service';

type AuthedRequest = Request & { user: { sub: string } };

@ApiTags('Foods')
@ApiBearerAuth()
@Controller('foods')
@UseGuards(JwtAuthGuard)
export class FoodsController {
  constructor(private readonly foodsService: FoodsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a food entry' })
  create(@Req() req: AuthedRequest, @Body() createFoodDto: CreateFoodDto) {
    return this.foodsService.create(req.user.sub, createFoodDto);
  }

  @Get()
  @ApiOperation({ summary: 'Search foods' })
  @ApiQuery({ name: 'search', required: false })
  list(@Query('search') search?: string) {
    return this.foodsService.list(search);
  }
}
