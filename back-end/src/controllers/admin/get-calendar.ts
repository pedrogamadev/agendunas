import type { NextFunction, Request, Response } from 'express'
import { fetchCalendarOverview } from './dashboard-service.js'

export async function getCalendar(_request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const calendar = await fetchCalendarOverview()
    response.json({ data: calendar })
  } catch (error) {
    next(error)
  }
}
