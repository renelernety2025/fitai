-- CreateEnum
CREATE TYPE "PreprocessingStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "preprocessingError" TEXT,
ADD COLUMN     "preprocessingJobId" TEXT,
ADD COLUMN     "preprocessingStatus" "PreprocessingStatus" NOT NULL DEFAULT 'PENDING';
