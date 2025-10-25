import type { NextFunction, Request, Response } from 'express'
import { fetchTrailCards } from './dashboard-service.js'

export async function listTrails(_request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const trails = await fetchTrailCards(12)
    response.json({ data: trails })
  } catch (error) {
    next(error)
  }
}
