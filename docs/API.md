# Documentação da API AgenDunas

## Base URL

- Desenvolvimento: `http://localhost:3001/api`
- Produção: Configurado via `VITE_API_BASE_URL`

## Autenticação

A maioria das rotas requer autenticação via JWT. Inclua o token no header:

```
Authorization: Bearer <token>
```

## Endpoints Públicos

### GET /api/trails

Lista todas as trilhas disponíveis.

**Resposta:**
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
      "imageUrl": "string | null",
      "status": "ACTIVE" | "INACTIVE" | "MAINTENANCE"
    }
  ]
}
```

### GET /api/guides

Lista todos os guias cadastrados.

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

Lista espécies de fauna e flora.

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

Verifica disponibilidade de sessões para uma trilha.

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

Cria uma nova reserva.

**Body:**
```json
{
  "trailId": "string",
  "sessionId": "string | null",
  "guideCpf": "string | null",
  "scheduledDate": "2024-01-01",
  "contactName": "string",
  "contactEmail": "string",
  "contactPhone": "string",
  "participantsCount": 2,
  "notes": "string | null",
  "source": "PUBLIC_PORTAL"
}
```

**Resposta (201):**
```json
{
  "data": {
    "id": "string",
    "protocol": "ACD-0001",
    "status": "CONFIRMED",
    "scheduledFor": "2024-01-01T10:00:00Z"
  },
  "message": "Reserva criada com sucesso."
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

Todos os endpoints administrativos requerem autenticação de administrador.

### GET /api/admin/overview

Visão geral do dashboard administrativo.

### GET /api/admin/trails

Lista todas as trilhas (admin).

### POST /api/admin/trails

Cria uma nova trilha.

### PUT /api/admin/trails/:id

Atualiza uma trilha.

### DELETE /api/admin/trails/:id

Remove uma trilha.

### GET /api/admin/bookings

Lista todas as reservas.

### GET /api/admin/bookings/:id

Obtém detalhes de uma reserva.

### PUT /api/admin/bookings/:id/status

Atualiza status de uma reserva.

**Body:**
```json
{
  "status": "CONFIRMED" | "CANCELLED" | "COMPLETED" | "RESCHEDULED"
}
```

### GET /api/admin/guides

Lista todos os guias (admin).

### POST /api/admin/guides

Cria um novo guia.

### PUT /api/admin/guides/:cpf

Atualiza um guia.

### DELETE /api/admin/guides/:cpf

Remove um guia.

### GET /api/admin/sessions

Lista todas as sessões.

### POST /api/admin/sessions

Cria uma nova sessão.

### PUT /api/admin/sessions/:id

Atualiza uma sessão.

### DELETE /api/admin/sessions/:id

Remove uma sessão.

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

