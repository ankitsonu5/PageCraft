-- Global tracking settings + OG title/description for pages.
-- Idempotent so it is safe on databases partially synced with `prisma db push`.

ALTER TABLE "Page"
    ADD COLUMN IF NOT EXISTS "ogTitle"       TEXT,
    ADD COLUMN IF NOT EXISTS "ogDescription" TEXT;

CREATE TABLE IF NOT EXISTS "TrackingSettings" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "gtmId" TEXT,
    "ga4MeasurementId" TEXT,
    "googleAdsId" TEXT,
    "googleAdsConversionLabel" TEXT,
    "metaPixelId" TEXT,
    "tiktokPixelId" TEXT,
    "snapchatPixelId" TEXT,
    "googleTagsViaGtm" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrackingSettings_pkey" PRIMARY KEY ("id")
);
