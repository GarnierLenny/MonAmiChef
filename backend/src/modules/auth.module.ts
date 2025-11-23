import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '../strategies/jwt.strategy';
import { JwtOptionalStrategy } from '../strategies/jwt-optional.strategy';
import { AuthController } from '../controllers/auth.controller';
import { PrismaModule } from './prisma.module';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.SUPABASE_JWT_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [JwtStrategy, JwtOptionalStrategy],
  exports: [JwtModule, PassportModule],
})
export class AuthModule {}
