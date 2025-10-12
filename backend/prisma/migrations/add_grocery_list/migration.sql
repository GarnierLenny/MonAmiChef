-- CreateTable
CREATE TABLE "public"."GroceryList" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GroceryList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GroceryMeal" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "list_id" UUID NOT NULL,
    "meal_plan_item_id" UUID NOT NULL,
    "day" INTEGER NOT NULL,
    "meal_slot" "public"."MealSlot" NOT NULL,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroceryMeal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CustomGroceryItem" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "list_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" TEXT,
    "category" TEXT,
    "checked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomGroceryItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GroceryList_user_id_key" ON "public"."GroceryList"("user_id");

-- CreateIndex
CREATE INDEX "GroceryMeal_list_id_idx" ON "public"."GroceryMeal"("list_id");

-- CreateIndex
CREATE UNIQUE INDEX "grocery_meal_list_item_unique" ON "public"."GroceryMeal"("list_id", "meal_plan_item_id");

-- CreateIndex
CREATE INDEX "CustomGroceryItem_list_id_idx" ON "public"."CustomGroceryItem"("list_id");

-- AddForeignKey
ALTER TABLE "public"."GroceryMeal" ADD CONSTRAINT "GroceryMeal_list_id_fkey" FOREIGN KEY ("list_id") REFERENCES "public"."GroceryList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CustomGroceryItem" ADD CONSTRAINT "CustomGroceryItem_list_id_fkey" FOREIGN KEY ("list_id") REFERENCES "public"."GroceryList"("id") ON DELETE CASCADE ON UPDATE CASCADE;
