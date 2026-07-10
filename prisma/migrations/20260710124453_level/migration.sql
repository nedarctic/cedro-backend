/*
  Warnings:

  - A unique constraint covering the columns `[level]` on the table `TeamMember` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "TeamMember" ADD COLUMN     "level" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "TeamMember_level_key" ON "TeamMember"("level");
