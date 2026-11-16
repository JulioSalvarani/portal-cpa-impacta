import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import "@/app/cpa.css";
import { BarraInstitucional } from "@/components/barra-institucional";
import { Button } from "@/components/ui/button";
import { band, box, size, u } from "@/lib/cpa-box";

export const metadata: Metadata = { title: "Pesquisa CPA · Portal CPA" };

/** Página provisória: destino do botão "Acessar" no protótipo. Na versão final o botão abre direto o Google Forms da pesquisa ativa (campo `form_link` da tabela `cpas`) e esta página deixa de ser necessária (registro 0017). */
export default function PaginaPesquisa() {
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
          <h1 style={{ fontSize: u(36) }}>Pesquisa CPA 2026/2</h1>
        </BarraInstitucional>

        <main style={{ display: "contents" }}>
          <p className="cpa-note cpa-center" style={size(600, 40)}>
            O botão Acessar abrirá o formulário do Google Forms da pesquisa ativa.
          </p>
        </main>
      </div>
    </div>
  );
}
