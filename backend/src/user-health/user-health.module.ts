import { Module } from '@nestjs/common';
import { UserHealthController } from './user-health.controller';
import { UserHealthService } from './user-health.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UserHealthController],
  providers: [UserHealthService],
  exports: [UserHealthService],
})
export class UserHealthModule {}
