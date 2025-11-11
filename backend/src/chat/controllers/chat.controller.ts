import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { ChatService } from '../services/chat.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtOptionalAuthGuard } from '../../auth/guards/jwt-optional-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthUser } from '../../auth/strategies/jwt.strategy';
import { resolveOptimizedOwner } from '../../common/utils/owner.util';

// DTOs
import { ChatRequestDto } from '../dto/chat-request.dto';
import { ChatResponseDto } from '../dto/chat-response.dto';
import { RenameChatRequestDto } from '../dto/rename-chat-request.dto';
import { GenerateMealRecipeRequestDto } from '../dto/generate-meal-recipe-request.dto';
import { GenerateMealRecipeResponseDto } from '../dto/generate-meal-recipe-response.dto';
import { TranscribeResponseDto } from '../dto/transcribe-response.dto';
import { ConversationListItemDto } from '../dto/conversation-list-item.dto';
import { ConversationDetailDto } from '../dto/conversation-detail.dto';

@ApiTags('Chat')
@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Health check endpoint
   */
  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  getHealth(): {
    status: string;
    timestamp: string;
    environment: string;
  } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    };
  }

  /**
   * Create a new conversation
   */
  @Post('conversations')
  @UseGuards(JwtOptionalAuthGuard)
  @ApiOperation({ summary: 'Create a new conversation with AI assistant' })
  @ApiResponse({
    status: 201,
    description: 'Conversation created successfully',
    type: ChatResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 503, description: 'Service Unavailable' })
  async createConversation(
    @CurrentUser() user: AuthUser | null,
    @Req() request: Request,
    @Res() response: Response,
    @Body() body: ChatRequestDto,
  ): Promise<void> {
    const owner = await resolveOptimizedOwner(request, response, this.prisma);
    const result = await this.chatService.createConversation(body, owner);
    response.status(HttpStatus.CREATED).json(result);
  }

  /**
   * Send message to existing conversation
   */
  @Post('conversations/:conversationId')
  @UseGuards(JwtOptionalAuthGuard)
  @ApiOperation({ summary: 'Send message to existing conversation' })
  @ApiParam({
    name: 'conversationId',
    description: 'Conversation ID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Message sent successfully',
    type: ChatResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  @ApiResponse({ status: 503, description: 'Service Unavailable' })
  async sendMessage(
    @CurrentUser() user: AuthUser | null,
    @Req() request: Request,
    @Res() response: Response,
    @Param('conversationId') conversationId: string,
    @Body() body: ChatRequestDto,
  ): Promise<void> {
    const owner = await resolveOptimizedOwner(request, response, this.prisma);
    const result = await this.chatService.sendMessage(
      conversationId,
      body,
      owner,
    );
    response.json(result);
  }

  /**
   * Get user conversations
   */
  @Get('conversations')
  @UseGuards(JwtOptionalAuthGuard)
  @ApiOperation({ summary: 'Get list of user conversations' })
  @ApiResponse({
    status: 200,
    description: 'List of conversations',
    type: [ConversationListItemDto],
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getUserConversations(
    @CurrentUser() user: AuthUser | null,
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<void> {
    const owner = await resolveOptimizedOwner(request, response, this.prisma);
    const conversations = await this.chatService.getUserConversations(owner);
    response.json(conversations);
  }

  /**
   * Rename a conversation
   */
  @Patch('conversations/:conversationId')
  @UseGuards(JwtOptionalAuthGuard)
  @ApiOperation({ summary: 'Rename a conversation' })
  @ApiParam({
    name: 'conversationId',
    description: 'Conversation ID',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Conversation renamed successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async renameUserChat(
    @CurrentUser() user: AuthUser | null,
    @Req() request: Request,
    @Res() response: Response,
    @Param('conversationId') conversationId: string,
    @Body() body: RenameChatRequestDto,
  ): Promise<void> {
    const owner = await resolveOptimizedOwner(request, response, this.prisma);
    const result = await this.chatService.renameConversation(
      conversationId,
      body.newTitle,
      owner,
    );
    response.json(result);
  }

  /**
   * Delete a conversation
   */
  @Delete('conversations/:conversationId')
  @UseGuards(JwtOptionalAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a conversation' })
  @ApiParam({
    name: 'conversationId',
    description: 'Conversation ID',
    type: String,
  })
  @ApiResponse({ status: 204, description: 'Conversation deleted successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async deleteUserChat(
    @CurrentUser() user: AuthUser | null,
    @Req() request: Request,
    @Res() response: Response,
    @Param('conversationId') conversationId: string,
  ): Promise<void> {
    const owner = await resolveOptimizedOwner(request, response, this.prisma);
    await this.chatService.deleteConversation(conversationId, owner);
    response.status(HttpStatus.NO_CONTENT).send();
  }

  /**
   * Get conversation messages
   */
  @Get('conversations/:conversationId/messages')
  @UseGuards(JwtOptionalAuthGuard)
  @ApiOperation({ summary: 'Get messages for a specific conversation' })
  @ApiParam({
    name: 'conversationId',
    description: 'Conversation ID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Conversation messages',
    type: ConversationDetailDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getUserChatFromId(
    @CurrentUser() user: AuthUser | null,
    @Req() request: Request,
    @Res() response: Response,
    @Param('conversationId') conversationId: string,
  ): Promise<void> {
    const owner = await resolveOptimizedOwner(request, response, this.prisma);
    const result = await this.chatService.getConversationMessages(
      conversationId,
      owner,
    );
    response.json(result);
  }

  /**
   * Generate a recipe for a specific meal slot
   */
  @Post('generate-meal-recipe')
  @UseGuards(JwtOptionalAuthGuard)
  @ApiOperation({ summary: 'Generate a recipe for a specific meal slot' })
  @ApiResponse({
    status: 201,
    description: 'Recipe generated successfully',
    type: GenerateMealRecipeResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @ApiResponse({ status: 503, description: 'Service Unavailable' })
  async generateMealRecipe(
    @CurrentUser() user: AuthUser | null,
    @Req() request: Request,
    @Res() response: Response,
    @Body() body: GenerateMealRecipeRequestDto,
  ): Promise<void> {
    const owner = await resolveOptimizedOwner(request, response, this.prisma);
    const result = await this.chatService.generateMealRecipe(
      body.mealType,
      body.preferences,
      body.dietaryRestrictions,
      body.day,
      owner,
    );
    response.status(HttpStatus.CREATED).json(result);
  }

  /**
   * Transcribe audio to text using Gemini
   */
  @Post('transcribe')
  @UseGuards(JwtOptionalAuthGuard)
  @UseInterceptors(FileInterceptor('audio'))
  @ApiOperation({ summary: 'Transcribe audio to text' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 200,
    description: 'Audio transcribed successfully',
    type: TranscribeResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @ApiResponse({ status: 503, description: 'Service Unavailable' })
  async transcribeAudio(
    @CurrentUser() user: AuthUser | null,
    @UploadedFile() audio: Express.Multer.File,
  ): Promise<TranscribeResponseDto> {
    return await this.chatService.transcribeAudio(audio);
  }
}
