/*
  Warnings:

  - Added the required column `dates` to the `Tour` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `Tour` table without a default value. This is not possible if the table is not empty.
  - Added the required column `destinationId` to the `Tour` table without a default value. This is not possible if the table is not empty.
  - Added the required column `duration` to the `Tour` table without a default value. This is not possible if the table is not empty.
  - Added the required column `groupSize` to the `Tour` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `Tour` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tourImageKey` to the `Tour` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tourImageUrl` to the `Tour` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Tour" ADD COLUMN     "activities" TEXT[],
ADD COLUMN     "dates" TEXT NOT NULL,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "destinationId" TEXT NOT NULL,
ADD COLUMN     "duration" TEXT NOT NULL,
ADD COLUMN     "excluded" TEXT[],
ADD COLUMN     "groupSize" TEXT NOT NULL,
ADD COLUMN     "included" TEXT[],
ADD COLUMN     "price" TEXT NOT NULL,
ADD COLUMN     "tourImageKey" TEXT NOT NULL,
ADD COLUMN     "tourImageUrl" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Destination" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Destination_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Itinerary" (
    "id" TEXT NOT NULL,
    "activities" TEXT[],
    "subtitle" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "itineraryImageKey" TEXT NOT NULL,
    "itineraryImageUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tourId" TEXT,

    CONSTRAINT "Itinerary_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Tour" ADD CONSTRAINT "Tour_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Itinerary" ADD CONSTRAINT "Itinerary_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "Tour"("id") ON DELETE SET NULL ON UPDATE CASCADE;
