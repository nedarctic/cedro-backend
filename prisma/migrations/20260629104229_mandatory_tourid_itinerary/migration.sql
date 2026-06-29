/*
  Warnings:

  - Made the column `tourId` on table `Itinerary` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Itinerary" DROP CONSTRAINT "Itinerary_tourId_fkey";

-- AlterTable
ALTER TABLE "Itinerary" ALTER COLUMN "tourId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Itinerary" ADD CONSTRAINT "Itinerary_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "Tour"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
