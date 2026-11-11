import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { BarraInstitucional } from "@/components/barra-institucional";
import { CartaoAno } from "@/components/devolutivas/cartao-ano";
import { MuralDialog } from "@/components/devolutivas/mural-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEVOLUTIVAS } from "@/lib/devolutivas-data";
import { box, u } from "@/lib/cpa-box";

/**
 * Central de Devolutivas (visual): cabeçalho, busca, cards por ano e barra de rolagem.
 * O clique em um card abre o modal Mural.
 * TODO (implementação): filtrar os cards pelo campo de busca.
 */
export function PainelDevolutivas() {
  return (
    <>
      <BarraInstitucional as="header" style={box(10, 13, 940, 68)} />
      <h1
        className="cpa-pill"
        style={box(10, 13, 940, 68, {
          background: "transparent",
          fontSize: u(36),
          pointerEvents: "none",
        })}
      >
        Central de Devolutivas
      </h1>
      <Button
        asChild
        className="cpa-btn cpa-btn--ghost"
        style={box(44, 30, 40, 34, { borderRadius: u(17) })}
      >
        <Link href="/inicio" aria-label="Voltar" title="Voltar">
          <ArrowLeft aria-hidden style={{ width: u(26), height: u(26) }} />
        </Link>
      </Button>

      <main style={{ display: "contents" }}>
        <div className="cpa-panel" style={box(14, 96, 932, 372)} />

        <div className="cpa-search" style={box(32, 110, 210, 34)}>
          <Search aria-hidden style={{ width: u(18), height: u(18), flex: "none" }} />
          <Label htmlFor="busca-devolutivas" className="cpa-sr">
            Pesquisar devolutivas
          </Label>
          <Input
            id="busca-devolutivas"
            type="search"
            placeholder="Pesquisar"
            autoComplete="off"
            className="cpa-search-input"
          />
        </div>

        {DEVOLUTIVAS.map((item, indice) => (
          <MuralDialog
            key={item.ano}
            ano={item.ano}
            trigger={
              <button
                type="button"
                className="cpa-year"
                aria-label={`Abrir o mural de devolutivas de ${item.ano}`}
                style={box(32 + indice * 305, 154, 285, 262)}
              >
                <CartaoAno item={item} />
              </button>
            }
          />
        ))}

        <div className="cpa-hscroll" aria-hidden style={box(32, 428, 896, 26)} />
      </main>

      <BarraInstitucional as="footer" style={box(14, 482, 932, 44)} />
    </>
  );
}
