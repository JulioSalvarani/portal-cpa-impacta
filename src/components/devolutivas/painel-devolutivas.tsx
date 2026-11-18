import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { BarraInstitucional } from "@/components/barra-institucional";
import { CartaoAno } from "@/components/devolutivas/cartao-ano";
import { MuralDialog } from "@/components/devolutivas/mural-dialog";
import { Button } from "@/components/ui/button";
import { band, box, u } from "@/lib/cpa-box";
import type {
  AnoDevolutivas,
  Devolutiva,
  OpcaoStatusFormulario,
} from "@/lib/devolutivas-data";

type Props = {
  resumoAnos: AnoDevolutivas[];
  devolutivasPorAno: Record<number, Devolutiva[]>;
  isAdmin?: boolean;
  areas?: string[];
  categorias?: OpcaoStatusFormulario[];
};

export function PainelDevolutivas({
  resumoAnos,
  devolutivasPorAno,
  isAdmin = false,
  areas = [],
  categorias = [],
}: Props) {
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

        {isAdmin && (
          <Button
            asChild
            className="cpa-btn cpa-btn--line"
            style={{
              position: "absolute",
              right: u(24),
              top: u(17),
              height: u(34),
              padding: `0 ${u(14)}`,
              borderRadius: u(17),
              fontSize: u(14),
              gap: u(6),
            }}
          >
            <Link href="/devolutivas/responder">
              <Plus aria-hidden style={{ width: u(16), height: u(16) }} />
              Nova devolutiva
            </Link>
          </Button>
        )}
      </BarraInstitucional>

      <main style={{ display: "contents" }}>
        <div className="cpa-panel" style={band({ left: 14, right: 14, top: 96, bottom: 72 })}>
          {resumoAnos.length === 0 ? (
            <div
              className="cpa-center"
              style={{ textAlign: "center", fontSize: u(18), color: "var(--cpa-line)" }}
            >
              Nenhuma devolutiva publicada até o momento.
            </div>
          ) : (
            <div
              className="cpa-years"
              tabIndex={0}
              role="region"
              aria-label="Devolutivas por ano"
              style={band({ left: 18, right: 18, top: 34, h: 300 })}
            >
              {resumoAnos.map((item) => (
                <MuralDialog
                  key={item.ano}
                  ano={item.ano}
                  devolutivas={devolutivasPorAno[item.ano] ?? []}
                  isAdmin={isAdmin}
                  areas={areas}
                  categorias={categorias}
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
          )}
        </div>
      </main>

      <BarraInstitucional as="footer" style={band({ left: 14, right: 14, bottom: 14, h: 44 })} />
    </>
  );
}