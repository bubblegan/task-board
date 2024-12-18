/*
  Warnings:

  - You are about to drop the column `keyword` on the `Task` table. All the data in the column will be lost.
  - Added the required column `boardId` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Board" ADD COLUMN     "position" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "keyword",
ADD COLUMN     "boardId" INTEGER NOT NULL,
ADD COLUMN     "position" INTEGER NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE CASCADE ON UPDATE CASCADE;
