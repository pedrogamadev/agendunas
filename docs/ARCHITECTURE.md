# Arquitetura do Sistema AgenDunas

## Visão Geral

O AgenDunas é uma aplicação full-stack dividida em front-end (React + Vite) e back-end (Node.js/Express), com comunicação via API REST. O banco de dados PostgreSQL é acessado via Prisma e possui schema fortemente tipado para agendamentos, sessões, trilhas, eventos e registros de fauna/flora.

## Arquitetura de Alto Nível

```
┌─────────────────┐
│   Front-end     │
│   (React/Vite)  │
└────────┬────────┘
         │ HTTP/REST
         │
┌────────▼────────┐
│   Back-end      │
│  (Express API)  │
└────────┬────────┘
         │ Prisma Client
┌────────▼────────┐
│ PostgreSQL      │
│ (schema público)│
└──────────────────┘
```

## Back-end

### Estrutura

```
back-end/
├── src/
│   ├── app.ts              # Configuração do Express
│   ├── server.ts           # Inicialização do servidor
│   ├── controllers/        # Lógica de negócio
│   │   ├── admin/          # Controllers administrativos
│   │   ├── auth/           # Autenticação
│   │   ├── customer/       # Área do cliente
│   │   └── public/         # Endpoints públicos
│   ├── middlewares/        # Middlewares
│   │   ├── authenticate.ts
│   │   ├── authorize-admin.ts
│   │   ├── error-handler.ts
│   │   ├── rate-limit.ts
│   │   └── not-found-handler.ts
│   ├── routes/             # Definição de rotas (públicas, auth, admin)
│   ├── controllers/        # Orquestram validação, regras e persistência
│   ├── lib/                # Bibliotecas/configurações
│   │   ├── prisma.ts       # Cliente Prisma
│   │   ├── logger.ts       # Logger estruturado
│   │   └── token.ts        # JWT
│   └── utils/              # Utilitários e formatadores
└── prisma/
    ├── schema.prisma       # Schema do banco
    └── migrations/         # Migrations
```

### Fluxo de Requisição

1. **Request** → Express
2. **Middlewares globais**: Helmet, compression, CORS, parsers com limite de payload, logging (Morgan + Pino), rate limiting.
3. **Autenticação/Autorização**: endpoints administrativos passam por `authenticate` (JWT) e `authorizeAdmin`.
4. **Controllers**: validação com Zod, transações Prisma (ex.: criação de agendamento, criação de sessões), geração de protocolos.
5. **Resposta**: payload padronizado com `data` e `message`; erros tratados pelo `errorHandler` com logs estruturados.

### Segurança

- **Helmet**: headers de segurança HTTP e CSP flexível para o portal.
- **Rate Limiting**: regras gerais e específicas de autenticação.
- **CORS**: lista de origens configurável por ambiente.
- **JWT**: autenticação stateless para painel administrativo e cliente.
- **Validação**: Zod em todas as entradas sensíveis (auth, reservas, criação de sessões, guias, eventos).
- **Auditoria**: registros de atividade (`ActivityLog`) para eventos críticos.

### Logging

Sistema de logging estruturado com Pino:
- Níveis: debug, info, warn, error
- Formato JSON em produção; pretty print em desenvolvimento
- Integração com Morgan para logs HTTP

## Front-end

### Estrutura

```
front-end/
├── src/
│   ├── api/                # Cliente HTTP
│   │   ├── client.ts       # Cliente base com retry/timeout
│   │   ├── auth.ts
│   │   ├── admin.ts
│   │   └── public.ts
│   ├── components/         # Componentes React
│   │   ├── admin/
│   │   ├── trails/
│   │   └── ui/
│   ├── pages/              # Páginas
│   ├── context/            # Context API
│   │   └── AuthContext.tsx
│   ├── hooks/              # Custom hooks
│   ├── utils/              # Utilitários
│   │   ├── error-handler.ts
│   │   ├── cpf.ts
│   │   └── phone.ts
│   └── i18n/               # Internacionalização
└── public/                 # Arquivos estáticos
```

### Roteamento

Roteamento customizado baseado em hash/state:
- Sem dependências externas de roteamento
- Navegação programática
- Suporte a query parameters

### Estado

- **Context API**: autenticação global e estado de sessão do usuário.
- **Local State**: gerenciamento de formulários e filtros.
- **LocalStorage**: persistência de token e preferências básicas.

### Tratamento de Erros

- **Error Handler**: utilitário centralizado para mensagens amigáveis.
- **Retry Logic**: tentativas automáticas com exponential backoff para falhas transitórias.
- **Timeout**: cancelamento de requisições com AbortController (30s padrão).
- **Type Safety**: tipos específicos para diferentes erros e feedback no UI.

## Banco de Dados

### Schema Principal

- **Usuario**: contas administrativas e de guias (CPF como chave primária).
- **Cliente**: contas de visitantes autenticados no portal.
- **Convite**: tokens de convite para criação de usuários administrativos.
- **Guide**: dados operacionais do guia (perfil, idiomas, certificações, destaque).
- **Trail**: trilhas do parque (dificuldade, capacidade, preço base, status e destaque).
- **TrailGuide**: relação many-to-many entre trilhas e guias.
- **TrailSession**: sessões agendadas das trilhas (horário, guia primário, capacidade, contato).
- **Booking**: agendamentos com protocolo e status, vinculados a trilha/sessão/guia.
- **Participant**: participantes de cada agendamento com indicador de banimento.
- **Event / EventRegistration**: eventos do parque e inscrições.
- **FaunaFloraRecord**: catálogo de fauna e flora.
- **ActivityLog**: registros de auditoria associados a trilhas, agendamentos ou eventos.

### Relacionamentos

- Trail ↔ Guide: many-to-many via `TrailGuide`.
- Trail ↔ TrailSession: one-to-many.
- TrailSession ↔ Booking: one-to-many.
- Booking ↔ Participant: one-to-many (cascade delete).
- Event ↔ EventRegistration: one-to-many.
- Trail/Booking/Event ↔ ActivityLog: associações opcionais para auditoria.

## Fluxos Principais

### 1. Agendamento de Trilha

```
Cliente → Front-end → POST /api/bookings
  → Validação/Zod → Transação Prisma com lock de sessão
  → Verificação de capacidade e guia ativo
  → Criação de protocolo e ActivityLog
  → Retorno do protocolo e horário formatado
```

### 2. Autenticação

```
Login (admin ou cliente) → POST /api/auth/login|/customer/login
  → Validação de credenciais (hash)
  → Geração de JWT com perfil
  → Retorno de token e dados do usuário
  → Armazenamento no front-end
```

### 3. Dashboard Admin

```
Admin → GET /api/admin/overview
  → Agregação de métricas, destaques e atividades
  → Cálculo de ocupação e próximos eventos
  → Retorno de dados formatados para cards e gráficos
```

## Performance

### Back-end

- **Compression**: Gzip para respostas
- **Rate Limiting**: Proteção de recursos
- **Query Optimization**: Prisma com includes/seleções seletivas e locks de sessão para consistência.
- **Connection Pooling**: Prisma gerencia pool

### Front-end

- **Code Splitting**: Lazy loading de rotas
- **Image Optimization**: Lazy loading de imagens
- **Caching**: Cache de requisições (futuro)
- **Retry Logic**: Tentativas automáticas

## Segurança

### Back-end

1. **Headers de Segurança** (Helmet)
2. **Rate Limiting** (express-rate-limit)
3. **CORS Restritivo**
4. **Validação de Inputs** (Zod)
5. **Sanitização de Dados**
6. **JWT com Expiração**
7. **Logging de Auditoria**

### Front-end

1. **HTTPS em Produção**
2. **Sanitização de Inputs**
3. **Validação Client-side**
4. **Token Storage Seguro**
5. **Timeout de Requisições**

## Monitoramento

- **Health Check**: `/health` endpoint
- **Structured Logging**: Pino com contexto
- **Error Tracking**: Logs estruturados de erros
- **Metrics**: Uptime, memória, conexão DB

## Escalabilidade

### Atual

- Stateless API (permite múltiplas instâncias)
- Connection pooling do Prisma
- Rate limiting por IP

### Futuro

- Cache (Redis)
- Load balancing
- CDN para assets estáticos
- Database read replicas

## Tecnologias

### Back-end

- **Node.js**: Runtime
- **Express**: Framework web
- **TypeScript**: Type safety
- **Prisma**: ORM
- **PostgreSQL**: Banco de dados
- **JWT**: Autenticação
- **Zod**: Validação
- **Pino**: Logging
- **Helmet**: Segurança
- **express-rate-limit**: Rate limiting

### Front-end

- **React 19**: Framework UI
- **TypeScript**: Type safety
- **Vite**: Build tool
- **CSS**: Estilização (sem framework CSS)

## Deploy

### Back-end

- Build: `npm run build`
- Start: `npm start`
- Variáveis de ambiente necessárias

### Front-end

- Build: `npm run build`
- Serve: Arquivos estáticos
- Proxy: API requests para back-end

## Próximos Passos

1. Cache layer (Redis)
2. Testes E2E
3. CI/CD
4. Docker containerization
5. Monitoring avançado (Sentry, DataDog)
6. Documentação OpenAPI/Swagger

