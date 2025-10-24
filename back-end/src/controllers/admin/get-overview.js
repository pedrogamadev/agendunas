import { buildOverviewPayload } from './dashboard-service.js'

export async function getOverview(request, response, next) {
  try {
    const payload = await buildOverviewPayload()
    response.json({ data: payload })
  } catch (error) {
    next(error)
  }
}
