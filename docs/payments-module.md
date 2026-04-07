# Módulo Financeiro

## Objetivo

Estruturar a parte financeira do sistema para registrar:

- taxa de matrícula
- taxa de rematrícula
- mensalidades
- parcelamento
- estado de cada parcela
- forma de pagamento
- observações por parcela
- livro atual do aluno

## Regra combinada

### 1. Taxa inicial

O aluno pode pagar:

- `matrícula`
- `rematrícula`

Para essa cobrança, o sistema precisa guardar:

- valor
- data do pagamento
- forma de pagamento

### 2. Mensalidades

Depois disso, o sistema pode receber um novo pagamento de mensalidade com:

- valor total
- indicação se foi parcelado ou não
- número de parcelas, quando houver parcelamento

Cada parcela precisa ter:

- valor da parcela
- método de pagamento
- data do pagamento
- estado do pagamento
- descrição

## Ajuste importante de modelagem

Para a operação ficar mais segura, vamos usar duas datas nas parcelas:

- `due_date`
  - data prevista da parcela
- `paid_at`
  - data em que a parcela foi efetivamente paga

Isso ajuda porque uma parcela `pendente` normalmente ainda não tem data real de pagamento.

## Estrutura proposta

### `students`

Adicionar:

- `current_book` text nullable

Objetivo:

- guardar qual livro o aluno está usando no momento

### `student_payment_plans`

Representa um conjunto de pagamento.

Exemplos:

- taxa de matrícula
- taxa de rematrícula
- mensalidade paga à vista
- mensalidade parcelada

Campos:

- `id` uuid pk
- `student_id` uuid fk -> students.id
- `created_at` timestamptz
- `updated_at` timestamptz
- `payment_type` text
- `title` text
- `total_amount` numeric(10,2)
- `is_installment` boolean
- `installment_count` integer
- `default_payment_method` text nullable
- `notes` text nullable

Valores iniciais de `payment_type`:

- `enrollment_fee`
- `re_enrollment_fee`
- `monthly_payment`

### `student_payment_installments`

Representa cada parcela ou pagamento unitário.

Campos:

- `id` uuid pk
- `payment_plan_id` uuid fk -> student_payment_plans.id
- `student_id` uuid fk -> students.id
- `created_at` timestamptz
- `updated_at` timestamptz
- `installment_number` integer
- `amount` numeric(10,2)
- `payment_method` text nullable
- `due_date` date nullable
- `paid_at` date nullable
- `status` text
- `description` text nullable

Valores iniciais de `status`:

- `pending`
- `resolved`

## Como isso funciona na prática

### Taxa de matrícula ou rematrícula

Criamos um `student_payment_plan` com:

- `payment_type = enrollment_fee` ou `re_enrollment_fee`
- `total_amount = valor da taxa`
- `is_installment = false`
- `installment_count = 1`

E criamos uma única linha em `student_payment_installments` com:

- `installment_number = 1`
- `amount = valor da taxa`
- `payment_method`
- `paid_at`
- `status = resolved` se já foi pago

### Mensalidade à vista

Criamos um `student_payment_plan` com:

- `payment_type = monthly_payment`
- `total_amount = valor total`
- `is_installment = false`
- `installment_count = 1`

E uma parcela única.

### Mensalidade parcelada

Criamos um `student_payment_plan` com:

- `payment_type = monthly_payment`
- `total_amount = valor total`
- `is_installment = true`
- `installment_count = número de parcelas`

Depois criamos as parcelas em `student_payment_installments`.

Exemplo:

- total: `2000`
- parcelas: `10`

Resultado:

- 10 linhas de parcelas
- cada uma começa com status `pending`
- depois seus pais podem marcar como `resolved`

## Benefícios dessa estrutura

- permite taxa e mensalidade sem gambiarra
- suporta pagamento à vista e parcelado
- deixa cada parcela com status próprio
- facilita relatórios financeiros depois
- mantém o aluno ligado ao livro atual

## Próxima implementação

Depois da modelagem, a sequência ideal é:

1. criar as tabelas no Supabase
2. atualizar os tipos do projeto
3. adicionar o campo `livro atual` no cadastro do aluno
4. criar a tela de plano de pagamento
5. gerar parcelas automaticamente
6. mostrar tabela de parcelas no detalhe do aluno
