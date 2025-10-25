# Guia de Integração Prisma + PostgreSQL + HeidiSQL

Este roteiro explica como preparar o ambiente para que a API do AgenDunas utilize o banco PostgreSQL via Prisma e, em seguida, como inspecionar e manipular os dados com o HeidiSQL. Os passos consideram um banco local com as credenciais informadas:

- **Host**: `localhost`
- **Porta**: `5432`
- **Banco**: `agendunas`
- **Usuário**: `postgres`
- **Senha**: `postgres`
- **Biblioteca nativa**: `libpq-17.dll` (Windows)

> Caso esteja em Linux/macOS, a biblioteca `libpq` já vem com a instalação padrão do PostgreSQL. No Windows, assegure-se de que o arquivo `libpq-17.dll` esteja acessível no PATH do sistema ou no mesmo diretório do HeidiSQL.

## 1. Pré-requisitos

1. **PostgreSQL instalado** (versão 14 ou superior). Crie o banco `agendunas` se ele ainda não existir:
   ```sql
   CREATE DATABASE agendunas;
   ```
2. **Node.js 18+** (para executar o back-end e os comandos do Prisma).
3. **HeidiSQL 12+** (para visualizar o banco via interface gráfica).
4. **Git** (opcional, mas recomendado para gerenciar o repositório).

## 2. Configurar o ambiente do back-end

1. Entre na pasta do back-end:
   ```bash
   cd back-end
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Crie um arquivo `.env` a partir do modelo disponível (`.env.example`) e configure a URL de conexão:
   ```bash
   cp .env.example .env
   ```
   O arquivo resultante deve conter algo como:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/agendunas?schema=public"
   ALLOWED_ORIGINS="http://localhost:5173,http://localhost:3000"
   PORT=3001
   ```
   Ajuste os valores conforme necessário.

## 3. Gerar o cliente Prisma e aplicar o schema

1. Gere o cliente para habilitar o autocomplete e o acesso tipado:
   ```bash
   npm run generate
   ```
2. Crie as tabelas no banco utilizando migrations (o comando abaixo cria uma migração interativa; substitua `init` por um nome descritivo quando fizer alterações futuras):
   ```bash
   npm run migrate -- --name init
   ```
   > Se quiser apenas sincronizar o schema sem registrar uma nova migração (útil em ambientes de desenvolvimento), use `npx prisma db push`.
   >
   > **Dica:** em ambientes corporativos com bloqueio a downloads externos é comum o Prisma acusar erro `403 Forbidden` ao tentar baixar os engines. Nesse caso exporte `PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1` antes dos comandos (`PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npm run migrate`), garantindo que o CLI utilize os engines já empacotados.
3. (Opcional) Popule a base com dados de exemplo utilizando o script de seed:
   ```bash
   npm run seed
   ```
   O seed cadastra trilhas, guias, eventos, registros de fauna/flora e agendamentos para que a interface administrativa tenha conteúdo real.

## 4. Executar a API com o banco conectado

Com o banco preparado, execute o servidor back-end para validar a integração:
```bash
npm run dev
```
A API ficará disponível em `http://localhost:3001/api`. Teste alguns endpoints (por exemplo, `GET /api/guides` ou `GET /api/admin/overview`) para confirmar que os dados retornam diretamente do PostgreSQL.

## 5. Conectar o HeidiSQL ao PostgreSQL

1. Abra o HeidiSQL e clique em **Novo** para criar uma conexão.
2. Configure os campos:
   - **Tipo de sessão**: PostgreSQL (libpq)
   - **Nome**: AgenDunas (ou outro de sua preferência)
   - **Servidor**: `localhost`
   - **Usuário**: `postgres`
   - **Senha**: `postgres`
   - **Porta**: `5432`
   - **Banco de dados**: `agendunas`
3. Na aba **Avançado**, aponte o caminho da `libpq-17.dll` se estiver em Windows (ex.: `C:\Program Files\PostgreSQL\17\bin\libpq-17.dll`).
4. Clique em **Salvar** e depois em **Conectar**. Você verá o banco `agendunas` com o schema `public` e todas as tabelas criadas pelo Prisma (`Guide`, `Trail`, `Booking`, etc.).

> 💡 **Importe a sessão pronta**: se preferir, utilize o arquivo [`heidisql/HeidiSQL_settings_AgenDunas.txt`](heidisql/HeidiSQL_settings_AgenDunas.txt). Abra o HeidiSQL, clique em **Importar configurações...** na tela inicial, selecione esse arquivo e ajuste apenas o caminho da `libpq-17.dll` conforme a instalação local do PostgreSQL.

## 6. Fluxo de trabalho recomendado

1. **Editar modelos**: atualize o arquivo `prisma/schema.prisma` conforme necessário (novas tabelas, campos, enums, relacionamentos).
2. **Gerar migração**: execute `npm run migrate -- --name <descricao>` para criar a migração e aplicá-la no banco.
3. **Atualizar o cliente**: rode `npm run generate` para atualizar o Prisma Client com os novos tipos.
4. **Repopular dados (opcional)**: caso queira dados frescos de demonstração, use `npm run seed`.
5. **Validar via API**: faça requisições para os endpoints REST e confira os dados no front-end.
6. **Inspecionar no HeidiSQL**: use o HeidiSQL para verificar registros, executar consultas SQL, ajustar dados pontuais ou exportar relatórios.

## 7. Sincronizar alterações entre Prisma e HeidiSQL

- Sempre que editar o schema do Prisma, gere uma nova migração para manter o histórico (`npm run migrate`).
- Use `npx prisma studio` se quiser manipular dados via interface web; o Studio e o HeidiSQL podem ser usados em paralelo.
- Para trazer alterações feitas manualmente no banco para o schema Prisma, utilize `npx prisma db pull` (isso atualiza o `schema.prisma` com a estrutura atual do banco).

## 8. Dicas adicionais

- **Backups**: antes de rodar seeds ou migrações destrutivas, faça backup pelo HeidiSQL (`Arquivo > Exportar > Dump SQL`).
- **Ambiente de produção**: utilize variáveis de ambiente seguras (`DATABASE_URL` com usuário e senha específicos de produção) e desative seeds automáticos.
- **Observabilidade**: os logs do Prisma podem ser habilitados ajustando o `PrismaClient` em `src/lib/prisma.js` para registrar consultas (`log: ['query', 'error', 'warn']`).
- **Checagem de conexão**: em caso de erro de autenticação, confirme se o PostgreSQL está ouvindo na porta 5432 (`postgresql.conf` e `pg_hba.conf`) e se o firewall permite conexões locais.

Seguindo esses passos, qualquer pessoa conseguirá replicar a base local, executar comandos do Prisma e inspecionar/ajustar os dados via HeidiSQL com segurança.
