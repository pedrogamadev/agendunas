import { fetchCalendarOverview } from './dashboard-service.js'

export async function getCalendar(request, response, next) {
  try {
    const calendar = await fetchCalendarOverview()
    response.json({ data: calendar })
  } catch (error) {
    next(error)
  }
}
