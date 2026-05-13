"use client";

import { useEffect } from "react";
import { useState } from "react";

const TAB_SESSION_KEY = "skill-control-tab-session";

type LoginFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  error?: string;
};

export function LoginForm({ action, error }: LoginFormProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

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
        <div className="relative">
          <input
            id="password"
            name="password"
            type={isPasswordVisible ? "text" : "password"}
            placeholder="Digite sua senha"
            className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 pr-12 text-[var(--foreground)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[rgba(236,28,36,0.16)]"
            required
          />
          <button
            type="button"
            aria-label={isPasswordVisible ? "Ocultar senha" : "Mostrar senha"}
            aria-pressed={isPasswordVisible}
            onClick={() => setIsPasswordVisible((current) => !current)}
            className="group absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-[var(--muted-foreground)] transition hover:bg-[var(--panel)] hover:text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[rgba(236,28,36,0.16)]"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-5 w-5 transition duration-200 group-active:scale-90"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            >
              <path
                d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"
                className="transition duration-200"
              />
              <circle
                cx="12"
                cy="12"
                r="3"
                className={`origin-center transition duration-200 ${
                  isPasswordVisible ? "scale-100 opacity-100" : "scale-75 opacity-70"
                }`}
              />
              <path
                d="M4 20 20 4"
                className={`origin-center transition duration-200 ${
                  isPasswordVisible ? "scale-75 opacity-0" : "scale-100 opacity-100"
                }`}
              />
            </svg>
          </button>
        </div>
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
