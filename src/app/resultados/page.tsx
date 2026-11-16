import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import "@/app/cpa.css";
import { BarraInstitucional } from "@/components/barra-institucional";
import { CartaoCpa } from "@/components/resultados/cartao-cpa";
import { Button } from "@/components/ui/button";
import { band, box, u } from "@/lib/cpa-box";
import { CPAS, QUESTOES } from "@/lib/resultados-data";

export const metadata: Metadata = { title: "Resultados da Pesquisa CPA · Portal CPA" };

/**
 * Tela restrita à coordenação (o perfil aluno não acessa) (visual): um dropdown por CPA semestral.
 * TODO (implementação): restringir por perfil (tabela `roles`) e carregar os resultados reais (respostas do Google Forms).
 */
export default function PaginaResultados() {
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
            {CPAS.map((cpa, i) => (
              <CartaoCpa key={cpa.id} cpa={cpa} questoes={QUESTOES} aberto={i === 0} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
