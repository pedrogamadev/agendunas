import type { NextFunction, Request, Response } from 'express'
import prisma from '../../lib/prisma.js'

type FaunaFloraSummary = {
  id: string
  slug: string
  name: string
  scientificName: string | null
  category: string
  status: string | null
  description: string | null
  imageUrl: string | null
  tags: string[]
}

export async function getFaunaFlora(_request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const records = await prisma.faunaFloraRecord.findMany({
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    })

    type RecordItem = (typeof records)[number]

    const normalized: FaunaFloraSummary[] = records.map((record: RecordItem) => ({
      id: record.id,
      slug: record.slug,
      name: record.name,
      scientificName: record.scientificName,
      category: record.category,
      status: record.status,
      description: record.description,
      imageUrl: record.imageUrl,
      tags: record.tags,
    }))

    response.json({ data: normalized })
  } catch (error) {
    next(error)
  }
}
