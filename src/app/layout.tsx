import type { Metadata } from "next";
import "./globals.css";
import "./cpa.css";
import { Share_Tech_Mono } from "next/font/google";
import { cn } from "@/lib/utils";

const shareTechMono = Share_Tech_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-ui",
});

export const metadata: Metadata = {
  title: "Portal CPA · Faculdade Impacta",
  description: "Portal da Comissão Própria de Avaliação — Faculdade Impacta",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={cn("h-full antialiased", shareTechMono.variable)}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}