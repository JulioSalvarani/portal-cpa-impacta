import type { Metadata } from "next";
import "@/app/cpa.css";
import { BarraInstitucional } from "@/components/barra-institucional";
import { HomeHeader } from "@/components/home-header";
import { StatusPesquisa } from "@/components/status-pesquisa";
import { band, size, u } from "@/lib/cpa-box";

export const metadata: Metadata = { title: "Início · Portal CPA" };

export default function PaginaInicial() {
  return (
    <div className="cpa-root cpa-root--home">
      <div className="cpa-stage cpa-home">
        <HomeHeader />

        <main style={{ display: "contents" }}>
          {/* Bloco central: banner + botões, centralizado na tela (levemente abaixo do meio, como no mockup) */}
          <div
            className="cpa-center"
            style={{ ...size(782, 223), top: `calc(50% + ${u(39.5)})` }}
          >
            <StatusPesquisa />
          </div>
        </main>

        <BarraInstitucional as="footer" style={band({ left: 21, right: 21, bottom: 22, h: 60 })} />
      </div>
    </div>
  );
}
