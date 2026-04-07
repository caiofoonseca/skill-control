import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Skill Control",
  description: "Painel administrativo do SkillEd Idiomas - Graças, Recife.",
  icons: {
    icon: "/brand/skill-logo.png",
    shortcut: "/brand/skill-logo.png",
    apple: "/brand/skill-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
