# Documentação da API AgenDunas

## Base URL

- **Desenvolvimento**: `http://localhost:3001/api`
- **Produção**: configurado via `VITE_API_BASE_URL` no front-end

> Os exemplos abaixo utilizam o prefixo `/api`. Endpoints administrativos requerem token JWT de usuário com perfil **A** (administrador) ou **C** (colaborador autorizado).

## Autenticação

A maioria das rotas requer autenticação via JWT. Inclua o token no header:

```
Authorization: Bearer <token>
```

## Endpoints Públicos

### GET /api/trails

Lista todas as trilhas ativas com resumo, guias em destaque e sessões futuras.

**Resposta (200):**
```json
{
  "data": [
    {
      "id": "string",
      "name": "string",
      "slug": "string",
      "description": "string",
      "durationMinutes": 120,
      "difficulty": "EASY" | "MODERATE" | "HARD",
      "maxGroupSize": 10,
      "badgeLabel": "Destaque" | null,
      "imageUrl": "string | null",
      "status": "ACTIVE" | "INACTIVE" | "MAINTENANCE",
      "guides": [
        { "cpf": "string", "name": "string", "isFeatured": true }
      ],
      "nextSessions": [
        {
          "id": "string",
          "startsAt": "2024-01-01T10:00:00Z",
          "capacity": 10,
          "availableSlots": 5,
          "primaryGuideCpf": "string | null"
        }
      ]
    }
  ]
}
```

### GET /api/guides

Lista todos os guias públicos e ativos.

**Resposta:**
```json
{
  "data": [
    {
      "cpf": "string",
      "name": "string",
      "slug": "string",
      "speciality": "string | null",
      "photoUrl": "string | null",
      "contactPhone": "string",
      "isActive": true,
      "isFeatured": false
    }
  ]
}
```

### GET /api/fauna-flora

Lista registros de fauna e flora para consulta pública.

**Resposta:**
```json
{
  "data": [
    {
      "id": "string",
      "name": "string",
      "scientificName": "string",
      "category": "FAUNA" | "FLORA",
      "description": "string",
      "imageUrl": "string | null",
      "conservationStatus": "LEAST_CONCERN" | "VULNERABLE" | "ENDANGERED" | ...
    }
  ]
}
```

### GET /api/sessions/:trailId/availability

Verifica disponibilidade de sessões confirmadas para uma trilha específica.

**Parâmetros:**
- `trailId` (path): ID da trilha

**Query Parameters:**
- `startDate` (opcional): Data inicial (ISO 8601)
- `endDate` (opcional): Data final (ISO 8601)

**Resposta:**
```json
{
  "data": {
    "trailId": "string",
    "sessions": [
      {
        "id": "string",
        "startsAt": "2024-01-01T10:00:00Z",
        "capacity": 10,
        "availableSlots": 5,
        "contactPhone": "string"
      }
    ]
  }
}
```

### POST /api/bookings

Cria uma nova solicitação de agendamento (pública ou via painel) validando capacidade da trilha/sessão.

**Body:**
```json
{
  "trailId": "string",
  "sessionId": "string | null",
  "guideCpf": "string | null",
  "scheduledDate": "2024-01-01",
  "scheduledTime": "08:00",
  "contactName": "string",
  "contactEmail": "string",
  "contactPhone": "string",
  "participantsCount": 2,
  "participants": [
    { "fullName": "string", "cpf": "string", "email": "string", "phone": "string" }
  ],
  "notes": "string | null",
  "source": "PUBLIC_PORTAL" | "ADMIN"
}
```

**Resposta (201):**
```json
{
  "data": {
    "id": "string",
    "protocol": "ACD-202401-0001",
    "status": "PENDING",
    "scheduledFor": "2024-01-01T10:00:00Z",
    "scheduledForLabel": "01/01/2024 10:00",
    "trailName": "Trilha Principal",
    "guideName": "Nome do Guia | null"
  },
  "message": "Solicitação de agendamento registrada com sucesso. Entraremos em contato para confirmação."
}
```

## Endpoints de Autenticação

### POST /api/auth/login

Login de administrador.

**Body:**
```json
{
  "cpf": "12345678901",
  "senha": "senha123"
}
```

**Resposta:**
```json
{
  "token": "jwt-token",
  "usuario": {
    "cpf": "string",
    "nome": "string",
    "tipo": "A" | "C" | "G"
  }
}
```

### POST /api/auth/register

Registro de novo usuário (requer convite).

**Body:**
```json
{
  "cpf": "12345678901",
  "nome": "string",
  "sobrenome": "string",
  "email": "string",
  "senha": "string",
  "token": "convite-token"
}
```

### POST /api/auth/customer/login

Login de cliente.

**Body:**
```json
{
  "cpf": "12345678901",
  "senha": "senha123"
}
```

### POST /api/auth/customer/register

Registro de novo cliente.

**Body:**
```json
{
  "cpf": "12345678901",
  "nome": "string",
  "sobrenome": "string",
  "email": "string",
  "senha": "string",
  "dataNascimento": "2000-01-01",
  "cidadeOrigem": "string"
}
```

### GET /api/auth/me

Obtém informações do usuário autenticado.

**Headers:**
```
Authorization: Bearer <token>
```

**Resposta:**
```json
{
  "usuario": {
    "cpf": "string",
    "nome": "string",
    "tipo": "A" | "C" | "G"
  }
}
```

## Endpoints Administrativos

Todos os endpoints administrativos requerem autenticação via `Authorization: Bearer <token>` e perfil autorizado.

### Dashboard e Relatórios
- **GET /api/admin/overview**: métricas consolidadas de agendamentos, destaques e logs recentes.
- **GET /api/admin/calendar**: agenda mensal com sessões e eventos do parque.
- **GET /api/admin/reports**: indicadores agregados usados nos gráficos de relatórios.

### Agendamentos
- **GET /api/admin/bookings**: lista paginada de agendamentos com filtros de status/data.
- **GET /api/admin/bookings/:id**: detalhe do agendamento (participantes, contatos, sessão, guia).
- **PATCH /api/admin/bookings/:id/status**: atualiza status (`CONFIRMED`, `CANCELLED`, `COMPLETED`, `RESCHEDULED`) registrando log.

### Participantes
- **GET /api/admin/participants**: lista participantes recentes, incluindo indicador de banimento e agendamento associado.
- **GET /api/admin/participants/:id**: detalhe de contato e histórico do participante.
- **PATCH /api/admin/participants/:id**: atualiza banimento ou dados de contato.

### Trilhas e Sessões
- **GET /api/admin/trails**: lista trilhas com guias atribuídos, sessões, status e indicadores de destaque.
- **POST /api/admin/trails**: cria trilha (nome, slug, descrição, dificuldade, capacidade, preço base, destaque, ponto de encontro).
- **PUT /api/admin/trails/:id**: atualiza trilha existente.
- **DELETE /api/admin/trails/:id**: remove trilha e vinculações associadas.
- **GET /api/admin/trails/:trailId/sessions**: lista sessões de uma trilha.
- **POST /api/admin/trails/:trailId/sessions**: cria sessão com capacidade, horário e guia primário.
- **PATCH /api/admin/sessions/:id**: atualiza sessão (status, horário, guia, capacidade, telefone de contato, notas).
- **DELETE /api/admin/sessions/:id**: remove sessão.
- **GET /api/admin/sessions/:id/participants**: lista participantes confirmados por sessão.

### Guias
- **GET /api/admin/guides**: lista guias com detalhes completos.
- **POST /api/admin/guides**: cadastra guia vinculando a um usuário existente.
- **PUT /api/admin/guides/:cpf**: atualiza dados, idiomas, certificações, trilha em destaque e status de atividade.
- **DELETE /api/admin/guides/:cpf**: remove guia e vínculos.
- **POST /api/admin/convites**: gera token de convite para novos usuários administrativos.

### Eventos do Parque
- **GET /api/admin/events**: lista eventos cadastrados com filtros de status/destaque.
- **POST /api/admin/events**: cria evento com título, slug, período, capacidade e status (`DRAFT`, `PUBLISHED`, etc.).

## Códigos de Status HTTP

- `200` - Sucesso
- `201` - Criado com sucesso
- `400` - Dados inválidos
- `401` - Não autenticado
- `403` - Não autorizado
- `404` - Não encontrado
- `409` - Conflito (ex: capacidade excedida)
- `429` - Muitas requisições (rate limit)
- `500` - Erro interno do servidor
- `503` - Serviço indisponível

## Rate Limiting

A API implementa rate limiting:

- **Geral**: 100 requisições por 15 minutos
- **Autenticação**: 5 requisições por 15 minutos

Headers de resposta incluem:
- `X-RateLimit-Limit`: Limite total
- `X-RateLimit-Remaining`: Requisições restantes
- `X-RateLimit-Reset`: Timestamp de reset

## Tratamento de Erros

Erros são retornados no formato:

```json
{
  "message": "Mensagem de erro amigável",
  "issues": [
    {
      "path": "campo.nome",
      "message": "Erro específico do campo"
    }
  ]
}
```

## Health Check

### GET /health

Verifica saúde da API e conexão com banco de dados.

**Resposta:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T10:00:00Z",
  "uptime": 3600,
  "database": "connected",
  "memory": {
    "used": 45.2,
    "total": 128.0
  }
}
```

