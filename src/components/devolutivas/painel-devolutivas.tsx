import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { BarraInstitucional } from "@/components/barra-institucional";
import { CartaoAno } from "@/components/devolutivas/cartao-ano";
import { MuralDialog } from "@/components/devolutivas/mural-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEVOLUTIVAS } from "@/lib/devolutivas-data";
import { band, box, u } from "@/lib/cpa-box";

/**
 * Central de Devolutivas (visual): cabeçalho, busca e fileira de cards por ano, com barra de
 * rolagem horizontal. O clique em um card abre o modal Mural.
 * TODO (implementação): filtrar os cards pelo campo de busca.
 */
export function PainelDevolutivas() {
  return (
    <>
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
        <h1 style={{ fontSize: u(36) }}>Central de Devolutivas</h1>
      </BarraInstitucional>

      <main style={{ display: "contents" }}>
        {/* Painel cinza; os itens abaixo são relativos a ele (canto em x=14, y=96 no mockup) */}
        <div className="cpa-panel" style={band({ left: 14, right: 14, top: 96, bottom: 72 })}>
          <div className="cpa-search" style={box(18, 14, 210, 34)}>
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

          {/* Fileira rolável: arraste a barra ou use shift + roda do mouse */}
          <div
            className="cpa-years"
            tabIndex={0}
            role="region"
            aria-label="Devolutivas por ano"
            style={band({ left: 18, right: 18, top: 58, h: 300 })}
          >
            {DEVOLUTIVAS.map((item) => (
              <MuralDialog
                key={item.ano}
                ano={item.ano}
                trigger={
                  <button
                    type="button"
                    className="cpa-year"
                    aria-label={`Abrir o mural de devolutivas de ${item.ano}`}
                  >
                    <CartaoAno item={item} />
                  </button>
                }
              />
            ))}
          </div>
        </div>
      </main>

      <BarraInstitucional as="footer" style={band({ left: 14, right: 14, bottom: 14, h: 44 })} />
    </>
  );
}
