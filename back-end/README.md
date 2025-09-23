# Back-end

API minimalista responsável por fornecer os dados públicos das novas páginas do AgenDunas.

## Executando o servidor

```bash
npm install # (não há dependências externas)
npm run dev
```

O servidor utiliza apenas módulos nativos do Node.js e é iniciado na porta `3001` por padrão (configurável via variável
`PORT`).

## Rotas disponíveis

| Método | Rota                | Descrição                                                                 |
| ------ | ------------------- | ------------------------------------------------------------------------- |
| GET    | `/api/guias`        | Lista os guias cadastrados com certificações e idiomas.                   |
| GET    | `/api/trilhas`      | Expõe as trilhas disponíveis para seleção no formulário de agendamento.   |
| GET    | `/api/fauna-flora`  | Retorna espécies de fauna e flora destacadas no mural fotográfico.        |
| POST   | `/api/agendamentos` | Recebe solicitações de agendamento e retorna um recibo com data e payload.|

Todas as rotas respondem em JSON e aceitam requisições CORS.
