import prisma from '../../lib/prisma.js'

export async function getFaunaFlora(request, response, next) {
  try {
    const records = await prisma.faunaFloraRecord.findMany({
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    })

    const normalized = records.map((record) => ({
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
