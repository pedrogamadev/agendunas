import { fetchParticipantsTable } from './dashboard-service.js'

export async function listParticipants(request, response, next) {
  try {
    const limit = request.query.limit ? Number.parseInt(request.query.limit, 10) : 30
    const participants = await fetchParticipantsTable(Number.isNaN(limit) ? 30 : limit)
    response.json({ data: participants })
  } catch (error) {
    next(error)
  }
}
