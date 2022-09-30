-- CreateTable
CREATE TABLE "PB_Report" (
    "reportId" SERIAL NOT NULL,
    "reportReason" INTEGER NOT NULL,
    "reportDetails" TEXT,
    "postId" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,

    CONSTRAINT "PB_Report_pkey" PRIMARY KEY ("reportId")
);

-- AddForeignKey
ALTER TABLE "PB_Report" ADD CONSTRAINT "PB_Report_postId_fkey" FOREIGN KEY ("postId") REFERENCES "PB_Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PB_Report" ADD CONSTRAINT "PB_Report_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "PB_AnonymousPoster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
