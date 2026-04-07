# Etapa 6: Criacao do Banco no Supabase

## Objetivo

Criar a estrutura inicial do banco de dados no Supabase para armazenar alunos, responsaveis e responsavel financeiro.

## Arquivo SQL do projeto

O SQL desta etapa foi salvo em:

- `supabase/migrations/20260406_000001_initial_schema.sql`

## O que esse SQL cria

- funcao para atualizar `updated_at` automaticamente
- tabela `students`
- tabela `student_guardians`
- tabela `student_financial_contacts`
- indices basicos para busca
- relacoes entre as tabelas
- `row level security` habilitado

## Como executar no painel do Supabase

1. No menu lateral, clique em `SQL Editor`
2. Clique em `New query`
3. Abra o arquivo `supabase/migrations/20260406_000001_initial_schema.sql` no VS Code
4. Copie todo o conteudo
5. Cole no editor do Supabase
6. Clique em `Run`

## Como validar se deu certo

Depois de rodar o SQL:

1. Abra `Table Editor`
2. Confirme se existem estas tabelas:
   - `students`
   - `student_guardians`
   - `student_financial_contacts`

## Observacao importante

Nesta etapa habilitamos `RLS`, mas ainda nao criamos as policies.
Isso foi intencional.
Vamos criar as regras de acesso junto com a autenticacao, para manter tudo alinhado e seguro.
