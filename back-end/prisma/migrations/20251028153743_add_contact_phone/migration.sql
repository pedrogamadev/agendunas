-- Add contact phone columns to guides and trail sessions
ALTER TABLE "guias" ADD COLUMN "contactPhone" TEXT;
ALTER TABLE "sessoes_trilhas" ADD COLUMN "contactPhone" TEXT;
