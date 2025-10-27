/*
  Warnings:

  - You are about to drop the `ActivityLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Booking` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Event` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EventRegistration` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FaunaFloraRecord` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Guide` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Participant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Trail` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TrailGuide` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TrailSession` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "TipoUsuario" AS ENUM ('A', 'C', 'G');

-- DropForeignKey
ALTER TABLE "public"."ActivityLog" DROP CONSTRAINT "ActivityLog_bookingId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ActivityLog" DROP CONSTRAINT "ActivityLog_eventId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ActivityLog" DROP CONSTRAINT "ActivityLog_trailId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Booking" DROP CONSTRAINT "Booking_guideId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Booking" DROP CONSTRAINT "Booking_sessionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Booking" DROP CONSTRAINT "Booking_trailId_fkey";

-- DropForeignKey
ALTER TABLE "public"."EventRegistration" DROP CONSTRAINT "EventRegistration_eventId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Guide" DROP CONSTRAINT "Guide_featuredTrailId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Participant" DROP CONSTRAINT "Participant_bookingId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TrailGuide" DROP CONSTRAINT "TrailGuide_guideId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TrailGuide" DROP CONSTRAINT "TrailGuide_trailId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TrailSession" DROP CONSTRAINT "TrailSession_primaryGuideId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TrailSession" DROP CONSTRAINT "TrailSession_trailId_fkey";

-- DropTable
DROP TABLE "public"."ActivityLog";

-- DropTable
DROP TABLE "public"."Booking";

-- DropTable
DROP TABLE "public"."Event";

-- DropTable
DROP TABLE "public"."EventRegistration";

-- DropTable
DROP TABLE "public"."FaunaFloraRecord";

-- DropTable
DROP TABLE "public"."Guide";

-- DropTable
DROP TABLE "public"."Participant";

-- DropTable
DROP TABLE "public"."Trail";

-- DropTable
DROP TABLE "public"."TrailGuide";

-- DropTable
DROP TABLE "public"."TrailSession";

-- CreateTable
CREATE TABLE "usuarios" (
    "cpf" TEXT NOT NULL,
    "nome" TEXT,
    "email" TEXT,
    "senhaHash" TEXT NOT NULL,
    "tipo" "TipoUsuario" NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("cpf")
);

-- CreateTable
CREATE TABLE "convites" (
    "token" TEXT NOT NULL,
    "cpfConvidado" TEXT NOT NULL,
    "tipo" "TipoUsuario" NOT NULL,
    "criadoPorCpf" TEXT NOT NULL,
    "validoAte" TIMESTAMP(3) NOT NULL,
    "utilizadoEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "convites_pkey" PRIMARY KEY ("token")
);

-- CreateTable
CREATE TABLE "guias" (
    "cpf" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "photoUrl" TEXT,
    "speciality" TEXT,
    "biography" TEXT,
    "summary" TEXT,
    "experienceYears" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "toursCompleted" INTEGER NOT NULL DEFAULT 0,
    "languages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "certifications" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "curiosities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "featuredTrailId" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guias_pkey" PRIMARY KEY ("cpf")
);

-- CreateTable
CREATE TABLE "trilhas" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "summary" TEXT,
    "durationMinutes" INTEGER NOT NULL,
    "difficulty" "TrailDifficulty" NOT NULL,
    "maxGroupSize" INTEGER NOT NULL,
    "badgeLabel" TEXT,
    "imageUrl" TEXT,
    "status" "TrailStatus" NOT NULL DEFAULT 'ACTIVE',
    "basePrice" DECIMAL(10,2),
    "highlight" BOOLEAN NOT NULL DEFAULT false,
    "meetingPoint" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trilhas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trilhas_guias" (
    "trailId" TEXT NOT NULL,
    "guideCpf" TEXT NOT NULL,
    "assigned" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trilhas_guias_pkey" PRIMARY KEY ("trailId","guideCpf")
);

-- CreateTable
CREATE TABLE "sessoes_trilhas" (
    "id" TEXT NOT NULL,
    "trailId" TEXT NOT NULL,
    "primaryGuideCpf" TEXT,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3),
    "capacity" INTEGER NOT NULL,
    "meetingPoint" TEXT,
    "notes" TEXT,
    "status" "TrailSessionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessoes_trilhas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agendamentos" (
    "id" TEXT NOT NULL,
    "protocol" TEXT NOT NULL,
    "trailId" TEXT NOT NULL,
    "sessionId" TEXT,
    "guideCpf" TEXT,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "participantsCount" INTEGER NOT NULL DEFAULT 1,
    "contactName" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "notes" TEXT,
    "source" "BookingSource" NOT NULL DEFAULT 'PUBLIC_PORTAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agendamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "participantes" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "cpf" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "birthDate" TIMESTAMP(3),
    "emergencyContact" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "participantes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eventos" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3),
    "capacity" INTEGER,
    "status" "EventStatus" NOT NULL DEFAULT 'DRAFT',
    "highlight" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "eventos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inscricoes_eventos" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "status" "EventRegistrationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inscricoes_eventos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registros_fauna_flora" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "scientificName" TEXT NOT NULL,
    "category" "FaunaFloraCategory" NOT NULL,
    "status" "ConservationStatus" NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "registros_fauna_flora_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registros_atividade" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT,
    "eventId" TEXT,
    "trailId" TEXT,
    "message" TEXT NOT NULL,
    "loggedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,

    CONSTRAINT "registros_atividade_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "convites_cpfConvidado_idx" ON "convites"("cpfConvidado");

-- CreateIndex
CREATE UNIQUE INDEX "guias_slug_key" ON "guias"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "trilhas_slug_key" ON "trilhas"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "agendamentos_protocol_key" ON "agendamentos"("protocol");

-- CreateIndex
CREATE INDEX "participantes_bookingId_idx" ON "participantes"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "eventos_slug_key" ON "eventos"("slug");

-- CreateIndex
CREATE INDEX "inscricoes_eventos_eventId_idx" ON "inscricoes_eventos"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "registros_fauna_flora_slug_key" ON "registros_fauna_flora"("slug");

-- CreateIndex
CREATE INDEX "registros_atividade_loggedAt_idx" ON "registros_atividade"("loggedAt");

-- AddForeignKey
ALTER TABLE "convites" ADD CONSTRAINT "convites_criadoPorCpf_fkey" FOREIGN KEY ("criadoPorCpf") REFERENCES "usuarios"("cpf") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guias" ADD CONSTRAINT "guias_cpf_fkey" FOREIGN KEY ("cpf") REFERENCES "usuarios"("cpf") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guias" ADD CONSTRAINT "guias_featuredTrailId_fkey" FOREIGN KEY ("featuredTrailId") REFERENCES "trilhas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trilhas_guias" ADD CONSTRAINT "trilhas_guias_trailId_fkey" FOREIGN KEY ("trailId") REFERENCES "trilhas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trilhas_guias" ADD CONSTRAINT "trilhas_guias_guideCpf_fkey" FOREIGN KEY ("guideCpf") REFERENCES "guias"("cpf") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessoes_trilhas" ADD CONSTRAINT "sessoes_trilhas_trailId_fkey" FOREIGN KEY ("trailId") REFERENCES "trilhas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessoes_trilhas" ADD CONSTRAINT "sessoes_trilhas_primaryGuideCpf_fkey" FOREIGN KEY ("primaryGuideCpf") REFERENCES "guias"("cpf") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agendamentos" ADD CONSTRAINT "agendamentos_trailId_fkey" FOREIGN KEY ("trailId") REFERENCES "trilhas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agendamentos" ADD CONSTRAINT "agendamentos_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "sessoes_trilhas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agendamentos" ADD CONSTRAINT "agendamentos_guideCpf_fkey" FOREIGN KEY ("guideCpf") REFERENCES "guias"("cpf") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participantes" ADD CONSTRAINT "participantes_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "agendamentos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscricoes_eventos" ADD CONSTRAINT "inscricoes_eventos_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "eventos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registros_atividade" ADD CONSTRAINT "registros_atividade_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "agendamentos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registros_atividade" ADD CONSTRAINT "registros_atividade_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "eventos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registros_atividade" ADD CONSTRAINT "registros_atividade_trailId_fkey" FOREIGN KEY ("trailId") REFERENCES "trilhas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
