import { fetchBookingsTable } from './dashboard-service.js'

export async function listBookings(request, response, next) {
  try {
    const limit = request.query.limit ? Number.parseInt(request.query.limit, 10) : 20
    const bookings = await fetchBookingsTable(Number.isNaN(limit) ? 20 : limit)
    response.json({ data: bookings })
  } catch (error) {
    next(error)
  }
}
