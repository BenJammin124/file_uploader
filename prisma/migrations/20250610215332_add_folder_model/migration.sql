-- AlterTable
ALTER TABLE "StoredFile" ADD COLUMN     "folderId" INTEGER;

-- CreateTable
CREATE TABLE "Folder" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "storageId" INTEGER NOT NULL,

    CONSTRAINT "Folder_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "StoredFile" ADD CONSTRAINT "StoredFile_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_storageId_fkey" FOREIGN KEY ("storageId") REFERENCES "UserStorage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
