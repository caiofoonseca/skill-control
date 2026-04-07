# Etapa 5: Configuracao do Supabase

## Objetivo

Preparar o projeto para conectar com o Supabase com seguranca e de forma simples.

## O que foi feito no codigo

- instaladas as bibliotecas oficiais do Supabase
- criado arquivo de exemplo das variaveis de ambiente
- criada camada utilitaria para acessar o Supabase no browser e no servidor

## Variaveis de ambiente que vamos usar

Crie um arquivo chamado `.env.local` na raiz do projeto com:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Onde encontrar esses dados no Supabase

Depois de criar seu projeto no Supabase:

1. abra o painel do projeto
2. entre em `Project Settings`
3. abra a secao `API`
4. copie:
   - `Project URL` -> `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` -> `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Regras importantes

- Use apenas a `anon public key` no app Next.js
- Nao coloque a `service_role key` no frontend
- O acesso sensivel sera protegido por autenticacao e politicas do banco

## Como validar esta etapa

Depois de preencher o `.env.local`, rode:

```bash
npm run lint
```

Mais adiante, quando adicionarmos autenticacao, a conexao passara a ser usada de verdade.
