# Modelagem Inicial do Banco

## Objetivo

Definir uma estrutura de dados simples, organizada e fácil de evoluir para o cadastro de alunos do SkillEd Idiomas.

## O que vamos usar na primeira versão

Para começar com boa organização sem complicar demais, a modelagem inicial terá 3 tabelas principais:

- `students`
- `student_guardians`
- `student_financial_contacts`

## Por que essa estrutura

- O aluno fica em uma tabela própria com os dados principais.
- Os responsáveis 1 e 2 ficam em uma tabela separada, com um campo para identificar o tipo.
- O responsável financeiro fica separado porque tem endereço próprio e papel diferente.
- O campo `dados_pagamento` fica no aluno como texto livre, porque ainda não existe uma regra fixa.

## Visão geral das tabelas

### `students`

Armazena os dados principais do aluno.

Campos iniciais:

- `id` uuid pk
- `created_at` timestamptz
- `updated_at` timestamptz
- `full_name` text
- `address` text
- `address_number` text
- `apartment` text nullable
- `neighborhood` text
- `city` text
- `state` text
- `zip_code` text
- `instagram` text nullable
- `email` text nullable
- `birth_date` date nullable
- `cpf` text nullable
- `rg` text nullable
- `phone` text nullable
- `profession` text nullable
- `class_name` text nullable
- `schedule` text nullable
- `teacher_name` text nullable
- `payment_notes` text nullable

### `student_guardians`

Armazena os responsáveis 1 e 2.

Campos iniciais:

- `id` uuid pk
- `student_id` uuid fk -> students.id
- `created_at` timestamptz
- `updated_at` timestamptz
- `guardian_type` text
- `full_name` text
- `cpf` text nullable
- `profession` text nullable
- `company` text nullable
- `phone` text nullable
- `work_phone` text nullable
- `email` text nullable
- `instagram` text nullable

Valores iniciais de `guardian_type`:

- `primary`
- `secondary`

### `student_financial_contacts`

Armazena o responsável financeiro.

Campos iniciais:

- `id` uuid pk
- `student_id` uuid fk -> students.id
- `created_at` timestamptz
- `updated_at` timestamptz
- `full_name` text
- `cpf` text nullable
- `address` text nullable
- `profession` text nullable
- `company` text nullable
- `phone` text nullable
- `work_phone` text nullable
- `email` text nullable

## Relacionamentos

- Um `student` pode ter zero, um ou dois registros em `student_guardians`
- Um `student` pode ter zero ou um registro em `student_financial_contacts`

## Regras práticas da primeira versão

- CPF, RG, Instagram e email podem começar como opcionais
- Endereço do aluno será dividido em campos simples para facilitar busca e edição
- `payment_notes` será um campo livre grande, para observações sem estrutura fixa
- Os nomes das colunas estão em inglês para manter consistência com código e banco

## Exemplo conceitual

```text
students
  └─ 1 aluno
      ├─ 0..2 student_guardians
      └─ 0..1 student_financial_contacts
```

## Campos que podemos adicionar depois sem quebrar a base

- status do aluno
- data de matrícula
- observações pedagógicas
- nível de idioma
- modalidade
- histórico de pagamentos estruturado
- anexos e documentos

## Decisão desta etapa

Vamos seguir com modelagem relacional simples.
Ela é melhor do que colocar tudo em uma tabela gigante e continua fácil de manter para esse cenário.
