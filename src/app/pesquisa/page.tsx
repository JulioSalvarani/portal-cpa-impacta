import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import "@/app/cpa.css";
import { BarraInstitucional } from "@/components/barra-institucional";
import { Button } from "@/components/ui/button";
import { box, u } from "@/lib/cpa-box";

export const metadata: Metadata = { title: "Pesquisa CPA · Portal CPA" };

/** Página provisória: destino do botão "Acessar". O formulário da pesquisa ainda não foi especificado. */
export default function PaginaPesquisa() {
  return (
    <div className="cpa-root">
      <div className="cpa-stage">
        <BarraInstitucional as="header" style={box(10, 13, 940, 68)} />
        <Button
          asChild
          className="cpa-btn cpa-btn--ghost"
          style={box(44, 30, 40, 34, { borderRadius: u(17) })}
        >
          <Link href="/inicio" aria-label="Voltar" title="Voltar">
            <ArrowLeft aria-hidden style={{ width: u(26), height: u(26) }} />
          </Link>
        </Button>
        <h1
          className="cpa-pill"
          style={box(10, 13, 940, 68, { background: "transparent", fontSize: u(36), pointerEvents: "none" })}
        >
          Pesquisa CPA 2026/2
        </h1>

        <main style={{ display: "contents" }}>
          <p className="cpa-note" style={box(180, 250, 600, 40)}>
            O formulário de preenchimento da pesquisa será construído nesta área.
          </p>
        </main>
      </div>
    </div>
  );
}
