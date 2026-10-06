-- Brings the database in line with schema.prisma after the campaign/tracking work.
-- Written idempotently (IF NOT EXISTS / guarded DO blocks) so it is safe to run on a
-- database that was partially synced with `prisma db push`.

-- AlterTable: Page campaign fields
ALTER TABLE "Page"
    ADD COLUMN IF NOT EXISTS "campaignType"  TEXT NOT NULL DEFAULT 'podcast',
    ADD COLUMN IF NOT EXISTS "brand"         TEXT NOT NULL DEFAULT 'ASHWIN_GANE',
    ADD COLUMN IF NOT EXISTS "status"        TEXT NOT NULL DEFAULT 'PUBLISHED',
    ADD COLUMN IF NOT EXISTS "artistName"    TEXT,
    ADD COLUMN IF NOT EXISTS "episodeNumber" TEXT,
    ADD COLUMN IF NOT EXISTS "guestName"     TEXT,
    ADD COLUMN IF NOT EXISTS "hostName"      TEXT,
    ADD COLUMN IF NOT EXISTS "ctaType"       TEXT DEFAULT 'Listen Now',
    ADD COLUMN IF NOT EXISTS "coverImage"    TEXT,
    ADD COLUMN IF NOT EXISTS "bgImage"       TEXT,
    ADD COLUMN IF NOT EXISTS "releaseDate"   TIMESTAMP(3),
    ADD COLUMN IF NOT EXISTS "ctaText"       TEXT DEFAULT 'Listen Now',
    ADD COLUMN IF NOT EXISTS "customDomain"  TEXT,
    ADD COLUMN IF NOT EXISTS "enableFanForm" BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN IF NOT EXISTS "fanFormTitle"  TEXT DEFAULT 'Join the Inner Circle',
    ADD COLUMN IF NOT EXISTS "ogImage"       TEXT;

-- AlterTable: Page.sections is stored as a JSON string, not jsonb
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'Page' AND column_name = 'sections' AND data_type = 'jsonb'
    ) THEN
        ALTER TABLE "Page" ALTER COLUMN "sections" DROP DEFAULT;
        ALTER TABLE "Page" ALTER COLUMN "sections" SET DATA TYPE TEXT USING "sections"::TEXT;
        ALTER TABLE "Page" ALTER COLUMN "sections" SET DEFAULT '[]';
    END IF;
END $$;

-- AlterTable: Project header/footer are stored as JSON strings, not jsonb
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'Project' AND column_name = 'defaultHeader' AND data_type = 'jsonb'
    ) THEN
        ALTER TABLE "Project" ALTER COLUMN "defaultHeader" SET DATA TYPE TEXT USING "defaultHeader"::TEXT;
    END IF;
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'Project' AND column_name = 'defaultFooter' AND data_type = 'jsonb'
    ) THEN
        ALTER TABLE "Project" ALTER COLUMN "defaultFooter" SET DATA TYPE TEXT USING "defaultFooter"::TEXT;
    END IF;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "PlatformLink" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "icon" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "PageView" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "ip" TEXT,
    "device" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "country" TEXT,
    "city" TEXT,
    "referer" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "utmContent" TEXT,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PageView_pkey" PRIMARY KEY ("id")
);

-- AlterTable: ClickLog now also records platform-link clicks, so trackerId is optional
ALTER TABLE "ClickLog"
    ADD COLUMN IF NOT EXISTS "platformLinkId" TEXT,
    ADD COLUMN IF NOT EXISTS "platform"       TEXT,
    ADD COLUMN IF NOT EXISTS "browser"        TEXT,
    ADD COLUMN IF NOT EXISTS "os"             TEXT,
    ADD COLUMN IF NOT EXISTS "utmSource"      TEXT,
    ADD COLUMN IF NOT EXISTS "utmMedium"      TEXT,
    ADD COLUMN IF NOT EXISTS "utmCampaign"    TEXT,
    ADD COLUMN IF NOT EXISTS "utmContent"     TEXT;

ALTER TABLE "ClickLog" ALTER COLUMN "trackerId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "FanLead"
    ADD COLUMN IF NOT EXISTS "phone"       TEXT,
    ADD COLUMN IF NOT EXISTS "consent"     BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN IF NOT EXISTS "utmSource"   TEXT,
    ADD COLUMN IF NOT EXISTS "utmMedium"   TEXT,
    ADD COLUMN IF NOT EXISTS "utmCampaign" TEXT;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PlatformLink_pageId_fkey') THEN
        ALTER TABLE "PlatformLink" ADD CONSTRAINT "PlatformLink_pageId_fkey"
            FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PageView_pageId_fkey') THEN
        ALTER TABLE "PageView" ADD CONSTRAINT "PageView_pageId_fkey"
            FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ClickLog_platformLinkId_fkey') THEN
        ALTER TABLE "ClickLog" ADD CONSTRAINT "ClickLog_platformLinkId_fkey"
            FOREIGN KEY ("platformLinkId") REFERENCES "PlatformLink"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
