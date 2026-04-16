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
    <nav className="space-y-1.5">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`block rounded-[18px] border px-3.5 py-2.5 transition ${
              isActive
                ? "border-[rgba(236,28,36,0.22)] bg-[rgba(236,28,36,0.08)] text-[var(--foreground)] shadow-sm"
                : "border-transparent text-[var(--muted-foreground)] hover:border-[var(--border)] hover:bg-white"
            }`}
          >
            <div className="text-[13px] font-semibold leading-[1.15]">
              {item.label}
            </div>
            <div className="mt-0.5 text-[11px] leading-4">{item.description}</div>
          </Link>
        );
      })}
    </nav>
  );
}
