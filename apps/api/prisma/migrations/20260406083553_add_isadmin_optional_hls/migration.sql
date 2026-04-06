-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isAdmin" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Video" ALTER COLUMN "hlsUrl" DROP NOT NULL,
ALTER COLUMN "choreographyUrl" DROP NOT NULL;
