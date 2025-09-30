import http from 'node:http'
import { parse } from 'node:url'

const guides = [
  {
    id: 'davi-brito',
    name: 'Davi Brito',
    speciality: 'Resiliência & Culinária Baiana',
    experienceYears: 5,
    rating: 4.9,
    trailsGuided: 420,
    certifications: ['Culinária Baiana Profissional', 'Atendimento ao Cliente'],
    languages: ['Português'],
    biography:
      'Autêntico soteropolitano que transforma desafios em histórias de superação servidas com os sabores da Bahia.',
  },
  {
    id: 'matheus-brasileiro',
    name: 'Matheus Brasileiro',
    speciality: 'Ervas naturais e músicas na trilha',
    experienceYears: 10,
    rating: 4.8,
    trailsGuided: 720,
    certifications: ['Fitoterapia Aplicada', 'Cultivo Sustentável'],
    languages: ['Português', 'Inglês'],
    biography:
      'Pesquisador dedicado às propriedades das plantas medicinais, conduz trilhas interpretativas com trilha sonora autoral.',
  },
  {
    id: 'carrara-luis',
    name: 'Carrara Luis',
    speciality: 'Logística Urbana & Otimização de Rotas',
    experienceYears: 20,
    rating: 5,
    trailsGuided: 1300,
    certifications: ['Condução Defensiva Avançada', 'Negociação Estratégica'],
    languages: ['Português'],
    biography:
      'Especialista em transformar o caos urbano em oportunidade, conduzindo tours cheios de histórias e atalhos improváveis.',
  },
]

const trailOptions = [
  {
    id: 'cachoeira',
    name: 'Trilha da Cachoeira',
    duration: '5h30',
    difficulty: 'Moderada',
    groupSize: 'Até 12 pessoas',
  },
  {
    id: 'mirante',
    name: 'Trilha do Mirante',
    duration: '4h',
    difficulty: 'Desafiadora',
    groupSize: 'Até 8 pessoas',
  },
  {
    id: 'ecologica',
    name: 'Trilha Ecológica',
    duration: '3h30',
    difficulty: 'Leve',
    groupSize: 'Até 15 pessoas',
  },
  {
    id: 'noturna',
    name: 'Trilha Noturna',
    duration: '2h',
    difficulty: 'Moderada',
    groupSize: 'Até 10 pessoas',
  },
]

const faunaFloraRecords = [
  {
    id: 'tucano-toco',
    name: 'Tucano-toco',
    scientificName: 'Ramphastos toco',
    category: 'fauna',
    status: 'Pouco Preocupante',
  },
  {
    id: 'mico-leao-dourado',
    name: 'Mico-leão-dourado',
    scientificName: 'Leontopithecus rosalia',
    category: 'fauna',
    status: 'Em perigo',
  },
  {
    id: 'bromelia-imperial',
    name: 'Bromélia Imperial',
    scientificName: 'Vriesea regina',
    category: 'flora',
    status: 'Protegida',
  },
  {
    id: 'orquidea-lua',
    name: 'Orquídea-da-lua',
    scientificName: 'Cattleya walkeriana',
    category: 'flora',
    status: 'Vulnerável',
  },
]

const sendJson = (response, statusCode, payload) => {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
  })
  response.end(JSON.stringify(payload))
}

const readBody = async (request) => {
  const chunks = []
  for await (const chunk of request) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }

  if (chunks.length === 0) {
    return ''
  }

  return Buffer.concat(chunks).toString('utf-8')
}

const server = http.createServer(async (request, response) => {
  if (!request.url) {
    response.writeHead(400)
    response.end()
    return
  }

  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (request.method === 'OPTIONS') {
    response.writeHead(204)
    response.end()
    return
  }

  const { pathname } = parse(request.url, true)

  if (request.method === 'GET' && pathname === '/api/guias') {
    sendJson(response, 200, { data: guides })
    return
  }

  if (request.method === 'GET' && pathname === '/api/trilhas') {
    sendJson(response, 200, { data: trailOptions })
    return
  }

  if (request.method === 'GET' && pathname === '/api/fauna-flora') {
    sendJson(response, 200, { data: faunaFloraRecords })
    return
  }

  if (request.method === 'POST' && pathname === '/api/agendamentos') {
    try {
      const body = await readBody(request)
      const parsed = body ? JSON.parse(body) : null

      if (!parsed || typeof parsed !== 'object') {
        sendJson(response, 400, { message: 'Corpo da requisição inválido.' })
        return
      }

      const timestamp = new Date().toISOString()
      sendJson(response, 201, {
        message: 'Solicitação de agendamento recebida com sucesso.',
        receivedAt: timestamp,
        payload: parsed,
      })
    } catch (error) {
      sendJson(response, 400, { message: 'Não foi possível interpretar os dados enviados.' })
    }
    return
  }

  sendJson(response, 404, { message: 'Rota não encontrada.' })
})

const PORT = Number.parseInt(process.env.PORT ?? '', 10) || 3001

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API AgenDunas disponível em http://localhost:${PORT}`)
})
