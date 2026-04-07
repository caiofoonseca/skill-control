"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    description: "Visão geral",
  },
  {
    href: "/students",
    label: "Gerenciamento de Alunos",
    description: "Consulta e gestão",
  },
  {
    href: "/classes",
    label: "Gerenciamento de Turmas",
    description: "Cadastro e organização",
  },
  {
    href: "/teachers",
    label: "Gerenciamento de Professores",
    description: "Cadastro e organização",
  },
  {
    href: "/reports",
    label: "Relatórios",
    description: "Exportações",
  },
];

export function SidebarNavV2() {
  const pathname = usePathname();

  return (
    <nav className="space-y-2">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`block rounded-2xl border px-4 py-3 transition ${
              isActive
                ? "border-[rgba(236,28,36,0.22)] bg-[rgba(236,28,36,0.08)] text-[var(--foreground)] shadow-sm"
                : "border-transparent text-[var(--muted-foreground)] hover:border-[var(--border)] hover:bg-white"
            }`}
          >
            <div className="text-sm font-semibold">{item.label}</div>
            <div className="mt-1 text-xs">{item.description}</div>
          </Link>
        );
      })}
    </nav>
  );
}
