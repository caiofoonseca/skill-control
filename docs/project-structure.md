# Estrutura de Pastas

## Objetivo

Organizar o repositório antes da criação do app para manter código, banco e documentação em lugares previsíveis.

## Estrutura inicial

```text
Skill Control/
├─ docs/
│  └─ project-structure.md
├─ scripts/
│  └─ .gitkeep
├─ supabase/
│  └─ .gitkeep
├─ .gitignore
└─ README.md
```

## Estrutura planejada após criar o Next.js

```text
Skill Control/
├─ docs/
│  ├─ project-structure.md
│  └─ db-model.md
├─ public/
├─ scripts/
├─ src/
│  ├─ app/
│  │  ├─ (auth)/
│  │  │  └─ login/
│  │  ├─ (dashboard)/
│  │  │  ├─ dashboard/
│  │  │  └─ students/
│  │  ├─ api/
│  │  ├─ globals.css
│  │  ├─ layout.tsx
│  │  └─ page.tsx
│  ├─ components/
│  │  ├─ layout/
│  │  ├─ students/
│  │  └─ ui/
│  ├─ lib/
│  │  ├─ auth/
│  │  ├─ supabase/
│  │  ├─ utils/
│  │  └─ validations/
│  ├─ types/
│  └─ hooks/
├─ supabase/
│  ├─ migrations/
│  └─ seed/
├─ .env.local
├─ components.json
├─ next.config.ts
├─ package.json
├─ tailwind.config.ts
└─ tsconfig.json
```

## Papel de cada pasta

- `docs/`: documentação curta e objetiva do projeto
- `scripts/`: scripts utilitários, exportações e automações simples
- `supabase/`: migrations, anotações de banco e arquivos relacionados ao Supabase
- `src/app/`: rotas, páginas e layouts do Next.js App Router
- `src/components/`: componentes reutilizáveis de interface
- `src/lib/`: integrações, helpers e regras compartilhadas
- `src/types/`: tipos do TypeScript
- `src/hooks/`: hooks customizados, se forem necessários

## Decisões importantes

- Vamos usar `src/` para separar melhor código de aplicação dos arquivos de configuração.
- As rotas privadas ficarão agrupadas em `(dashboard)`.
- A autenticação ficará separada em `(auth)` para manter o fluxo de login isolado.
- A pasta `supabase/` já nasce no repositório para receber migrations depois.
