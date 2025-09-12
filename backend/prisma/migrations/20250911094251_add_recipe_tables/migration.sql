-- DropForeignKey
ALTER TABLE "public"."ChatMessage" DROP CONSTRAINT "ChatMessage_conversation_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Conversation" DROP CONSTRAINT "Conversation_owner_guest_id_fkey";

-- AlterTable
ALTER TABLE "public"."Guest" ADD COLUMN     "conversion_token" TEXT NOT NULL DEFAULT gen_random_uuid(),
ADD COLUMN     "converted_at" TIMESTAMPTZ(6),
ADD COLUMN     "converted_user_id" UUID,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(6);

-- CreateTable
CREATE TABLE "public"."GuestConversion" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "guest_id" UUID NOT NULL,
    "converted_user_id" UUID NOT NULL,
    "converted_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_address" TEXT,
    "user_agent" TEXT,

    CONSTRAINT "GuestConversion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Recipe" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "content_json" JSON NOT NULL,
    "nutrition" JSON,
    "tags" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Recipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SavedRecipe" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "owner_profile_id" UUID,
    "owner_guest_id" UUID,
    "recipe_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedRecipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RecipeHistory" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "owner_profile_id" UUID,
    "owner_guest_id" UUID,
    "recipe_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecipeHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SavedRecipe_owner_profile_id_recipe_id_key" ON "public"."SavedRecipe"("owner_profile_id", "recipe_id");

-- CreateIndex
CREATE UNIQUE INDEX "SavedRecipe_owner_guest_id_recipe_id_key" ON "public"."SavedRecipe"("owner_guest_id", "recipe_id");

-- AddForeignKey
ALTER TABLE "public"."ChatMessage" ADD CONSTRAINT "ChatMessage_conversationId_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."Conversation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Conversation" ADD CONSTRAINT "Conversation_owner_guest_id_fkey" FOREIGN KEY ("owner_guest_id") REFERENCES "public"."Guest"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Conversation" ADD CONSTRAINT "Conversation_userId_fkey" FOREIGN KEY ("owner_profile_id") REFERENCES "public"."Profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Guest" ADD CONSTRAINT "Guest_converted_user_id_fkey" FOREIGN KEY ("converted_user_id") REFERENCES "public"."Profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."GuestConversion" ADD CONSTRAINT "GuestConversion_guest_id_fkey" FOREIGN KEY ("guest_id") REFERENCES "public"."Guest"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."GuestConversion" ADD CONSTRAINT "GuestConversion_converted_user_id_fkey" FOREIGN KEY ("converted_user_id") REFERENCES "public"."Profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."SavedRecipe" ADD CONSTRAINT "SavedRecipe_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "public"."Recipe"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."SavedRecipe" ADD CONSTRAINT "SavedRecipe_owner_profile_id_fkey" FOREIGN KEY ("owner_profile_id") REFERENCES "public"."Profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."SavedRecipe" ADD CONSTRAINT "SavedRecipe_owner_guest_id_fkey" FOREIGN KEY ("owner_guest_id") REFERENCES "public"."Guest"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."RecipeHistory" ADD CONSTRAINT "RecipeHistory_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "public"."Recipe"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."RecipeHistory" ADD CONSTRAINT "RecipeHistory_owner_profile_id_fkey" FOREIGN KEY ("owner_profile_id") REFERENCES "public"."Profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."RecipeHistory" ADD CONSTRAINT "RecipeHistory_owner_guest_id_fkey" FOREIGN KEY ("owner_guest_id") REFERENCES "public"."Guest"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- CreateIndex
CREATE UNIQUE INDEX "RecipeHistory_owner_profile_id_recipe_id_key" ON "public"."RecipeHistory"("owner_profile_id", "recipe_id");

-- CreateIndex
CREATE UNIQUE INDEX "RecipeHistory_owner_guest_id_recipe_id_key" ON "public"."RecipeHistory"("owner_guest_id", "recipe_id");
