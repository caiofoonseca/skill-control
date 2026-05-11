"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    description: "Visao geral",
  },
  {
    href: "/students",
    label: "Gerenciamento de Alunos",
    description: "Consulta e gestao",
  },
  {
    href: "/classes",
    label: "Gerenciamento de Turmas",
    description: "Cadastro e organizacao",
  },
  {
    href: "/books",
    label: "Cadastro de Livros",
    description: "Nomes padronizados",
  },
  {
    href: "/teachers",
    label: "Gerenciamento de Professores",
    description: "Cadastro e organizacao",
  },
  {
    href: "/users",
    label: "Cadastro de Usuarios",
    description: "Perfis e permissoes",
  },
  {
    href: "/reports",
    label: "Relatorios",
    description: "Exportacoes",
  },
];

export function SidebarNavV2() {
  const pathname = usePathname();

  return (
    <nav className="space-y-0.5">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`block rounded-[13px] border px-3.5 py-1.5 transition ${
              isActive
                ? "border-[rgba(236,28,36,0.22)] bg-[rgba(236,28,36,0.08)] text-[var(--foreground)] shadow-sm"
                : "border-transparent text-[var(--muted-foreground)] hover:border-[var(--border)] hover:bg-white"
            }`}
          >
            <div className="text-[13px] font-semibold leading-tight">
              {item.label}
            </div>
            <div className="mt-0.5 text-[10.5px] leading-4">{item.description}</div>
          </Link>
        );
      })}
    </nav>
  );
}
