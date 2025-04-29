/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Athlete` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[athleteId,discipline,date]` on the table `Performance` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `fileType` to the `SwimmingProof` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "FileType" AS ENUM ('PDF', 'JPEG', 'PNG');

-- DropIndex
DROP INDEX "Athlete_email_birthdate_key";

-- AlterTable
ALTER TABLE "SwimmingProof" ADD COLUMN     "fileType" "FileType" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Athlete_email_key" ON "Athlete"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Performance_athleteId_discipline_date_key" ON "Performance"("athleteId", "discipline", "date");
