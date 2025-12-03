/*
  Warnings:

  - A unique constraint covering the columns `[clientId]` on the table `Chat` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `clientId` to the `Chat` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "clientId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Chat_clientId_key" ON "Chat"("clientId");
