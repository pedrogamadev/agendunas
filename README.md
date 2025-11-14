# AgenDunas

Sistema de agendamento de trilhas guiadas no Parque das Dunas em Natal-RN.

## 📋 Sobre o Projeto

O AgenDunas é uma plataforma completa para gerenciamento e agendamento de trilhas ecológicas, permitindo que visitantes agendem trilhas guiadas enquanto oferece uma interface administrativa para gestão de guias, trilhas, sessões e reservas.

## 🏗️ Arquitetura

O projeto é dividido em duas partes principais:

- **`front-end/`**: Aplicação React + Vite com TypeScript
- **`back-end/`**: API REST em Node.js + Express + Prisma + PostgreSQL

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 20+ 
- PostgreSQL 14+
- npm ou yarn

### Instalação

1. Clone o repositório:
```bash
git clone <repository-url>
cd agendunas
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:

Back-end (`back-end/.env`):
```env
DATABASE_URL="postgresql://user:password@localhost:5432/agendunas"
PORT=3001
JWT_SECRET="seu-secret-jwt-aqui"
ALLOWED_ORIGINS="http://localhost:5173,http://localhost:3000"
```

Front-end (`front-end/.env`):
```env
VITE_API_BASE_URL="http://localhost:3001/api"
```

4. Configure o banco de dados:
```bash
cd back-end
npm run migrate
npm run seed
```

5. Inicie os servidores:
```bash
# Na raiz do projeto
npm run dev
```

Isso iniciará:
- Back-end em `http://localhost:3001`
- Front-end em `http://localhost:5173`

## 📁 Estrutura do Projeto

```
agendunas/
├── back-end/              # API REST
│   ├── src/
│   │   ├── controllers/   # Lógica de negócio
│   │   ├── middlewares/   # Middlewares (auth, rate limit, etc)
│   │   ├── routes/        # Definição de rotas
│   │   ├── lib/           # Utilitários (prisma, logger, etc)
│   │   └── utils/         # Funções auxiliares
│   ├── prisma/            # Schema e migrations
│   └── tests/             # Testes
├── front-end/             # Aplicação React
│   ├── src/
│   │   ├── api/           # Cliente HTTP
│   │   ├── components/   # Componentes React
│   │   ├── pages/        # Páginas
│   │   ├── context/      # Context API
│   │   ├── hooks/        # Custom hooks
│   │   └── utils/        # Utilitários
│   └── public/           # Arquivos estáticos
└── docs/                 # Documentação
```

## 🔧 Scripts Disponíveis

### Raiz do Projeto

- `npm run dev` - Inicia front-end e back-end em modo desenvolvimento
- `npm run build` - Build de produção para ambos
- `npm run lint` - Executa linter no front-end
- `npm run generate` - Gera Prisma Client
- `npm run migrate` - Executa migrations do banco
- `npm run seed` - Popula banco com dados iniciais

### Back-end

- `npm run dev` - Inicia servidor em modo watch
- `npm run build` - Compila TypeScript
- `npm run start` - Inicia servidor de produção
- `npm run test` - Executa testes

### Front-end

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Build de produção
- `npm run preview` - Preview do build de produção
- `npm run lint` - Executa ESLint

## 🔐 Segurança

O projeto implementa várias medidas de segurança:

- **Rate Limiting**: Proteção contra DDoS e brute force
- **Helmet**: Headers de segurança HTTP
- **CORS**: Configuração restritiva baseada em variáveis de ambiente
- **Validação**: Zod para validação de dados
- **Autenticação**: JWT com tokens seguros
- **Logging**: Logging estruturado para auditoria

## 📚 Documentação Adicional

- [Documentação da API](./docs/API.md) - Documentação completa das rotas
- [Arquitetura](./docs/ARCHITECTURE.md) - Detalhes da arquitetura do sistema
- [Requisitos](./docs/DOCUMENTACAO_REQUISITOS.md) - Documentação de requisitos
- [Prisma/HeidiSQL](./docs/DOCUMENTACAO_PRISMA_HEIDISQL.md) - Guia de banco de dados

## 🧪 Testes

```bash
cd back-end
npm run test
```

## 🌍 Variáveis de Ambiente

### Back-end

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `DATABASE_URL` | URL de conexão PostgreSQL | - |
| `PORT` | Porta do servidor | `3001` |
| `JWT_SECRET` | Secret para assinatura JWT | - |
| `ALLOWED_ORIGINS` | Origens permitidas (CORS) | - |
| `RATE_LIMIT_WINDOW_MS` | Janela de rate limiting (ms) | `900000` |
| `RATE_LIMIT_MAX_REQUESTS` | Máximo de requisições | `100` |
| `RATE_LIMIT_AUTH_MAX_REQUESTS` | Máximo para auth | `5` |
| `MAX_PAYLOAD_SIZE` | Tamanho máximo de payload | `10mb` |
| `LOG_LEVEL` | Nível de logging | `info` |
| `NODE_ENV` | Ambiente (development/production/test) | `development` |

### Front-end

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `VITE_API_BASE_URL` | URL base da API | `http://localhost:3001/api` |

## 📝 Licença

Ver arquivo [LICENSE](./LICENSE)

## 👥 Contribuindo

Ver [CONTRIBUTING.md](./CONTRIBUTING.md) para guia de contribuição.

## 🐛 Problemas Conhecidos

- Ver issues do GitHub para problemas conhecidos e roadmap.

## 📞 Suporte

Para suporte, abra uma issue no repositório ou entre em contato com a equipe de desenvolvimento.
