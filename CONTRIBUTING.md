# Guia de Contribuição

Obrigado por considerar contribuir com o AgenDunas! Este documento fornece diretrizes para contribuições.

## 🚀 Como Contribuir

### 1. Fork e Clone

1. Faça um fork do repositório
2. Clone seu fork:
```bash
git clone https://github.com/seu-usuario/agendunas.git
cd agendunas
```

### 2. Configuração do Ambiente

Siga as instruções do [README.md](./README.md) para configurar o ambiente de desenvolvimento.

### 3. Criar uma Branch

```bash
git checkout -b feature/nova-funcionalidade
# ou
git checkout -b fix/correcao-bug
```

### 4. Desenvolvimento

- Siga os padrões de código existentes
- Escreva código limpo e bem documentado
- Adicione testes para novas funcionalidades
- Certifique-se de que os testes passam: `npm run test`

### 5. Commits

Use mensagens de commit descritivas:

```bash
git commit -m "feat: adiciona funcionalidade X"
git commit -m "fix: corrige bug Y"
git commit -m "docs: atualiza documentação"
```

Prefira usar o padrão [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação
- `refactor:` Refatoração
- `test:` Testes
- `chore:` Tarefas de manutenção

### 6. Push e Pull Request

```bash
git push origin feature/nova-funcionalidade
```

Depois, abra um Pull Request no repositório original.

## 📋 Padrões de Código

### TypeScript

- Use TypeScript estrito
- Evite `any`, prefira tipos específicos
- Documente funções complexas com JSDoc

### React

- Use componentes funcionais
- Prefira hooks sobre classes
- Mantenha componentes pequenos e focados
- Use TypeScript para props

### Back-end

- Siga a estrutura de pastas existente
- Use async/await para operações assíncronas
- Valide todos os inputs com Zod
- Use o logger para logs estruturados

## 🧪 Testes

- Escreva testes para novas funcionalidades
- Mantenha cobertura de testes acima de 70%
- Teste casos de sucesso e erro

## 📝 Documentação

- Atualize a documentação quando necessário
- Adicione comentários para código complexo
- Documente APIs públicas

## ✅ Checklist antes de PR

- [ ] Código segue os padrões do projeto
- [ ] Testes passam (`npm run test`)
- [ ] Linter passa (`npm run lint`)
- [ ] Documentação atualizada
- [ ] Commits seguem Conventional Commits
- [ ] Não há console.logs desnecessários
- [ ] Variáveis de ambiente documentadas (se novas)

## 🎯 Áreas que Precisam de Contribuição

- Testes (aumentar cobertura)
- Documentação
- Acessibilidade
- Performance
- Internacionalização

## 📞 Dúvidas?

Abra uma issue para discutir mudanças maiores antes de começar a trabalhar.

Obrigado por contribuir! 🎉

