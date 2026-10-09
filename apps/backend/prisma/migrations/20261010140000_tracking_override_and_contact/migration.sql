-- Page-level "Override Global Tracking" switch + contact-form message on leads.
-- Idempotent (safe on databases partially synced with `prisma db push`).

ALTER TABLE "Page" ADD COLUMN IF NOT EXISTS "trackingOverride" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "FanLead" ADD COLUMN IF NOT EXISTS "message" TEXT;
