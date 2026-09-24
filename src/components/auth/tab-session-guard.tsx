"use client";

import { useEffect, useState } from "react";

import { isTabSessionActive } from "@/lib/auth/tab-session";

export function TabSessionGuard() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (isTabSessionActive()) {
      queueMicrotask(() => setIsReady(true));
      return;
    }

    fetch("/api/auth/logout", {
      method: "POST",
      keepalive: true,
    }).finally(() => {
      window.location.replace("/login?error=Sessão+encerrada.+Faça+login+novamente.");
    });
  }, []);

  if (isReady) {
    return null;
  }

  return <div className="fixed inset-0 z-[999] bg-[var(--background)]" />;
}
