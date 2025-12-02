# Sistema de Agendamento Online do Parque das Dunas – AgenDunas

- **Código do Projeto:** SAOP
- **Versão:** v1.1
- **Data da Revisão:** 22/05/2024
- **Autores:** Equipe AgenDunas (coordenação: Vinícius de Freitas e Silva)

## 1. Nome do Projeto
Sistema de Agendamento Online do Parque das Dunas – AgenDunas

## 2. Código do Projeto
SAOP

## 3. Nome do Gerente do Projeto
Vinícius de Freitas e Silva

## 4. Alinhamento Estratégico
O projeto AgenDunas está alinhado com os objetivos estratégicos do Parque das Dunas e da Secretaria de Meio Ambiente em:

- Modernizar os processos administrativos.
- Promover acessibilidade digital aos serviços públicos.
- Incentivar o turismo sustentável.
- Melhorar a experiência do visitante e fortalecer a imagem do parque como referência em gestão ambiental e tecnológica.

## 5. Objetivos do Projeto
**Objetivo Geral:**
Disponibilizar uma plataforma web responsiva para agendamento online de trilhas guiadas e gestão operacional pelo time do parque.

**Objetivos SMART:**

- **Específico:** oferecer agendamento público e painel administrativo único para trilhas, sessões, guias e eventos.
- **Mensurável:** reduzir em pelo menos 30% a taxa de “no-show” por meio de confirmações e comunicação centralizada.
- **Acordado:** requisitos validados com a administração do Parque das Dunas e Secretaria de Meio Ambiente.
- **Realista:** uso de stack open source (React, Express, PostgreSQL) operada pela equipe interna.
- **Temporal:** entregas incrementais com versão piloto do painel admin em 2024 e expansão de integrações em 2025.

## 6. Justificativa
O agendamento manual atual (telefone/e-mail) gera dificuldades no controle de vagas, alta taxa de ausência e falhas de comunicação. O AgenDunas resolve esses problemas ao:

- Controlar capacidade e sessões em tempo real com base no banco relacional.
- Reduzir custos operacionais com automação de protocolos e confirmação de presença.
- Ampliar a satisfação do visitante ao oferecer autosserviço e feedback imediato.

## 7. Principais Entregas do Projeto
- Portal público para trilhas, guias e fauna/flora com criação de solicitações de agendamento.
- Painel administrativo com métricas (overview), calendário integrado, relatórios e gestão completa de trilhas, sessões e eventos.
- Módulo de gerenciamento de participantes com banimento e histórico de atividades.
- Fluxo de convites para criação de usuários administrativos e cadastro de guias vinculados.
- Relatórios operacionais (agregações e gráficos) consumidos via API `/api/admin/reports`.
- Kick-off, homologação do piloto e plano de transição para operação.

## 8. Estimativa de Usuários
Centenas de visitantes por mês, abrangendo turistas e moradores locais que frequentam o Parque das Dunas.

## 9. Prazo do Projeto
- **Início:** Agosto/2024
- **Piloto:** Novembro/2024 (painel administrativo + reservas públicas)
- **Expansão:** 2025 (integração de notificações e exportações)
- **Metodologia:** incremental/iterativa com sprints quinzenais.

## 10. Custo do Projeto
- **Investimento inicial:** R$ 90.000,00
- **Custos indiretos:** tempo da equipe, equipamentos pessoais e ambiente home office.
- **Infraestrutura:** uso de serviços open source; eventuais custos de hospedagem e monitoramento ficam fora do escopo inicial.

## 11. Partes Interessadas
| Nome | Função | Participação | Fase Crítica |
| --- | --- | --- | --- |
| Secretaria de Meio Ambiente / Administração do Parque das Dunas | Patrocinador | Aprovação, execução, mobilização e validação final. | Todo o ciclo do projeto |
| Vinícius de Freitas e Silva | Gerente do Projeto | Planejamento, coordenação técnica e integração das partes. | Todo o ciclo |
| Pedro Humberto Gama de Medeiros | Desenvolvedor Front-end | Desenvolvimento do módulo de interface e usabilidade. | Durante os incrementos |
| Jonas Felipe Dantas Segundo Guimarães | Administrativo (Documentação) | Apoio na documentação e registros. | Todo o ciclo |
| David Antony Luiz da Silva | Administrativo (Documentação) | Apoio na documentação e registros. | Todo o ciclo |

## 12. Equipe de Gestão do Projeto
| Função | Nome | Lotação | Telefone | E-mail |
| --- | --- | --- | --- | --- |
| Patrocinador | Administração do Parque das Dunas / Secretaria de Meio Ambiente | Administração Pública (Gestão Ambiental) | 4002-8922 | seec@gmail.com |
| Gerente do Projeto | Vinícius de Freitas e Silva | Equipe de Desenvolvimento AgenDunas | 84 99482-1342 | [E-mail de contato] |

## 13. Premissas
- O projeto será desenvolvido em home office com equipamentos pessoais.
- O ciclo de vida será iterativo e incremental, permitindo ajustes contínuos.
- Não haverá custo inicial adicional para a organização.

## 14. Critérios de Aceitação
- Redução mínima de 30% na taxa de não comparecimento.
- Funcionamento pleno do sistema de agendamento online.
- Aceitação formal pela Administração do Parque.
- Disponibilização de relatórios gerenciais.

## 15. Restrições
- Limitações orçamentárias (custo inicial zero). Custos recorrentes futuros serão aprovados em comitê.
- Dependência de infraestrutura de internet estável no parque para uso do painel.
- Escopo restrito ao agendamento de trilhas e eventos do parque (demais serviços são fases futuras).

## 16. Documentos de Referência
- Documento de Especificação do Projeto AgenDunas (26/08/2025).

## 17. Termos de Aceite do Projeto
| Marco do Projeto | Responsável | Função | Data | Assinatura |
| --- | --- | --- | --- | --- |
| 1. Termo de Abertura | Administração do Parque das Dunas / SEMARH | Patrocinador | [dd/mm/aaaa] | — |
|  | Vinícius de Freitas e Silva | Gerente do Projeto |  | — |
| 2. Plano de Gerenciamento | Administração do Parque das Dunas / SEMARH | Patrocinador | — | — |
|  | Vinícius de Freitas e Silva | Gerente do Projeto | — | — |
| 3. Homologação | Administração do Parque das Dunas / SEMARH | Patrocinador | — | — |
|  | Vinícius de Freitas e Silva | Gerente de Projeto | — | — |
| 4. Transição para Operação | Administração do Parque das Dunas / SEMARH | Patrocinador | — | — |
|  | Vinícius de Freitas e Silva | Gerente de Projeto | — | — |
| 5. Termo de Aceite | Administração do Parque das Dunas / SEMARH | Patrocinador | — | — |
|  | Vinícius de Freitas e Silva | Gerente do Projeto | — | — |
| 6. Divulgação dos Serviços | Administração do Parque das Dunas / SEMARH | Patrocinador | — | — |
|  | Vinícius de Freitas e Silva | Gerente do Projeto | — | — |

## 18. Participação discente
- Pedro Humberto Gama De Medeiros - 01741824 (Front-end)
- Vinicius de Freitas e Silva - 01707712 (Gestão/Full Stack)

## 19. Tasks solicitadas por Pedro Humberto
1. Analisar linhas de ônibus que passam em frente ao Bosque dos Namorados (07/10/2025) — **pendente**.
2. Analisar eventos recorrentes no parque das dunas para instanciar no sistema (07/10/2025) — **pendente**.
3. Criar "termo de serviço" para reserva (08/10/2025) — **pendente**.
