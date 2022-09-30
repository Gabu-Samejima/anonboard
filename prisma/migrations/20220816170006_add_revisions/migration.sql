/*
  Warnings:

  - Added the required column `pB_AnonymousPosterId` to the `PB_Revision` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PB_Post" ADD COLUMN     "editCode" TEXT;

-- AlterTable
ALTER TABLE "PB_Revision" ADD COLUMN     "pB_AnonymousPosterId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "PB_Revision" ADD CONSTRAINT "PB_Revision_pB_AnonymousPosterId_fkey" FOREIGN KEY ("pB_AnonymousPosterId") REFERENCES "PB_AnonymousPoster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
