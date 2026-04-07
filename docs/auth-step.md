# Etapa 7: Autenticacao e Controle de Acesso

## Objetivo

Permitir acesso apenas a usuarios autorizados e bloquear a area interna para qualquer pessoa sem login.

## O que foi feito no codigo

- criada rota de login em `/login`
- criada area protegida em `/dashboard`
- criada verificacao de sessao no servidor
- criado middleware para manter a sessao do Supabase
- criado logout

## O que voce precisa configurar no Supabase

### 1. Desabilitar cadastro publico

1. Abra `Authentication`
2. Abra `Providers`
3. Entre em `Email`
4. Desative `Enable email signups`
5. Salve

### 2. Criar os usuarios dos seus pais

1. Abra `Authentication`
2. Abra `Users`
3. Clique em `Add user`
4. Crie um usuario para cada um
5. Defina senha para cada conta

## Como testar

1. Rode `npm run dev`
2. Abra `http://localhost:3000`
3. O sistema deve levar para `/login`
4. Entre com um usuario criado no Supabase
5. O sistema deve abrir `/dashboard`
6. Clique em `Sair` para validar o logout
