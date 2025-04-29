-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "MedalType" AS ENUM ('BRONZE', 'SILVER', 'GOLD');

-- CreateEnum
CREATE TYPE "Discipline" AS ENUM ('AUSDAUER', 'KRAFT', 'SCHNELLIGKEIT', 'TECHNIK');

-- CreateTable
CREATE TABLE "Athlete" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "birthdate" TIMESTAMP(3) NOT NULL,
    "gender" "Gender" NOT NULL,

    CONSTRAINT "Athlete_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Performance" (
    "id" SERIAL NOT NULL,
    "athleteId" INTEGER NOT NULL,
    "discipline" "Discipline" NOT NULL,
    "value" DECIMAL(65,30) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "medal" "MedalType",

    CONSTRAINT "Performance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SwimmingProof" (
    "id" SERIAL NOT NULL,
    "athleteId" INTEGER NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "uploadDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SwimmingProof_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedalCriteria" (
    "discipline" "Discipline" NOT NULL,
    "minAge" INTEGER NOT NULL,
    "maxAge" INTEGER NOT NULL,
    "bronzeValue" DECIMAL(65,30) NOT NULL,
    "silverValue" DECIMAL(65,30) NOT NULL,
    "goldValue" DECIMAL(65,30) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Athlete_email_birthdate_key" ON "Athlete"("email", "birthdate");

-- CreateIndex
CREATE UNIQUE INDEX "SwimmingProof_athleteId_key" ON "SwimmingProof"("athleteId");

-- CreateIndex
CREATE UNIQUE INDEX "MedalCriteria_discipline_key" ON "MedalCriteria"("discipline");

-- AddForeignKey
ALTER TABLE "Performance" ADD CONSTRAINT "Performance_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "Athlete"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Performance" ADD CONSTRAINT "Performance_discipline_fkey" FOREIGN KEY ("discipline") REFERENCES "MedalCriteria"("discipline") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SwimmingProof" ADD CONSTRAINT "SwimmingProof_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "Athlete"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
