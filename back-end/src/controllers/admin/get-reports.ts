import type { NextFunction, Request, Response } from 'express'
import { fetchReportData } from './dashboard-service.js'

export async function getReports(_request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const data = await fetchReportData()
    response.json({ data })
  } catch (error) {
    next(error)
  }
}
