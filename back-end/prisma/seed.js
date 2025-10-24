import { PrismaClient, BookingSource, BookingStatus, ConservationStatus, EventStatus, FaunaFloraCategory, TrailDifficulty } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.activityLog.deleteMany()
  await prisma.eventRegistration.deleteMany()
  await prisma.participant.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.trailSession.deleteMany()
  await prisma.trailGuide.deleteMany()
  await prisma.guide.deleteMany()
  await prisma.trail.deleteMany()
  await prisma.faunaFloraRecord.deleteMany()
  await prisma.event.deleteMany()

  const trails = await Promise.all([
    prisma.trail.create({
      data: {
        slug: 'trilha-perobinha',
        name: 'Trilha Perobinha',
        description:
          'Percurso sombreado que atravessa áreas de restinga com observação guiada da flora nativa e paradas estratégicas para interpretação ambiental.',
        summary: 'Trilha clássica do parque com ênfase na flora local.',
        durationMinutes: 150,
        difficulty: TrailDifficulty.MODERATE,
        maxGroupSize: 60,
        badgeLabel: 'Clássica',
        imageUrl:
          'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80',
        highlight: true,
        meetingPoint: 'Centro de Visitantes',
      },
    }),
    prisma.trail.create({
      data: {
        slug: 'trilha-ubaudoce',
        name: 'Trilha Ubaú-doce',
        description:
          'Caminhada com trechos abertos e mirantes naturais para observação das dunas, incluindo oficinas rápidas de educação ambiental.',
        summary: 'Ideal para grupos escolares e eventos educativos.',
        durationMinutes: 180,
        difficulty: TrailDifficulty.MODERATE,
        maxGroupSize: 60,
        badgeLabel: 'Educativa',
        imageUrl:
          'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80',
        meetingPoint: 'Pórtico Principal',
      },
    }),
    prisma.trail.create({
      data: {
        slug: 'trilha-aroeira',
        name: 'Trilha do Aroeira',
        description:
          'Percurso em área de maior inclinação, com foco em interpretação de espécies endêmicas e observação de fauna discreta.',
        summary: 'Trilha desafiadora com vistas panorâmicas.',
        durationMinutes: 210,
        difficulty: TrailDifficulty.HARD,
        maxGroupSize: 55,
        badgeLabel: 'Desafio',
        imageUrl:
          'https://images.unsplash.com/photo-1476610182048-b716b8518aae?auto=format&fit=crop&w=1200&q=80',
        meetingPoint: 'Centro de Visitantes',
      },
    }),
    prisma.trail.create({
      data: {
        slug: 'trilha-foz-do-sol',
        name: 'Trilha Foz do Sol',
        description:
          'Expedição ao pôr do sol com observação de aves migratórias e interpretação da geologia das dunas.',
        summary: 'Trilha vespertina com foco em fauna alada.',
        durationMinutes: 120,
        difficulty: TrailDifficulty.EASY,
        maxGroupSize: 30,
        badgeLabel: 'Pôr do sol',
        imageUrl:
          'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
        meetingPoint: 'Mirante das Dunas',
      },
    }),
  ])

  const [perobinha, ubaudoce, aroeira, fozDoSol] = trails

  const guides = await Promise.all([
    prisma.guide.create({
      data: {
        slug: 'davi-brito',
        name: 'Davi Brito',
        speciality: 'Resiliência & Culinária Baiana',
        biography:
          'Autêntico soteropolitano que transforma desafios em histórias de superação servidas com os sabores da Bahia.',
        summary:
          'Conecta trilhas com experiências gastronômicas sustentáveis, engajando comunidades locais.',
        experienceYears: 5,
        rating: 4.9,
        toursCompleted: 420,
        languages: ['Português'],
        certifications: ['Culinária Baiana Profissional', 'Atendimento ao Cliente'],
        curiosities: ['Cria receitas inspiradas nas plantas do parque', 'Organiza rodas de samba pós-trilha'],
        featuredTrailId: perobinha.id,
        photoUrl:
          'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
        isFeatured: true,
      },
    }),
    prisma.guide.create({
      data: {
        slug: 'matheus-brasileiro',
        name: 'Matheus Brasileiro',
        speciality: 'Ervas naturais e músicas na trilha',
        biography:
          'Pesquisador dedicado às propriedades das plantas medicinais, conduz trilhas interpretativas com trilha sonora autoral.',
        summary: 'Une fitoterapia e música para experiências multissensoriais.',
        experienceYears: 10,
        rating: 4.8,
        toursCompleted: 720,
        languages: ['Português', 'Inglês'],
        certifications: ['Fitoterapia Aplicada', 'Cultivo Sustentável'],
        curiosities: ['Compõe canções exclusivas para cada trilha', 'Mantém um herbário vivo no parque'],
        featuredTrailId: ubaudoce.id,
        photoUrl:
          'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=800&q=80',
      },
    }),
    prisma.guide.create({
      data: {
        slug: 'carrara-luis',
        name: 'Carrara Luis',
        speciality: 'Logística Urbana & Otimização de Rotas',
        biography:
          'Especialista em transformar o caos urbano em oportunidade, conduzindo tours cheios de histórias e atalhos improváveis.',
        summary: 'Responsável por operações especiais e grupos corporativos.',
        experienceYears: 20,
        rating: 5,
        toursCompleted: 1300,
        languages: ['Português'],
        certifications: ['Condução Defensiva Avançada', 'Negociação Estratégica'],
        curiosities: ['Já guiou mais de 1.300 expedições', 'Conhece todas as linhas de ônibus que atendem o parque'],
        featuredTrailId: aroeira.id,
        photoUrl:
          'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=800&q=80',
      },
    }),
  ])

  const [davi, matheus, carrara] = guides

  await prisma.trailGuide.createMany({
    data: [
      { trailId: perobinha.id, guideId: davi.id },
      { trailId: perobinha.id, guideId: matheus.id },
      { trailId: ubaudoce.id, guideId: matheus.id },
      { trailId: aroeira.id, guideId: carrara.id },
      { trailId: fozDoSol.id, guideId: davi.id },
    ],
  })

  const upcomingBase = new Date()
  upcomingBase.setUTCHours(12, 0, 0, 0)

  const sessions = await Promise.all([
    prisma.trailSession.create({
      data: {
        trailId: perobinha.id,
        primaryGuideId: davi.id,
        startsAt: new Date(upcomingBase.getTime() + 24 * 60 * 60 * 1000),
        endsAt: new Date(upcomingBase.getTime() + (24 * 60 + 150) * 60 * 1000),
        capacity: 60,
        meetingPoint: 'Centro de Visitantes',
        notes: 'Priorizar visitantes cadastrados no programa educação ambiental.',
      },
    }),
    prisma.trailSession.create({
      data: {
        trailId: ubaudoce.id,
        primaryGuideId: matheus.id,
        startsAt: new Date(upcomingBase.getTime() + 24 * 60 * 60 * 1000 + 90 * 60 * 1000),
        endsAt: new Date(upcomingBase.getTime() + (24 * 60 + 180) * 60 * 1000),
        capacity: 60,
        meetingPoint: 'Pórtico Principal',
      },
    }),
    prisma.trailSession.create({
      data: {
        trailId: aroeira.id,
        primaryGuideId: carrara.id,
        startsAt: new Date(upcomingBase.getTime() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
        endsAt: new Date(upcomingBase.getTime() + (2 * 24 * 60 + 210) * 60 * 1000),
        capacity: 55,
        meetingPoint: 'Centro de Visitantes',
      },
    }),
    prisma.trailSession.create({
      data: {
        trailId: fozDoSol.id,
        primaryGuideId: davi.id,
        startsAt: new Date(upcomingBase.getTime() + 3 * 24 * 60 * 60 * 1000 + 17 * 60 * 60 * 1000),
        endsAt: new Date(upcomingBase.getTime() + (3 * 24 * 60 + 120) * 60 * 1000),
        capacity: 30,
        meetingPoint: 'Mirante das Dunas',
      },
    }),
  ])

  const [sessionPerobinha, sessionUbaudoce, sessionAroeira, sessionFoz] = sessions

  const bookings = await Promise.all([
    prisma.booking.create({
      data: {
        protocol: 'ACD-2025-0001',
        trailId: perobinha.id,
        sessionId: sessionPerobinha.id,
        guideId: davi.id,
        status: BookingStatus.CONFIRMED,
        scheduledFor: sessionPerobinha.startsAt,
        participantsCount: 45,
        contactName: 'Maria Silva',
        contactEmail: 'maria.silva@email.com',
        contactPhone: '+55 84 99875-5420',
        notes: 'Grupo escolar – incluir atividade de coleta seletiva.',
        source: BookingSource.PUBLIC_PORTAL,
        participants: {
          create: [
            { fullName: 'Maria Silva', email: 'maria.silva@email.com', phone: '+55 84 99875-5420' },
            { fullName: 'João Lima', email: 'joao.lima@email.com' },
          ],
        },
      },
      include: { participants: true },
    }),
    prisma.booking.create({
      data: {
        protocol: 'ACD-2025-0002',
        trailId: ubaudoce.id,
        sessionId: sessionUbaudoce.id,
        guideId: matheus.id,
        status: BookingStatus.PENDING,
        scheduledFor: sessionUbaudoce.startsAt,
        participantsCount: 33,
        contactName: 'João Oliveira',
        contactEmail: 'joao.oliveira@email.com',
        contactPhone: '+55 84 98764-4431',
        notes: 'Confirmar disponibilidade de tradutor em Libras.',
        source: BookingSource.PUBLIC_PORTAL,
      },
    }),
    prisma.booking.create({
      data: {
        protocol: 'ACD-2025-0003',
        trailId: aroeira.id,
        sessionId: sessionAroeira.id,
        guideId: carrara.id,
        status: BookingStatus.RESCHEDULED,
        scheduledFor: sessionAroeira.startsAt,
        participantsCount: 28,
        contactName: 'Fernando Costa',
        contactEmail: 'fernando.costa@email.com',
        contactPhone: '+55 84 90905-5210',
        source: BookingSource.PUBLIC_PORTAL,
      },
    }),
    prisma.booking.create({
      data: {
        protocol: 'ACD-2025-0004',
        trailId: ubaudoce.id,
        sessionId: sessionUbaudoce.id,
        guideId: matheus.id,
        status: BookingStatus.CANCELLED,
        scheduledFor: sessionUbaudoce.startsAt,
        participantsCount: 18,
        contactName: 'Luciana Alves',
        contactEmail: 'luciana.alves@email.com',
        contactPhone: '+55 84 95432-1234',
        notes: 'Cancelado por motivo de logística do grupo.',
        source: BookingSource.PUBLIC_PORTAL,
      },
    }),
  ])

  await prisma.participant.createMany({
    data: [
      {
        bookingId: bookings[0].id,
        fullName: 'Ana Paula Santos',
        phone: '+55 84 99876-4431',
        email: 'ana.santos@email.com',
      },
      {
        bookingId: bookings[1].id,
        fullName: 'Paulo Henrique',
        phone: '+55 84 98765-3321',
        email: 'paulo.henrique@email.com',
      },
      {
        bookingId: bookings[2].id,
        fullName: 'Fernanda Costa',
        phone: '+55 84 90905-5521',
        email: 'fernanda.costa@email.com',
      },
    ],
  })

  const events = await Promise.all([
    prisma.event.create({
      data: {
        slug: 'mutirao-educacao-ambiental',
        title: 'Mutirão de Educação Ambiental',
        description: 'Atividade educativa com trilha sonora de músicos locais.',
        location: 'Anfiteatro das Dunas',
        startsAt: new Date(upcomingBase.getTime() + 2 * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000),
        endsAt: new Date(upcomingBase.getTime() + 2 * 24 * 60 * 60 * 1000 + 12 * 60 * 60 * 1000),
        capacity: 30,
        status: EventStatus.PUBLISHED,
        highlight: true,
      },
    }),
    prisma.event.create({
      data: {
        slug: 'festival-trilhas-parque',
        title: 'Festival de Trilhas do Parque',
        description: 'Passeios guiados especiais com guias convidados.',
        location: 'Centro de Visitantes',
        startsAt: new Date(upcomingBase.getTime() + 3 * 24 * 60 * 60 * 1000 + 16 * 60 * 60 * 1000),
        endsAt: new Date(upcomingBase.getTime() + 3 * 24 * 60 * 60 * 1000 + 20 * 60 * 60 * 1000),
        capacity: 50,
        status: EventStatus.PUBLISHED,
      },
    }),
    prisma.event.create({
      data: {
        slug: 'trilha-foz-do-sol-observacao-aves',
        title: 'Trilha para Foz do Sol',
        description: 'Expedição ao pôr do sol com observação de aves migratórias.',
        location: 'Mirante das Dunas',
        startsAt: new Date(upcomingBase.getTime() + 4 * 24 * 60 * 60 * 1000 + 17 * 60 * 60 * 1000),
        endsAt: new Date(upcomingBase.getTime() + 4 * 24 * 60 * 60 * 1000 + 19 * 60 * 60 * 1000),
        capacity: 25,
        status: EventStatus.DRAFT,
      },
    }),
  ])

  await prisma.activityLog.createMany({
    data: [
      {
        bookingId: bookings[0].id,
        message: 'Agendamento confirmado e comunicado ao visitante.',
        loggedAt: new Date(upcomingBase.getTime() - 2 * 60 * 60 * 1000),
      },
      {
        bookingId: bookings[2].id,
        message: 'Agendamento remarcado para data alternativa.',
        loggedAt: new Date(upcomingBase.getTime() - 5 * 60 * 60 * 1000),
      },
      {
        trailId: perobinha.id,
        message: 'Check-in realizado na Trilha Perobinha.',
        loggedAt: new Date(upcomingBase.getTime() - 20 * 60 * 60 * 1000),
      },
      {
        eventId: events[0].id,
        message: 'Novo evento publicado: Observação de Aves.',
        loggedAt: new Date(upcomingBase.getTime() - 36 * 60 * 60 * 1000),
      },
    ],
  })

  await prisma.faunaFloraRecord.createMany({
    data: [
      {
        slug: 'tucano-toco',
        name: 'Tucano-toco',
        scientificName: 'Ramphastos toco',
        category: FaunaFloraCategory.FAUNA,
        status: ConservationStatus.LEAST_CONCERN,
        description: 'Ave símbolo das florestas tropicais brasileiras, conhecida pelo bico marcante e colorido.',
        imageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80',
        tags: ['ave', 'frugívoro'],
      },
      {
        slug: 'mico-leao-dourado',
        name: 'Mico-leão-dourado',
        scientificName: 'Leontopithecus rosalia',
        category: FaunaFloraCategory.FAUNA,
        status: ConservationStatus.ENDANGERED,
        description: 'Primata endêmico da Mata Atlântica, símbolo de conservação no Brasil.',
        imageUrl: 'https://images.unsplash.com/photo-1618826411640-d6df44dd4402?auto=format&fit=crop&w=1200&q=80',
        tags: ['mamífero', 'endêmico'],
      },
      {
        slug: 'bromelia-imperial',
        name: 'Bromélia Imperial',
        scientificName: 'Vriesea regina',
        category: FaunaFloraCategory.FLORA,
        status: ConservationStatus.NEAR_THREATENED,
        description: 'Espécie ornamental de grande porte encontrada nas áreas de restinga.',
        imageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80',
        tags: ['endêmica', 'ornamental'],
      },
      {
        slug: 'orquidea-da-lua',
        name: 'Orquídea-da-lua',
        scientificName: 'Cattleya walkeriana',
        category: FaunaFloraCategory.FLORA,
        status: ConservationStatus.VULNERABLE,
        description: 'Orquídea perfumada que floresce durante o verão nas dunas úmidas.',
        imageUrl: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=1200&q=80',
        tags: ['orquídea', 'polinização noturna'],
      },
    ],
  })

  await prisma.eventRegistration.createMany({
    data: [
      {
        eventId: events[0].id,
        fullName: 'Rosa Mendes',
        email: 'rosa.mendes@email.com',
        phone: '+55 84 99888-7766',
      },
      {
        eventId: events[1].id,
        fullName: 'Carlos Albuquerque',
        email: 'carlos.albuquerque@email.com',
        phone: '+55 84 97766-5544',
      },
    ],
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error('Seed failed', error)
    await prisma.$disconnect()
    process.exit(1)
  })
