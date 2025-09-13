-- CreateEnum
CREATE TYPE "public"."MealSlot" AS ENUM ('breakfast', 'lunch', 'dinner', 'snack');

-- CreateEnum
CREATE TYPE "public"."GenerationMethod" AS ENUM ('manual', 'ai_generated', 'ai_assisted');

-- DropForeignKey
ALTER TABLE "public"."Conversation" DROP CONSTRAINT "Conversation_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Guest" DROP CONSTRAINT "Guest_converted_user_id_fkey";

-- CreateTable
CREATE TABLE "public"."MealPlan" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "week_start_date" DATE NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "title" TEXT,
    "generation_prompt" TEXT,
    "generation_method" "public"."GenerationMethod",
    "ai_preferences" JSONB,

    CONSTRAINT "MealPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MealPlanItem" (
    "id" UUID NOT NULL,
    "meal_plan_id" UUID NOT NULL,
    "day" INTEGER NOT NULL,
    "meal_slot" "public"."MealSlot" NOT NULL,
    "recipe_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MealPlanItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "meal_plans_user_week_idx" ON "public"."MealPlan"("user_id", "week_start_date");

-- CreateIndex
CREATE INDEX "meal_plan_items_plan_idx" ON "public"."MealPlanItem"("meal_plan_id");

-- CreateIndex
CREATE UNIQUE INDEX "meal_plan_day_slot_unique" ON "public"."MealPlanItem"("meal_plan_id", "day", "meal_slot");

-- AddForeignKey
ALTER TABLE "public"."Conversation" ADD CONSTRAINT "Conversation_userId_fkey" FOREIGN KEY ("owner_profile_id") REFERENCES "public"."Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Guest" ADD CONSTRAINT "Guest_converted_user_id_fkey" FOREIGN KEY ("converted_user_id") REFERENCES "public"."Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MealPlanItem" ADD CONSTRAINT "MealPlanItem_meal_plan_id_fkey" FOREIGN KEY ("meal_plan_id") REFERENCES "public"."MealPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
