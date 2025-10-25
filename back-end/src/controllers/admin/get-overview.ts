import type { NextFunction, Request, Response } from 'express'
import { buildOverviewPayload } from './dashboard-service.js'

export async function getOverview(_request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const payload = await buildOverviewPayload()
    response.json({ data: payload })
  } catch (error) {
    next(error)
  }
}
