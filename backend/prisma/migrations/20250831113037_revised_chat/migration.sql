/*
  Warnings:

  - The primary key for the `ChatMessage` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `content` on the `ChatMessage` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `ChatMessage` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `ChatMessage` table. All the data in the column will be lost.
  - Added the required column `messages` to the `ChatMessage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Conversation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Conversation" DROP CONSTRAINT "Conversation_userId_fkey";

-- AlterTable
ALTER TABLE "public"."ChatMessage" DROP CONSTRAINT "ChatMessage_pkey",
DROP COLUMN "content",
DROP COLUMN "id",
DROP COLUMN "type",
ADD COLUMN     "messages" JSON NOT NULL,
ADD CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("conversationId");

-- AlterTable
ALTER TABLE "public"."Conversation" ADD COLUMN     "title" TEXT NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Conversation" ADD CONSTRAINT "Conversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
