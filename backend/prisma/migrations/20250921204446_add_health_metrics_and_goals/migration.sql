-- CreateTable
CREATE TABLE "public"."HealthMetric" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "profile_id" UUID NOT NULL,
    "weight" DECIMAL(5,2),
    "body_fat" DECIMAL(4,2),
    "recorded_at" DATE NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HealthMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserGoals" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "profile_id" UUID NOT NULL,
    "target_weight" DECIMAL(5,2),
    "target_body_fat" DECIMAL(4,2),
    "daily_protein_goal" INTEGER,
    "daily_carbs_goal" INTEGER,
    "daily_fat_goal" INTEGER,
    "daily_calories_goal" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserGoals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HealthMetric_profile_id_recorded_at_idx" ON "public"."HealthMetric"("profile_id", "recorded_at");

-- CreateIndex
CREATE UNIQUE INDEX "UserGoals_profile_id_key" ON "public"."UserGoals"("profile_id");

-- AddForeignKey
ALTER TABLE "public"."MealPlanItem" ADD CONSTRAINT "MealPlanItem_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "public"."Recipe"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HealthMetric" ADD CONSTRAINT "HealthMetric_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserGoals" ADD CONSTRAINT "UserGoals_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
