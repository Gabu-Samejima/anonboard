/*
  Warnings:

  - The `year` column on the `PB_Post` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "PB_Post" DROP COLUMN "year",
ADD COLUMN     "year" INTEGER DEFAULT 1;
