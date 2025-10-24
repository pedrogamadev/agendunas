import { fetchTrailCards } from './dashboard-service.js'

export async function listTrails(request, response, next) {
  try {
    const trails = await fetchTrailCards(12)
    response.json({ data: trails })
  } catch (error) {
    next(error)
  }
}
