import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Res,
  UseGuards,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { PrismaService } from '../services/prisma.service';
import { JwtOptionalAuthGuard } from '../guards/jwt-optional-auth.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { AuthUser } from '../strategies/jwt.strategy';

interface GuestStatusResponse {
  isGuest: boolean;
  guestId?: string;
  conversationCount?: number;
  canConvert?: boolean;
}

interface ConvertGuestRequest {
  guest_id: string;
  conversion_token: string;
}

interface ConvertGuestResponse {
  success: boolean;
  message: string;
  data?: {
    conversationsTransferred?: number;
    profile?: {
      id: string;
      email?: string;
    };
  };
}

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get current session status (guest or authenticated)
   */
  @Get('status')
  @UseGuards(JwtOptionalAuthGuard)
  @ApiOperation({ summary: 'Get current session status' })
  @ApiResponse({ status: 200, description: 'Session status retrieved' })
  async getSessionStatus(
    @CurrentUser() user: AuthUser | null,
    @Req() request: Request,
  ): Promise<GuestStatusResponse> {
    if (user?.sub) {
      return {
        isGuest: false,
      };
    }

    // Guest status
    const guestSession = request.cookies?.guestSession as string | undefined;
    if (guestSession) {
      try {
        const [guestId] = guestSession.split(':');
        if (guestId) {
          // Count conversations for this guest
          const conversationCount = await this.prisma.conversation.count({
            where: { owner_guest_id: guestId },
          });

          return {
            isGuest: true,
            guestId,
            conversationCount,
            canConvert: conversationCount > 0,
          };
        }
      } catch (error) {
        console.warn('Failed to parse guest session:', error);
      }
    }

    return {
      isGuest: true,
      conversationCount: 0,
      canConvert: false,
    };
  }

  /**
   * Convert guest to authenticated user
   */
  @Post('convert-guest')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Convert guest to authenticated user' })
  @ApiResponse({ status: 200, description: 'Guest converted successfully' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 404, description: 'Guest not found' })
  async convertGuest(
    @CurrentUser() user: AuthUser,
    @Body() body: ConvertGuestRequest,
    @Req() request: Request,
  ): Promise<ConvertGuestResponse> {
    const userId = user.sub;

    if (!userId) {
      throw new HttpException('Authentication required', HttpStatus.UNAUTHORIZED);
    }

    const { guest_id, conversion_token } = body;

    if (!guest_id || !conversion_token) {
      throw new HttpException(
        'guest_id and conversion_token are required',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        // 1. Find and validate the guest
        const guest = await tx.guest.findUnique({
          where: { id: guest_id },
        });

        if (!guest) {
          throw new Error('Guest not found');
        }

        if (guest.converted_to_profile) {
          // Idempotent: already converted
          return {
            alreadyConverted: true,
            convertedUserId: guest.converted_user_id,
          };
        }

        if (guest.conversion_token !== conversion_token) {
          throw new Error('Invalid conversion token');
        }

        // 2. Reassign ownership of conversations from guest_id to user_id
        await tx.conversation.updateMany({
          where: { owner_guest_id: guest_id },
          data: {
            owner_guest_id: null,
            owner_profile_id: userId,
          },
        });

        // 3. Mark guest as converted
        await tx.guest.update({
          where: { id: guest_id },
          data: {
            converted_to_profile: true,
            converted_user_id: userId,
            converted_at: new Date(),
          },
        });

        // 4. Create audit record
        await tx.guestConversion.create({
          data: {
            guest_id: guest_id,
            converted_user_id: userId,
            ip_address: request.ip || (request.connection as any).remoteAddress || null,
            user_agent: request.get('User-Agent') || null,
          },
        });

        return { alreadyConverted: false };
      });

      if (result.alreadyConverted) {
        if (result.convertedUserId === userId) {
          return { success: true, message: 'Guest already converted to this user' };
        } else {
          throw new HttpException(
            'Guest already converted to different user',
            HttpStatus.CONFLICT,
          );
        }
      }

      // Get user profile and conversation count for response
      const [profile, conversationCount] = await Promise.all([
        this.prisma.profile.findUnique({
          where: { id: userId },
          select: { id: true, email: true },
        }),
        this.prisma.conversation.count({
          where: { owner_profile_id: userId },
        }),
      ]);

      return {
        success: true,
        message: `Successfully converted guest and transferred conversations`,
        data: {
          conversationsTransferred: conversationCount,
          profile: profile
            ? {
                id: profile.id,
                email: profile.email || undefined,
              }
            : undefined,
        },
      };
    } catch (error) {
      console.error('Guest conversion error:', error);

      if (error instanceof Error) {
        if (error.message === 'Guest not found') {
          throw new HttpException('Guest not found', HttpStatus.NOT_FOUND);
        }
        if (error.message === 'Invalid conversion token') {
          throw new HttpException('Invalid conversion token', HttpStatus.FORBIDDEN);
        }
      }

      throw new HttpException(
        'Internal server error during conversion',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
