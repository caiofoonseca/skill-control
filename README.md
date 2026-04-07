# Skill Control

Painel administrativo privado do **SkillEd Idiomas - Graças, Recife** para uso interno da equipe gestora.

## Objetivo

Construir uma aplicação web simples, bonita, segura e fácil de manter para:

- fazer login com acesso restrito
- visualizar um dashboard interno
- cadastrar, editar, consultar e excluir alunos
- buscar e filtrar registros
- visualizar detalhes completos de cada aluno
- exportar dados para CSV/planilha

## Stack escolhida

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase
- Vercel

## Princípios do projeto

- interface profissional, acolhedora e limpa
- fluxo simples para dois usuários internos
- autenticação segura sem cadastro público
- estrutura fácil de evoluir
- deploy simples

## Estratégia de construção

Vamos construir em etapas pequenas e validadas:

1. Visão geral do projeto
2. Estrutura de pastas
3. Modelagem inicial do banco
4. Criação do projeto Next.js
5. Configuração do Supabase
6. Autenticação e controle de acesso
7. Layout base
8. Telas principais
9. CRUD de alunos
10. Exportação de dados
11. Revisão final
12. Deploy na Vercel

## Decisões iniciais

### Acesso

O sistema terá autenticação privada via Supabase Auth.
Não haverá cadastro público aberto.
Somente contas criadas manualmente por você no Supabase poderão entrar.

### Modelagem inicial

Para começar com simplicidade e boa manutenção, a base será organizada em:

- `students`
- `student_guardians`
- `student_financial_contacts`

Assim conseguimos manter os dados bem estruturados sem complicar cedo demais.

### Exportação

A exportação inicial será em CSV, por ser simples, estável e fácil de abrir no Excel.
Se depois vocês quiserem, podemos evoluir para `.xlsx`.

### Direção visual

Se houver referência visual pública da marca, ela será usada como base.
Se não houver material suficiente, a interface seguirá uma identidade:

- profissional
- educacional
- acolhedora
- elegante
- clara e moderna

## Resultado esperado da primeira versão

Ao final da primeira entrega, o sistema deverá permitir:

- login seguro
- acesso apenas à área interna
- dashboard com visão geral
- CRUD completo de alunos
- confirmação antes de excluir
- busca e filtros
- exportação dos dados cadastrados

## Como vamos trabalhar

Em cada etapa vamos definir:

- o objetivo da etapa
- o que será feito agora
- os arquivos criados ou editados
- o código necessário naquele momento
- como validar rapidamente

Sem pular etapas.
