import type { NextFunction, Request, Response } from 'express'
import prisma from '../../lib/prisma.js'
import { normalizeTrail, trailInclude } from './trail-service.js'
import type { AdminTrailListResponse, AdminTrailStats } from './types.js'

export async function listTrails(
  _request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const [trailRecords, guideRecords] = await Promise.all([
      prisma.trail.findMany({
        orderBy: [
          { highlight: 'desc' },
          { name: 'asc' },
        ],
        include: trailInclude,
      }),
      prisma.guide.findMany({
        orderBy: { name: 'asc' },
        select: {
          id: true,
          slug: true,
          name: true,
          speciality: true,
          photoUrl: true,
          isActive: true,
          isFeatured: true,
        },
      }),
    ])

    const trails = trailRecords.map(normalizeTrail)

    const stats: AdminTrailStats = {
      total: trails.length,
      highlights: 0,
      averageCapacity: 0,
      upcomingSessions: 0,
      byStatus: {
        ACTIVE: 0,
        INACTIVE: 0,
        MAINTENANCE: 0,
      },
      byDifficulty: {
        EASY: 0,
        MODERATE: 0,
        HARD: 0,
      },
    }

    let totalCapacity = 0

    trails.forEach((trail) => {
      totalCapacity += trail.maxGroupSize
      stats.upcomingSessions += trail.upcomingSessions
      if (trail.highlight) {
        stats.highlights += 1
      }
      stats.byStatus[trail.status] += 1
      stats.byDifficulty[trail.difficulty] += 1
    })

    stats.averageCapacity = trails.length > 0 ? Math.round(totalCapacity / trails.length) : 0

    const guides: AdminTrailListResponse['guides'] = guideRecords.map((guide) => ({
      id: guide.id,
      slug: guide.slug,
      name: guide.name,
      speciality: guide.speciality ?? null,
      photoUrl: guide.photoUrl ?? null,
      isActive: guide.isActive,
      isFeatured: guide.isFeatured,
    }))

    const payload: AdminTrailListResponse = {
      trails,
      guides,
      stats,
    }

    response.json({ data: payload })
  } catch (error) {
    next(error)
  }
}
