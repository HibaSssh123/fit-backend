import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateChatMessageDto {
  @ApiProperty({ example: 'Should I eat more protein?' })
  @IsString()
  @MinLength(1)
  message!: string;
}

export interface ChatMessageResponse {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}
