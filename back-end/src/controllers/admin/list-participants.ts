import type { NextFunction, Request, Response } from 'express'
import { fetchParticipantsTable } from './dashboard-service.js'

type ListParticipantsQuery = {
  limit?: string
}

export async function listParticipants(
  request: Request<unknown, unknown, unknown, ListParticipantsQuery>,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const limitParam = request.query.limit
    const parsedLimit = limitParam ? Number.parseInt(limitParam, 10) : 30
    const limit = Number.isNaN(parsedLimit) ? 30 : parsedLimit
    const participants = await fetchParticipantsTable(limit)
    response.json({ data: participants })
  } catch (error) {
    next(error)
  }
}
