# Etapa 9: Cadastro Inicial e Listagem de Alunos

## Objetivo

Sair da base visual e colocar o primeiro fluxo real de CRUD para funcionar: cadastrar aluno e listar registros salvos.

## O que foi feito

- tipagem do Supabase para as tabelas principais
- formulario completo de cadastro de aluno
- salvamento de aluno, responsaveis e responsavel financeiro
- listagem real de alunos na rota `/students`
- mensagem de sucesso apos cadastro

## Rotas desta etapa

- `/students`
- `/students/new`

## Como testar

1. Rode `npm run dev`
2. Entre no sistema
3. Abra `/students/new`
4. Cadastre um aluno de teste
5. Ao salvar, o sistema deve voltar para `/students`
6. Confirme se o aluno aparece na listagem
