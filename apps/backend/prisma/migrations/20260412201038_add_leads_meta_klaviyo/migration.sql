-- AlterTable
ALTER TABLE "LinkTracker" ADD COLUMN     "platform" TEXT;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "klaviyoApiKey" TEXT,
ADD COLUMN     "klaviyoListId" TEXT,
ADD COLUMN     "metaCapiToken" TEXT,
ADD COLUMN     "metaPixelId" TEXT;

-- CreateTable
CREATE TABLE "FanLead" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "platform" TEXT,
    "source" TEXT,
    "city" TEXT,
    "country" TEXT,
    "device" TEXT,
    "segment" TEXT NOT NULL DEFAULT 'cold',
    "klaviyoSynced" BOOLEAN NOT NULL DEFAULT false,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FanLead_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FanLead" ADD CONSTRAINT "FanLead_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FanLead" ADD CONSTRAINT "FanLead_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
