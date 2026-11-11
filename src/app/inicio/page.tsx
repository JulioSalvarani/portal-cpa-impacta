import type { Metadata } from "next";
import "@/app/cpa.css";
import { BarraInstitucional } from "@/components/barra-institucional";
import { HomeHeader } from "@/components/home-header";
import { StatusPesquisa } from "@/components/status-pesquisa";
import { box } from "@/lib/cpa-box";

export const metadata: Metadata = { title: "Início · Portal CPA" };

export default function PaginaInicial() {
  return (
    <div className="cpa-root cpa-root--home">
      <div className="cpa-stage cpa-home">
        <HomeHeader />

        <main style={{ display: "contents" }}>
          <StatusPesquisa />
        </main>

        <BarraInstitucional as="footer" style={box(21, 458, 916, 60)} />
      </div>
    </div>
  );
}
