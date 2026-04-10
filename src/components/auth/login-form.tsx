"use client";

import { useEffect } from "react";

const TAB_SESSION_KEY = "skill-control-tab-session";

type LoginFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  error?: string;
};

export function LoginForm({ action, error }: LoginFormProps) {
  useEffect(() => {
    sessionStorage.removeItem(TAB_SESSION_KEY);
  }, []);

  return (
    <form
      action={action}
      className="space-y-4"
      onSubmit={() => {
        sessionStorage.setItem(TAB_SESSION_KEY, "active");
      }}
    >
      <div className="space-y-2">
        <label
          htmlFor="email"
          className="text-sm font-semibold text-[var(--foreground)]"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="voce@skilledidiomas.com"
          className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-[var(--foreground)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[rgba(236,28,36,0.16)]"
          required
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="text-sm font-semibold text-[var(--foreground)]"
        >
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Digite sua senha"
          className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-[var(--foreground)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[rgba(236,28,36,0.16)]"
          required
        />
      </div>

      {error ? (
        <div className="rounded-2xl border border-[rgba(180,83,9,0.18)] bg-[rgba(255,247,237,0.92)] px-4 py-3 text-sm text-[rgb(146,64,14)]">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        className="w-full rounded-2xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[rgba(236,28,36,0.24)] transition hover:bg-[var(--primary-strong)]"
      >
        Entrar no painel
      </button>
    </form>
  );
}
