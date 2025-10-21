# Sugestões de melhorias

## Correção de erro de digitação
- **Arquivo:** `front-end/src/i18n/translations.ts`
- **Contexto:** o guia com `id: "davi-brito"` aparece como "David Calab" na versão em português, enquanto o restante do código (incluindo a versão em inglês) usa "Davi Brito".
- **Risco:** a inconsistência causa exibição incorreta do nome ao alternar para o português.
- **Tarefa sugerida:** ajustar o valor de `name` para "Davi Brito" na tradução em português.

## Correção de bug funcional
- **Arquivos:** `front-end/src/pages/GuidesPage.tsx`, `front-end/src/i18n/translations.ts`
- **Problema:** ao abrir o modal de detalhes de um guia e alternar o idioma, o estado `selectedGuide` mantém os dados do idioma anterior. Isso faz com que o modal mostre textos em português mesmo após mudar para inglês (ou vice-versa).
- **Impacto:** experiência inconsistente e confusa para quem alterna idiomas com o modal aberto; dados podem ficar mistos no envio do agendamento.
- **Tarefa sugerida:** sincronizar `selectedGuide` com a lista atual de guias (por exemplo, reaplicando o `id` ao mudar `content.guides` ou fechando o modal) para garantir que os dados reflitam o idioma ativo.

## Ajuste de documentação/comentário
- **Arquivo:** `front-end/README.md`
- **Observação:** o README afirma que a interface foca apenas na página "Home", mas o projeto já possui páginas de Guias, Agendamento e Fauna & Flora.
- **Efeito:** documentação desatualizada pode confundir quem consulta o repositório.
- **Tarefa sugerida:** atualizar a descrição para refletir todas as páginas atualmente implementadas e como navegar entre elas.

## Melhoria de testes
- **Arquivo alvo:** `front-end/src/App.tsx`
- **Cenário:** a função `normalizePath` e a lógica de navegação manual gerenciam rotas, query strings e fallback para rotas desconhecidas, mas não há testes automatizados que cubram esses comportamentos.
- **Risco:** regressões em roteamento (ex.: barras finais, buscas repetidas) podem passar despercebidas.
- **Tarefa sugerida:** adicionar testes com `vitest` (ou similar) para validar `normalizePath`, mudança de rotas e o fallback para `/` quando um caminho inválido é acessado.
