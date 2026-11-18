import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import "@/app/cpa.css";
import { BarraInstitucional } from "@/components/barra-institucional";
import { CartaoCpa } from "@/components/resultados/cartao-cpa";
import { Button } from "@/components/ui/button";
import { exigirUsuarioLogado, type PerfilCpa } from "@/lib/auth";
import { band, box, u } from "@/lib/cpa-box";
import type { DashboardCpa } from "@/lib/dashboards-data";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Resultados da Pesquisa CPA · Portal CPA" };

export default async function PaginaResultados() {
  const usuario = await exigirUsuarioLogado();

  const registros = await prisma.dashboards_cpa.findMany({
    where: {
      ativo: true,
      perfis_permitidos: { has: usuario.role },
    },
    orderBy: [{ ordem: "asc" }, { id: "asc" }],
  });

  const dashboards: DashboardCpa[] = registros.map((item) => ({
    id: Number(item.id),
    titulo: item.titulo,
    embed_url: item.embed_url,
    embed_url_externo: item.embed_url_externo,
    ordem: item.ordem,
    ativo: item.ativo,
    perfis: item.perfis_permitidos as PerfilCpa[],
  }));

  const usarLinkExterno = usuario.role === "avaliador_externo";

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
          <h1 style={{ fontSize: u(36) }}>Resultados da Pesquisa CPA</h1>
        </BarraInstitucional>

        <main style={{ display: "contents" }}>
          <div className="cpa-results" style={band({ left: 32, right: 22, top: 100, bottom: 16 })}>
            {dashboards.length === 0 ? (
              <div
                className="cpa-panel"
                style={{
                  position: "relative",
                  minHeight: u(260),
                  display: "grid",
                  placeItems: "center",
                  fontSize: u(18),
                  color: "var(--cpa-line)",
                }}
              >
                Nenhum painel de resultados disponível para o seu perfil no momento.
              </div>
            ) : (
              dashboards.map((dashboard, i) => (
                <CartaoCpa
                  key={dashboard.id}
                  dashboard={dashboard}
                  aberto={i === 0}
                  usarLinkExterno={usarLinkExterno}
                />
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}