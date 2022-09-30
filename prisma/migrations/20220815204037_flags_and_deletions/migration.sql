/*
  Warnings:

  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `ipAddress` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_creatorId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "ipAddress" TEXT NOT NULL;

-- DropTable
DROP TABLE "Post";

-- CreateTable
CREATE TABLE "PB_AnonymousPoster" (
    "id" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "aliasPosterId" TEXT,

    CONSTRAINT "PB_AnonymousPoster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PB_Alias" (
    "posterId" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "PB_Alias_pkey" PRIMARY KEY ("posterId")
);

-- CreateTable
CREATE TABLE "PB_Post" (
    "id" TEXT NOT NULL,
    "datePublished" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastEdited" TIMESTAMP(6),
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "flagged" BOOLEAN DEFAULT false,
    "deleted" BOOLEAN DEFAULT false,
    "anonymousPosterId" TEXT NOT NULL,

    CONSTRAINT "PB_Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PB_Revision" (
    "revisionId" TEXT NOT NULL,
    "oldTitle" TEXT NOT NULL,
    "newTitle" TEXT NOT NULL,
    "oldContent" TEXT NOT NULL,
    "newContent" TEXT NOT NULL,
    "postId" TEXT,

    CONSTRAINT "PB_Revision_pkey" PRIMARY KEY ("revisionId")
);

-- AddForeignKey
ALTER TABLE "PB_AnonymousPoster" ADD CONSTRAINT "PB_AnonymousPoster_aliasPosterId_fkey" FOREIGN KEY ("aliasPosterId") REFERENCES "PB_Alias"("posterId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PB_Post" ADD CONSTRAINT "PB_Post_anonymousPosterId_fkey" FOREIGN KEY ("anonymousPosterId") REFERENCES "PB_AnonymousPoster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PB_Revision" ADD CONSTRAINT "PB_Revision_postId_fkey" FOREIGN KEY ("postId") REFERENCES "PB_Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;
