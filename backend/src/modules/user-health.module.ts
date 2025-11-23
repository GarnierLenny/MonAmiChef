import { Module } from '@nestjs/common';
import { UserHealthController } from '../controllers/user-health.controller';
import { UserHealthService } from '../services/user-health.service';
import { UserHealthRepository } from '../repositories/user-health.repository';
import { PrismaModule } from './prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UserHealthController],
  providers: [UserHealthService, UserHealthRepository],
  exports: [UserHealthService],
})
export class UserHealthModule {}
