# Gestão Escolar - Skill Idiomas

Aplicação web administrativa da **Skill Idiomas - Graças, Recife**, criada para uso interno da equipe da escola.

O sistema reúne em um único painel o cadastro de alunos, turmas, professores, responsáveis, pagamentos e exportações, com acesso restrito por login.

## Objetivo

O projeto foi pensado para facilitar a rotina administrativa da unidade, reduzindo controles espalhados e centralizando as informações mais importantes do dia a dia escolar.

Na prática, ele ajuda a equipe a:

- organizar o cadastro dos alunos
- acompanhar turmas e professores
- registrar responsáveis e contato financeiro
- controlar pagamentos e parcelas
- exportar dados para acompanhamento externo

## Como a aplicação funciona

Depois do login, o usuário entra em um painel privado com os principais módulos de gestão da escola.

### Dashboard

Apresenta uma visão geral do sistema, com indicadores como:

- total de alunos cadastrados
- quantidade de turmas
- quantidade de professores
- aniversariantes do mês

### Gerenciamento de alunos

É o módulo principal da aplicação.

Nele é possível:

- cadastrar alunos
- editar cadastros existentes
- visualizar detalhes completos
- excluir com confirmação
- marcar aluno como ativo ou inativo
- informar idioma e origem do aluno
- vincular turma e professor
- registrar responsáveis
- registrar responsável financeiro

O formulário também possui validações para evitar erros de preenchimento, incluindo CPF, e-mail, CEP, telefone e outros campos importantes.

### Gerenciamento de turmas

Permite cadastrar, editar e excluir turmas, associando cada uma ao professor responsável.

No sistema, o nome da turma já pode incluir o horário, no formato usado pela operação da escola, como por exemplo:

`KIDS CLASS - 15H30 - 17H30`

### Gerenciamento de professores

Permite cadastrar os professores da unidade e acompanhar:

- quantos alunos estão vinculados a cada professor
- quais turmas estão associadas a ele

### Pagamentos

A aplicação permite registrar pagamentos no cadastro inicial do aluno ou depois, de forma separada.

Os tipos atualmente trabalhados no sistema são:

- Matrícula
- Matrícula + 1ª Parcela
- Parcelas
- Curso à vista
- Material Didático
- Entrada

Também há suporte a:

- valores formatados em moeda
- geração de parcelas
- preenchimento automático da forma de pagamento
- ajuste individual de parcelas quando necessário

### Relatórios e exportação

O sistema permite exportar dados em CSV para facilitar consultas e controles fora da plataforma.

As exportações podem ser feitas:

- com a base geral de alunos
- por turma
- por professor

## Principais funcionalidades

- autenticação com acesso restrito
- dashboard administrativo
- CRUD de alunos
- CRUD de turmas
- CRUD de professores
- controle de pagamentos e parcelas
- validação de campos sensíveis
- confirmação visual antes de excluir
- exportação de dados em CSV
- listagem de aniversariantes do mês

## Tecnologias utilizadas

- **Next.js 16**
- **React 19**
- **TypeScript**
- **Tailwind CSS 4**
- **Supabase**
- **Vercel**

## Deploy

O projeto está preparado para deploy na **Vercel**, usando o **Supabase** como backend e autenticação.

---

Sistema desenvolvido para apoiar a operação administrativa da **Skill Idiomas**.
