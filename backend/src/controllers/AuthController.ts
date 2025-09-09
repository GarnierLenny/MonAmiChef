import {
  Body,
  Controller,
  Post,
  Route,
  Tags,
  Security,
  SuccessResponse,
  Request,
  Response,
  Get,
} from "tsoa";
import { prisma } from "../app";
import type { AuthUser } from '../authentication';
import * as express from "express";

export interface GuestStatusResponse {
  isGuest: boolean;
  guestId?: string;
  conversationCount?: number;
  canConvert?: boolean;
}

export interface ConvertGuestRequest {
  guest_id: string;
  conversion_token: string;
}

export interface ConvertGuestResponse {
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

@Route("auth")
@Tags("Authentication")
export class AuthController extends Controller {
  /**
   * Get current session status (guest or authenticated)
   */
  @Get("status")
  @Security("optionalAuth")
  public async getSessionStatus(
    @Request() request: express.Request,
  ): Promise<GuestStatusResponse> {
    const user = (request as any).user as AuthUser | null;
    
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
          const conversationCount = await prisma.conversation.count({
            where: { owner_guest_id: guestId }
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
   * This endpoint handles the atomic migration of guest data to an authenticated user
   */
  @Post("convert-guest")
  @Security("bearerAuth")
  @SuccessResponse(200, "Guest converted successfully")
  public async convertGuest(
    @Request() request: express.Request,
    @Body() body: ConvertGuestRequest,
  ): Promise<ConvertGuestResponse> {
    const user = (request as any).user as AuthUser;
    const userId = user.sub;
    
    if (!userId) {
      this.setStatus(401);
      return { success: false, message: "Authentication required" };
    }

    const { guest_id, conversion_token } = body;

    if (!guest_id || !conversion_token) {
      this.setStatus(400);
      return { success: false, message: "guest_id and conversion_token are required" };
    }

    try {
      const result = await prisma.$transaction(async (tx) => {
        // 1. Find and validate the guest
        const guest = await tx.guest.findUnique({
          where: { id: guest_id },
        });

        if (!guest) {
          throw new Error("Guest not found");
        }

        if (guest.converted_to_profile) {
          // Idempotent: already converted
          return { 
            alreadyConverted: true, 
            convertedUserId: guest.converted_user_id,
          };
        }

        if (guest.conversion_token !== conversion_token) {
          throw new Error("Invalid conversion token");
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
            ip_address: request.ip || request.connection.remoteAddress || null,
            user_agent: request.get('User-Agent') || null,
          },
        });

        return { alreadyConverted: false };
      });

      if (result.alreadyConverted) {
        if (result.convertedUserId === userId) {
          return { success: true, message: "Guest already converted to this user" };
        } else {
          this.setStatus(409);
          return { 
            success: false, 
            message: "Guest already converted to different user" 
          };
        }
      }

      // Get user profile and conversation count for response
      const [profile, conversationCount] = await Promise.all([
        prisma.profile.findUnique({
          where: { id: userId },
          select: { id: true, email: true }
        }),
        prisma.conversation.count({
          where: { owner_profile_id: userId }
        })
      ]);

      return { 
        success: true, 
        message: `Successfully converted guest and transferred conversations`,
        data: {
          conversationsTransferred: conversationCount,
          profile: profile ? {
            id: profile.id,
            email: profile.email || undefined,
          } : undefined,
        }
      };

    } catch (error) {
      console.error("Guest conversion error:", error);
      
      if (error instanceof Error) {
        if (error.message === "Guest not found") {
          this.setStatus(404);
          return { success: false, message: "Guest not found" };
        }
        if (error.message === "Invalid conversion token") {
          this.setStatus(403);
          return { success: false, message: "Invalid conversion token" };
        }
      }

      this.setStatus(500);
      return { 
        success: false, 
        message: "Internal server error during conversion" 
      };
    }
  }
}