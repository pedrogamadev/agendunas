import http from 'node:http'
import { parse } from 'node:url'

const guides = [
  {
    id: 'joao-mendes',
    name: 'João Mendes',
    speciality: 'Fauna e Trilhas Técnicas',
    experienceYears: 12,
    rating: 4.9,
    trailsGuided: 850,
    certifications: ['Primeiros Socorros', 'Guia de Turismo', 'Condutor Ambiental'],
    languages: ['Português', 'Inglês', 'Espanhol'],
    biography:
      'Biólogo apaixonado pela mata atlântica, lidera expedições técnicas com foco em observação de fauna e conservação.',
  },
  {
    id: 'maria-fernanda',
    name: 'Maria Fernanda',
    speciality: 'Flora e Plantas Medicinais',
    experienceYears: 9,
    rating: 4.8,
    trailsGuided: 650,
    certifications: ['Educação Ambiental', 'Primeiros Socorros'],
    languages: ['Português', 'Francês'],
    biography:
      'Botânica que conduz trilhas interpretativas com foco em usos tradicionais da flora e práticas de preservação.',
  },
  {
    id: 'carlos-rodrigues',
    name: 'Carlos Rodrigues',
    speciality: 'Montanhismo e Histórias Locais',
    experienceYears: 15,
    rating: 5,
    trailsGuided: 1200,
    certifications: ['Resgate em Altura', 'Primeiros Socorros', 'Turismo de Aventura'],
    languages: ['Português', 'Inglês'],
    biography:
      'Condutor especializado em travessias longas e registros fotográficos da cultura local, com foco em segurança.',
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
