import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthUser } from './jwt.strategy';

@Injectable()
export class JwtOptionalStrategy extends PassportStrategy(Strategy, 'jwt-optional') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.SUPABASE_JWT_SECRET || 'fallback-secret',
      // This allows the strategy to succeed even if no token is provided
      passReqToCallback: false,
    });
  }

  async validate(payload: any): Promise<AuthUser | null> {
    if (!payload) {
      return null;
    }

    return {
      sub: payload.sub,
      email: payload.email,
      groups: payload.groups,
    };
  }
}
