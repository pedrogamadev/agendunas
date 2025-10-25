import type { NextFunction, Request, Response } from 'express'
import { fetchBookingsTable } from './dashboard-service.js'

type ListBookingsQuery = {
  limit?: string
}

export async function listBookings(
  request: Request<unknown, unknown, unknown, ListBookingsQuery>,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const limitParam = request.query.limit
    const parsedLimit = limitParam ? Number.parseInt(limitParam, 10) : 20
    const limit = Number.isNaN(parsedLimit) ? 20 : parsedLimit
    const bookings = await fetchBookingsTable(limit)
    response.json({ data: bookings })
  } catch (error) {
    next(error)
  }
}
