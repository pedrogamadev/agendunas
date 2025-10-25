import type { NextFunction, Request, Response } from 'express'
import prisma from '../../lib/prisma.js'
import { guideInclude, normalizeGuide } from './guide-service.js'

export async function listGuides(
  _request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const [guides, trails] = await Promise.all([
      prisma.guide.findMany({
        orderBy: [
          { isFeatured: 'desc' },
          { name: 'asc' },
        ],
        include: guideInclude,
      }),
      prisma.trail.findMany({
        orderBy: { name: 'asc' },
        select: { id: true, name: true, difficulty: true },
      }),
    ])

    response.json({
      data: {
        guides: guides.map(normalizeGuide),
        trails,
      },
    })
  } catch (error) {
    next(error)
  }
}
