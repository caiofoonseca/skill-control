import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gestão Escolar - Skill Idiomas",
  description: "Gestão escolar da Skill Idiomas - Graças, Recife.",
  icons: {
    icon: "/brand/skill-favicon.svg",
    shortcut: "/brand/skill-favicon.svg",
    apple: "/brand/skill-favicon.svg",
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
