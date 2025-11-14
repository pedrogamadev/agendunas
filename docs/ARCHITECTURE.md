# Arquitetura do Sistema AgenDunas

## Visão Geral

O AgenDunas é uma aplicação full-stack dividida em front-end (React) e back-end (Node.js/Express), com comunicação via API REST.

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
         │
┌────────▼────────┐
│   PostgreSQL     │
│   (via Prisma)   │
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
│   ├── routes/             # Definição de rotas
│   ├── lib/                # Bibliotecas/configurações
│   │   ├── prisma.ts       # Cliente Prisma
│   │   ├── logger.ts       # Logger estruturado
│   │   └── token.ts         # JWT
│   └── utils/              # Utilitários
└── prisma/
    ├── schema.prisma       # Schema do banco
    └── migrations/         # Migrations
```

### Fluxo de Requisição

1. **Request** → Express
2. **Middleware Chain**:
   - Helmet (segurança)
   - Compression
   - CORS
   - Rate Limiting
   - Body Parser
   - Logging (Morgan)
3. **Route Handler** → Controller
4. **Controller** → Prisma (banco de dados)
5. **Response** → Cliente

### Segurança

- **Helmet**: Headers de segurança HTTP
- **Rate Limiting**: Proteção contra DDoS/brute force
- **CORS**: Configuração restritiva
- **JWT**: Autenticação stateless
- **Validação**: Zod para validação de dados
- **Sanitização**: Validação de inputs

### Logging

Sistema de logging estruturado com Pino:
- Níveis: debug, info, warn, error
- Formato JSON em produção
- Pretty print em desenvolvimento

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

- **Context API**: Autenticação global
- **Local State**: Estado local de componentes
- **LocalStorage**: Persistência de token

### Tratamento de Erros

- **Error Handler**: Utilitário centralizado
- **Retry Logic**: Tentativas automáticas com exponential backoff
- **Timeout**: Timeout configurável (30s padrão)
- **Type Safety**: Tipos específicos para diferentes erros

## Banco de Dados

### Schema Principal

- **Usuario**: Usuários do sistema (admin, coordenador, guia)
- **Cliente**: Clientes que fazem reservas
- **Trail**: Trilhas disponíveis
- **Guide**: Guias cadastrados
- **TrailSession**: Sessões agendadas de trilhas
- **Booking**: Reservas de clientes
- **Event**: Eventos especiais
- **FaunaFlora**: Espécies de fauna e flora
- **ActivityLog**: Log de atividades

### Relacionamentos

- Trail ↔ Guide (many-to-many)
- Trail ↔ TrailSession (one-to-many)
- TrailSession ↔ Booking (one-to-many)
- Guide ↔ TrailSession (one-to-many)

## Fluxos Principais

### 1. Agendamento de Trilha

```
Cliente → Front-end → API POST /bookings
  → Validação → Prisma Transaction
  → Verificação de capacidade
  → Criação de booking
  → Retorno de protocolo
```

### 2. Autenticação

```
Login → POST /api/auth/login
  → Validação de credenciais
  → Geração de JWT
  → Retorno de token
  → Armazenamento no front-end
```

### 3. Dashboard Admin

```
Admin → GET /api/admin/overview
  → Agregação de dados
  → Estatísticas
  → Retorno de dados formatados
```

## Performance

### Back-end

- **Compression**: Gzip para respostas
- **Rate Limiting**: Proteção de recursos
- **Query Optimization**: Prisma com includes seletivos
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

