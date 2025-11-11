# Requisitos Funcionais e Não Funcionais do AgenDunas

Este documento consolida os requisitos do sistema de agendamento on-line do Parque das Dunas a partir da documentação existente
(e.g. Documento Acadêmico e especificações de backoffice) e do comportamento esperado pelo time de operação. Ele serve como
base para o desenvolvimento e homologação dos módulos administrativos do AgenDunas.

## 1. Visão Geral

O AgenDunas fornece uma plataforma centralizada para planejamento e controle das trilhas guiadas do parque, desde a reserva de
vagas até o monitoramento diário das operações. O painel administrativo é o ponto único de gestão: todos os dados exibidos no
portal público devem ser criados, atualizados ou arquivados via painel, garantindo rastreabilidade e consistência com o banco
de dados oficial.

## 2. Requisitos Funcionais

### 2.1 Dashboard
- RF-DAS-01: exibir métricas consolidadas de agendamentos (dia corrente, confirmados, pendentes, cancelados) calculadas em
tempo real.
- RF-DAS-02: listar sessões de trilha previstas para o dia com ocupação e identificação do guia responsável.
- RF-DAS-03: destacar próximos eventos (do módulo de eventos) com data e status operacional.
- RF-DAS-04: apresentar linha do tempo das atividades recentes geradas por ações do time (ex.: criação de agendamento,
publicação de evento, bloqueio de participante).
- RF-DAS-05: exibir cards resumidos das trilhas em destaque com dificuldade, duração, status e última sessão realizada.
- RF-DAS-06: quando as integrações externas não estiverem disponíveis (ex.: clima), informar o estado de indisponibilidade sem
utilizar dados estáticos.

### 2.2 Agendamentos
- RF-AGE-01: listar agendamentos ordenados por data/hora com protocolo, trilha, responsável, participantes, guia e status.
- RF-AGE-02: permitir atualizar o status do agendamento (confirmar, cancelar, remarcar, concluir) registrando o evento no
histórico.
- RF-AGE-03: abrir modal “Novo Agendamento” para criar reservas vinculadas a trilhas e sessões já cadastradas, com seleção de
guia e inclusão de acompanhantes.
- RF-AGE-04: validar capacidade da trilha/sessão e impedir reservas acima do limite configurado.
- RF-AGE-05: permitir visualizar detalhes completos do agendamento (participantes, contatos, notas) em modal dedicado.
- RF-AGE-06: cada ação administrativa deve gerar registro de atividade (audit trail) com data/hora, usuário e mensagem.

### 2.3 Participantes
- RF-PAR-01: listar participantes em ordem decrescente de cadastro, exibindo contato, trilha associada, status da reserva e
indicador de banimento.
- RF-PAR-02: permitir abrir modal de gerenciamento de cada participante com dados completos (identificação, contatos,
agendamento vinculado).
- RF-PAR-03: habilitar banimento ou reativação de participantes, atualizando imediatamente o status na tabela e no
agendamento vinculado.
- RF-PAR-04: oferecer ação para iniciar novo agendamento pré-preenchido com os dados do participante selecionado.

### 2.4 Eventos do Parque
- RF-EVE-01: listar cards de eventos cadastrados com título, descrição, data, capacidade e etiquetas de status/destaque.
- RF-EVE-02: disponibilizar botão “Novo Evento” que abre modal para cadastro com título, slug, descrição, localização,
período, capacidade, status e destaque.
- RF-EVE-03: ao salvar um evento, registrar log de atividade e atualizar imediatamente os destaques mostrados no dashboard.
- RF-EVE-04: manter infraestrutura para futuras ações (publicar, promover, editar) preservando os botões já presentes no UI,
mesmo que as ações ainda estejam desabilitadas.

### 2.5 Calendário Integrado
- RF-CAL-01: exibir calendário mensal com agendamentos e eventos agregados por dia, sincronizado com as datas reais das
sessões cadastradas.
- RF-CAL-02: identificar visualmente dias com eventos/agendamentos e listar os itens ao selecionar o dia.
- RF-CAL-03: preservar controles de navegação de mês para implementação futura, mantendo o layout funcional.

### 2.6 Relatórios
- RF-REL-01: apresentar indicadores consolidados (total de agendamentos, taxa de confirmação, taxa de cancelamento, eventos
publicados) calculados a partir do banco de dados.
- RF-REL-02: renderizar gráficos (linha, pizza, barras) com dados agregados dos últimos meses e trilhas mais reservadas.
- RF-REL-03: oferecer botões de exportação (CSV, PDF) reservando os ganchos para integração futura com serviços de geração de
arquivos.

### 2.7 Outras Seções
- RF-TRI-01: permitir cadastrar, editar e remover trilhas com dados de capacidade, dificuldade, guias atribuídos e sessões.
- RF-GUI-01: permitir cadastrar, editar e remover guias, vinculando-os às trilhas e controlando destaque/atividade.
- RF-CON-01: gerenciar templates de comunicação e convites de acesso para perfis administrativos, com geração de tokens
controlada.

## 3. Requisitos Não Funcionais

### 3.1 Confiabilidade e Dados
- RNF-DAD-01: toda leitura exibida no painel deve ser alimentada exclusivamente pelo banco de dados relacional (PostgreSQL
via Prisma). Dados estáticos em código estão proibidos para visões operacionais.
- RNF-DAD-02: os serviços devem manter integridade referencial (agendamentos referenciam trilhas, sessões e guias válidos).
- RNF-DAD-03: operações de escrita devem utilizar transações quando atualizarem múltiplas tabelas (ex.: criação de evento com
log).

### 3.2 Segurança e Controle de Acesso
- RNF-SEG-01: rotas administrativas exigem autenticação e perfil apropriado (administrador ou colaborador autorizado).
- RNF-SEG-02: dados sensíveis (telefones, e-mails, CPF) devem trafegar via HTTPS em produção e ser exibidos apenas a usuários
com permissão.
- RNF-SEG-03: toda ação crítica deve gerar registro na tabela `ActivityLog` para auditoria posterior.

### 3.3 Performance e Escalabilidade
- RNF-PER-01: carregamento inicial do dashboard deve ocorrer em até 3 segundos com conexão de banda larga padrão (20 Mbps),
realizando chamadas agregadas (`/admin/overview`) para reduzir requisições.
- RNF-PER-02: operações de listagem (agendamentos, participantes, eventos) devem suportar paginação/limite configurável para
controlar uso de memória.
- RNF-PER-03: consultas devem utilizar índices apropriados (datas, status, `createdAt`) para manter tempo de resposta inferior
a 500 ms em cenários com alto volume.

### 3.4 Usabilidade e Acessibilidade
- RNF-USA-01: todas as ações críticas devem fornecer feedback imediato (mensagens de sucesso/erro, estado de carregamento).
- RNF-USA-02: componentes modais devem possuir atributos ARIA corretos (`role="dialog"`, `aria-modal="true"`, identificador
ligado ao título) e permitir fechamento por teclado.
- RNF-USA-03: estados vazios e mensagens de erro devem ser exibidos sempre que não houver dados ou ocorrer falha na API.

### 3.5 Observabilidade e Suporte Operacional
- RNF-OBS-01: logs de atividade devem incluir contexto suficiente (mensagem legível, IDs envolvidos) para auditoria do time de
operação.
- RNF-OBS-02: falhas em integrações externas (clima, exportações) devem ser tratadas com mensagens claras sem interromper as
funcionalidades principais.
- RNF-OBS-03: o sistema deve manter estrutura para futuras integrações (ex.: geração de relatórios, promoções de eventos)
utilizando botões e placeholders no front-end.

### 3.6 Manutenibilidade
- RNF-MAN-01: código front-end deve consumir APIs tipadas (`apiRequest`) evitando duplicação de modelos.
- RNF-MAN-02: serviços back-end devem centralizar formatações e cálculos em helpers (`dashboard-service`, `formatters`),
promovendo reutilização.
- RNF-MAN-03: novas funcionalidades devem incluir testes ou validações manuais documentadas antes de serem liberadas para uso
operacional.

---

Este documento deverá ser revisado periodicamente conforme novas integrações forem priorizadas (ex.: exportações automáticas,
integrador climático ou notificações transacionais). Sempre que uma funcionalidade for estendida, os respectivos requisitos
deve ser atualizados para refletir o comportamento vigente.
