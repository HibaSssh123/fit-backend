import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ExerciseType } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { ExercisesService } from './exercises.service';

@ApiTags('Exercises')
@Controller('exercises')
export class ExercisesController {
  constructor(private readonly exercisesService: ExercisesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create an exercise' })
  create(@Body() createExerciseDto: CreateExerciseDto) {
    return this.exercisesService.create(createExerciseDto);
  }

  @Get()
  @ApiOperation({ summary: 'List exercises with filters' })
  @ApiQuery({ name: 'type', required: false, enum: ExerciseType })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'muscleGroup', required: false })
  list(
    @Query('type') type?: ExerciseType,
    @Query('category') categoryId?: string,
    @Query('search') search?: string,
    @Query('muscleGroup') muscleGroup?: string,
  ) {
    return this.exercisesService.list({
      type,
      categoryId,
      search,
      muscleGroup,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get exercise by ID' })
  getById(@Param('id') id: string) {
    return this.exercisesService.getById(id);
  }
}
