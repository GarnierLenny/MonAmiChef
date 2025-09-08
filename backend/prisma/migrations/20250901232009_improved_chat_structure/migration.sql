/*
  Warnings:

  - The `messages` column on the `ChatMessage` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `history` to the `ChatMessage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."ChatMessage" ADD COLUMN     "history" JSON NOT NULL,
DROP COLUMN "messages",
ADD COLUMN     "messages" JSON[];
