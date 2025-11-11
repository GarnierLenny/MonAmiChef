import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtOptionalAuthGuard extends AuthGuard('jwt-optional') {
  canActivate(context: ExecutionContext) {
    // Get the request
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    // If no auth header, allow the request but set user to null
    if (!authHeader) {
      request.user = null;
      return true;
    }

    // If auth header exists, try to validate it
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
    if (!token) {
      request.user = null;
      return true;
    }

    // Try to verify the token
    try {
      const decoded = jwt.verify(token, process.env.SUPABASE_JWT_SECRET!);
      request.user = decoded;
      return true;
    } catch (error) {
      // If token is invalid, treat as guest
      request.user = null;
      return true;
    }
  }
}
