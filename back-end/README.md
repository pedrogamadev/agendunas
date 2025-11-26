# Back-end

API minimalista responsável por fornecer os dados públicos das novas páginas do AgenDunas.

## Executando o servidor

```bash
npm install # (não há dependências externas)
npm run dev
```

O servidor utiliza apenas módulos nativos do Node.js e é iniciado na porta `3001` por padrão (configurável via variável
`PORT`).

### Variáveis de ambiente

Os limitadores de requisição podem ser ajustados via envs e são ignorados automaticamente em desenvolvimento (quando
`NODE_ENV=development`) ou se `RATE_LIMIT_ENABLED=false`.

| Variável                       | Descrição                                                                                       | Padrão em produção | Padrão em dev/test |
| ------------------------------ | ----------------------------------------------------------------------------------------------- | ------------------ | ------------------ |
| `RATE_LIMIT_ENABLED`           | Habilita/desabilita o rate limit global.                                                        | `true`             | `true`             |
| `RATE_LIMIT_WINDOW_MS`         | Janela de tempo do limitador geral.                                                             | `900000` (15 min)  | `900000` (15 min)  |
| `RATE_LIMIT_MAX_REQUESTS`      | Máximo de requisições por IP na janela do limitador geral.                                     | `100`              | `1000`             |
| `RATE_LIMIT_AUTH_WINDOW_MS`    | Janela de tempo para o limitador de autenticação.                                               | `900000` (15 min)  | `900000` (15 min)  |
| `RATE_LIMIT_AUTH_MAX_REQUESTS` | Máximo de tentativas por IP/CPF na janela do limitador de autenticação.                         | `10`               | `100`              |

## Rotas disponíveis

| Método | Rota                | Descrição                                                                 |
| ------ | ------------------- | ------------------------------------------------------------------------- |
| GET    | `/api/guias`        | Lista os guias cadastrados com certificações e idiomas.                   |
| GET    | `/api/trilhas`      | Expõe as trilhas disponíveis para seleção no formulário de agendamento.   |
| GET    | `/api/fauna-flora`  | Retorna espécies de fauna e flora destacadas no mural fotográfico.        |
| POST   | `/api/agendamentos` | Recebe solicitações de agendamento e retorna um recibo com data e payload.|

Todas as rotas respondem em JSON e aceitam requisições CORS.
