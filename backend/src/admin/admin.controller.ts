import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from './admin.guard';
import { AdminService } from './admin.service';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  @ApiOperation({ summary: 'List all users (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'role', required: false, enum: ['USER', 'ADMIN'] })
  getUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('role') role?: 'USER' | 'ADMIN',
  ) {
    return this.adminService.getUsers(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10,
      role,
    );
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get platform analytics' })
  getAnalytics() {
    return this.adminService.getAnalytics();
  }

  @Patch('users/:id/ban')
  @ApiOperation({ summary: 'Ban a user' })
  banUser(@Param('id') userId: string) {
    return this.adminService.toggleUserStatus(userId, false);
  }

  @Patch('users/:id/unban')
  @ApiOperation({ summary: 'Unban a user' })
  unbanUser(@Param('id') userId: string) {
    return this.adminService.toggleUserStatus(userId, true);
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete a user' })
  deleteUser(@Param('id') userId: string) {
    return this.adminService.deleteUser(userId);
  }

  @Patch('users/:id/promote')
  @ApiOperation({ summary: 'Promote user to admin' })
  promoteToAdmin(@Param('id') userId: string) {
    return this.adminService.promoteToAdmin(userId);
  }

  @Patch('users/:id/demote')
  @ApiOperation({ summary: 'Demote admin to user' })
  demoteFromAdmin(@Param('id') userId: string) {
    return this.adminService.demoteFromAdmin(userId);
  }
}
