import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ChatbotService } from './chatbot.service';
import { CreateChatMessageDto } from './chatbot.dto';

type AuthedRequest = Request & { user: { sub: string } };

@ApiTags('Chatbot')
@ApiBearerAuth()
@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post()
  @ApiOperation({ summary: 'Send a message to the fitness chatbot' })
  async sendMessage(
    @Req() req: AuthedRequest,
    @Body() createChatMessageDto: CreateChatMessageDto,
  ): Promise<Record<string, any>> {
    return this.chatbotService.sendMessage(
      req.user.sub,
      createChatMessageDto.message,
    );
  }

  @Get('history')
  @ApiOperation({ summary: 'Get conversation history' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 50 })
  async getHistory(@Req() req: AuthedRequest, @Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return this.chatbotService.getConversationHistory(req.user.sub, limitNum);
  }

  @Delete('history')
  @ApiOperation({ summary: 'Clear conversation history' })
  async clearHistory(@Req() req: AuthedRequest) {
    return this.chatbotService.clearConversationHistory(req.user.sub);
  }
}
