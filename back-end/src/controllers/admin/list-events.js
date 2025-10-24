import { fetchEventCards, fetchUpcomingEvents } from './dashboard-service.js'

export async function listEvents(request, response, next) {
  try {
    const [events, highlights] = await Promise.all([
      fetchEventCards(12),
      fetchUpcomingEvents(8),
    ])

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
