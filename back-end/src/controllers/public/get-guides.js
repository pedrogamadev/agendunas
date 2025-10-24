import prisma from '../../lib/prisma.js'

export async function getGuides(request, response, next) {
  try {
    const guides = await prisma.guide.findMany({
      where: { isActive: true },
      include: {
        trails: {
          include: {
            trail: {
              select: {
                id: true,
                slug: true,
                name: true,
                difficulty: true,
                durationMinutes: true,
              },
            },
          },
        },
        featuredTrail: {
          select: {
            id: true,
            slug: true,
            name: true,
            durationMinutes: true,
          },
        },
      },
      orderBy: [
        { isFeatured: 'desc' },
        { rating: 'desc' },
        { name: 'asc' },
      ],
    })

    const normalized = guides.map((guide) => ({
      id: guide.id,
      slug: guide.slug,
      name: guide.name,
      speciality: guide.speciality,
      biography: guide.biography,
      summary: guide.summary,
      rating: guide.rating,
      experienceYears: guide.experienceYears,
      toursCompleted: guide.toursCompleted,
      languages: guide.languages,
      certifications: guide.certifications,
      curiosities: guide.curiosities,
      photoUrl: guide.photoUrl,
      featuredTrail: guide.featuredTrail
        ? {
            id: guide.featuredTrail.id,
            slug: guide.featuredTrail.slug,
            name: guide.featuredTrail.name,
            durationMinutes: guide.featuredTrail.durationMinutes,
          }
        : null,
      trails: guide.trails.map((assignment) => ({
        id: assignment.trail.id,
        slug: assignment.trail.slug,
        name: assignment.trail.name,
        difficulty: assignment.trail.difficulty,
        durationMinutes: assignment.trail.durationMinutes,
      })),
    }))

    response.json({ data: normalized })
  } catch (error) {
    next(error)
  }
}
