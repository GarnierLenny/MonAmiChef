-- CreateTable (idempotent - only create if not exists)
CREATE TABLE IF NOT EXISTS "public"."GroceryList" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GroceryList_pkey" PRIMARY KEY ("id")
);

-- CreateTable (idempotent - only create if not exists)
CREATE TABLE IF NOT EXISTS "public"."GroceryMeal" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "list_id" UUID NOT NULL,
    "meal_plan_item_id" UUID NOT NULL,
    "day" INTEGER NOT NULL,
    "meal_slot" "public"."MealSlot" NOT NULL,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroceryMeal_pkey" PRIMARY KEY ("id")
);

-- CreateTable (idempotent - only create if not exists)
CREATE TABLE IF NOT EXISTS "public"."CustomGroceryItem" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "list_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" TEXT,
    "category" TEXT,
    "checked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomGroceryItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex (idempotent - only create if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'GroceryList_user_id_key') THEN
        CREATE UNIQUE INDEX "GroceryList_user_id_key" ON "public"."GroceryList"("user_id");
    END IF;
END $$;

-- CreateIndex (idempotent - only create if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'GroceryMeal_list_id_idx') THEN
        CREATE INDEX "GroceryMeal_list_id_idx" ON "public"."GroceryMeal"("list_id");
    END IF;
END $$;

-- CreateIndex (idempotent - only create if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'grocery_meal_list_item_unique') THEN
        CREATE UNIQUE INDEX "grocery_meal_list_item_unique" ON "public"."GroceryMeal"("list_id", "meal_plan_item_id");
    END IF;
END $$;

-- CreateIndex (idempotent - only create if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'CustomGroceryItem_list_id_idx') THEN
        CREATE INDEX "CustomGroceryItem_list_id_idx" ON "public"."CustomGroceryItem"("list_id");
    END IF;
END $$;

-- AddForeignKey (idempotent - only add if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'GroceryMeal_list_id_fkey'
    ) THEN
        ALTER TABLE "public"."GroceryMeal"
            ADD CONSTRAINT "GroceryMeal_list_id_fkey"
            FOREIGN KEY ("list_id")
            REFERENCES "public"."GroceryList"("id")
            ON DELETE CASCADE
            ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey (idempotent - only add if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'CustomGroceryItem_list_id_fkey'
    ) THEN
        ALTER TABLE "public"."CustomGroceryItem"
            ADD CONSTRAINT "CustomGroceryItem_list_id_fkey"
            FOREIGN KEY ("list_id")
            REFERENCES "public"."GroceryList"("id")
            ON DELETE CASCADE
            ON UPDATE CASCADE;
    END IF;
END $$;

-- Clean up orphaned GroceryMeal records before adding foreign key to MealPlanItem
-- Delete GroceryMeal records that reference non-existent MealPlanItems
DELETE FROM "public"."GroceryMeal"
WHERE "meal_plan_item_id" NOT IN (
    SELECT "id" FROM "public"."MealPlanItem"
);

-- AddForeignKey to MealPlanItem (idempotent - only add if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'GroceryMeal_meal_plan_item_id_fkey'
    ) THEN
        ALTER TABLE "public"."GroceryMeal"
            ADD CONSTRAINT "GroceryMeal_meal_plan_item_id_fkey"
            FOREIGN KEY ("meal_plan_item_id")
            REFERENCES "public"."MealPlanItem"("id")
            ON DELETE CASCADE
            ON UPDATE CASCADE;
    END IF;
END $$;
