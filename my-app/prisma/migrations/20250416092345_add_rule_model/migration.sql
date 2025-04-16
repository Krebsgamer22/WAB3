-- CreateTable
CREATE TABLE "Rule" (
    "id" SERIAL NOT NULL,
    "effectiveYear" INTEGER NOT NULL UNIQUE,
    "description" TEXT NOT NULL,
    "discipline" "Discipline" NOT NULL,
    "criteria" JSONB NOT NULL,

    CONSTRAINT "Rule_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Rule_effectiveYear_discipline_idx" ON "Rule"("effectiveYear", "discipline");
