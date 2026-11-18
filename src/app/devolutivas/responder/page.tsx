import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import "@/app/cpa.css";
import { BarraInstitucional } from "@/components/barra-institucional";
import { FormResposta } from "@/components/devolutivas/form-resposta";
import { Button } from "@/components/ui/button";
import { exigirAdmin } from "@/lib/auth";
import { band, box, size, u } from "@/lib/cpa-box";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Responder Devolutiva · Portal CPA" };

export default async function PaginaResponderDevolutiva() {
  await exigirAdmin();

  const [areasDb, statusDb] = await Promise.all([
    prisma.areas.findMany({ orderBy: { nome_area: "asc" } }),
    prisma.status_respostas.findMany({ orderBy: { id: "asc" } }),
  ]);

  const areas = areasDb.map((a) => a.nome_area);
  const categorias = statusDb
    .filter((s) => Boolean(s.status?.trim()))
    .map((s) => ({
      id: s.id.toString(),
      rotulo: s.status!.trim(),
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
          <h1 style={{ fontSize: u(36) }}>Responder Devolutiva</h1>
        </BarraInstitucional>

        <main style={{ display: "contents" }}>
          <section
            className="cpa-card cpa-center"
            style={{ ...size(640, 396), top: `calc(50% + ${u(20)})` }}
            aria-label="Resposta da devolutiva"
          >
            <FormResposta areas={areas} categorias={categorias} />
          </section>
        </main>
      </div>
    </div>
  );
}