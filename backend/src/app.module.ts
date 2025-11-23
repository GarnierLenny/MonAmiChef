import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';

// Core modules
import { PrismaModule } from './modules/prisma.module';
import { AuthModule } from './modules/auth.module';
import { HealthModule } from './modules/health.module';

// Feature modules
import { UserHealthModule } from './modules/user-health.module';
import { GroceryListModule } from './modules/grocery-list.module';
import { MealPlanModule } from './modules/meal-plan.module';
import { ChatModule } from './modules/chat.module';
import { RecipeModule } from './modules/recipe.module';

// Interceptors
import { PerformanceInterceptor } from './interceptors/performance.interceptor';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Core modules
    PrismaModule,
    AuthModule,
    HealthModule,

    // Feature modules
    UserHealthModule,
    GroceryListModule,
    MealPlanModule,
    ChatModule,
    RecipeModule,
  ],
  providers: [
    // Global performance monitoring
    {
      provide: APP_INTERCEPTOR,
      useClass: PerformanceInterceptor,
    },
  ],
})
export class AppModule {}
