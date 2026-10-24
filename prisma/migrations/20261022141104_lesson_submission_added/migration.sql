-- CreateTable
CREATE TABLE "LessonSubmission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "fileUrl" TEXT,
    "videoUrl" TEXT,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LessonSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LessonSubmission_userId_idx" ON "LessonSubmission"("userId");

-- CreateIndex
CREATE INDEX "LessonSubmission_lessonId_idx" ON "LessonSubmission"("lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "LessonSubmission_userId_lessonId_key" ON "LessonSubmission"("userId", "lessonId");

-- AddForeignKey
ALTER TABLE "LessonSubmission" ADD CONSTRAINT "LessonSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonSubmission" ADD CONSTRAINT "LessonSubmission_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
