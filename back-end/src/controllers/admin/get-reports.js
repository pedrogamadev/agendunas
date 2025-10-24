import { fetchReportData } from './dashboard-service.js'

export async function getReports(request, response, next) {
  try {
    const data = await fetchReportData()
    response.json({ data })
  } catch (error) {
    next(error)
  }
}
