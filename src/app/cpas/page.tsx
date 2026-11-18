import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import "@/app/cpa.css";
import { BarraInstitucional } from "@/components/barra-institucional";
import { PainelCpas } from "@/components/cpas/painel-cpas";
import { Button } from "@/components/ui/button";
import { exigirAdmin, normalizarPerfil } from "@/lib/auth";
import { band, box, u } from "@/lib/cpa-box";
import type { CpaItem } from "@/lib/cpas-data";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Gerenciar CPAs · Portal CPA" };

export default async function PaginaCpas() {
  await exigirAdmin();

  const registros = await prisma.cpas.findMany({
    orderBy: [{ is_active: "desc" }, { ano: "desc" }, { semestre: "desc" }, { id: "desc" }],
  });

  const cpas: CpaItem[] = registros.map((item) => ({
    id: Number(item.id),
    title: item.title ?? "Pesquisa CPA",
    ano: Number(item.ano ?? new Date().getFullYear()),
    semestre: Number(item.semestre ?? 1),
    form_link: item.form_link,
    is_active: Boolean(item.is_active),
    perfil_permitido: normalizarPerfil(item.perfis_permitidos?.[0]),
  }));

  return (
    <div className="cpa-root">
      <div className="cpa-stage">
        <BarraInstitucional as="header" style={band({ left: 10, right: 10, top: 13, h: 68 })}>
          <Button
            asChild
            className="cpa-btn cpa-btn--ghost"
            style={box(34, 17, 40, 34, { borderRadius: u(17) })}
          >
            <Link href="/inicio" aria-label="Voltar" title="Voltar">
              <ArrowLeft aria-hidden style={{ width: u(26), height: u(26) }} />
            </Link>
          </Button>
          <h1 style={{ fontSize: u(36) }}>Gerenciar CPAs</h1>
        </BarraInstitucional>

        <main style={{ display: "contents" }}>
          <div className="cpa-panel" style={band({ left: 14, right: 14, top: 96, bottom: 72 })}>
            <PainelCpas cpasIniciais={cpas} />
          </div>
        </main>

        <BarraInstitucional as="footer" style={band({ left: 14, right: 14, bottom: 14, h: 44 })} />
      </div>
    </div>
  );
}