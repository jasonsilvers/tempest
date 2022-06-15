-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('QUEUED', 'WORKING', 'FAILED', 'COMPLETED', 'KILLED');

-- CreateTable
CREATE TABLE "Job" (
    "id" SERIAL NOT NULL,
    "message" TEXT,
    "progress" INTEGER,
    "status" "JobStatus",
    "total" INTEGER,
    "url" TEXT,
    "startedById" INTEGER,
    "avgProcessingTime" DOUBLE PRECISION,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobResult" (
    "id" SERIAL NOT NULL,
    "status" "JobStatus",
    "success" BOOLEAN,
    "message" TEXT,
    "jobId" INTEGER NOT NULL,

    CONSTRAINT "JobResult_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_startedById_fkey" FOREIGN KEY ("startedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobResult" ADD CONSTRAINT "JobResult_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
