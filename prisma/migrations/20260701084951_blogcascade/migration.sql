-- DropForeignKey
ALTER TABLE "Section" DROP CONSTRAINT "Section_blogId_fkey";

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "Blog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
