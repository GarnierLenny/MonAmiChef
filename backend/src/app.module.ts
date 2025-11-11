import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';

// Core modules
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';

// Interceptors
import { PerformanceInterceptor } from './common/interceptors/performance.interceptor';

// TODO: Import these modules once controllers are migrated
// import { ChatModule } from './chat/chat.module';
// import { RecipeModule } from './recipe/recipe.module';
// import { MealPlanModule } from './meal-plan/meal-plan.module';
// import { GroceryListModule } from './grocery-list/grocery-list.module';
// import { UserHealthModule } from './user-health/user-health.module';

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

    // Feature modules - TODO: Uncomment after migration
    // ChatModule,
    // RecipeModule,
    // MealPlanModule,
    // GroceryListModule,
    // UserHealthModule,
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
