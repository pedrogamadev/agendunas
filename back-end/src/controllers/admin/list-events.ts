import type { NextFunction, Request, Response } from 'express'
import { fetchEventCards, fetchUpcomingEvents } from './dashboard-service.js'

export async function listEvents(_request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const [events, highlights] = await Promise.all([fetchEventCards(12), fetchUpcomingEvents(8)])

    response.json({
      data: {
        cards: events,
        upcoming: highlights,
      },
    })
  } catch (error) {
    next(error)
  }
}
