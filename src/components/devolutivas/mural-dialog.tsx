import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EtiquetaStatus } from "@/components/devolutivas/etiqueta-status";
import { MANIFESTACOES_EXEMPLO } from "@/lib/devolutivas-data";
import { box, u } from "@/lib/cpa-box";

/**
 * Modal "Mural de Devolutivas". O `trigger` é o elemento (um <button>) que abre o modal.
 * As coordenadas internas são relativas ao modal (662 × 370 no mockup).
 * PROTÓTIPO VISUAL: mostra sempre as mesmas 3 manifestações de exemplo.
 * TODO (implementação): carregar as manifestações do ano e permitir expandir/recolher cada uma.
 */
export function MuralDialog({ ano, trigger }: { ano: number; trigger: React.ReactElement }) {
  const [primeira, segunda, terceira] = MANIFESTACOES_EXEMPLO;

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="cpa-modal">
        <DialogTitle className="cpa-m-title" style={box(43, 15, 577, 53, { fontSize: u(18) })}>
          Mural de Devolutivas
        </DialogTitle>
        <DialogDescription className="cpa-sr">
          Manifestações enviadas em {ano} e o andamento de cada pedido.
        </DialogDescription>
        <div className="cpa-m-scroll" aria-hidden style={box(632, 56, 18, 60)} />

        {/* Manifestação em destaque (caixa grande) */}
        <div className="cpa-m-item" style={box(43, 92, 577, 135)}>
          <div className="cpa-m-text" style={box(22, 13, 544, 85)}>
            {primeira.texto}
            <span className="cpa-m-scroll" aria-hidden style={box(518, 8, 18, 60)} />
          </div>
          <EtiquetaStatus status={primeira.status} style={{ right: u(10), bottom: u(6) }} />
        </div>

        {/* Manifestações recolhidas (linha única) */}
        <div className="cpa-m-item" style={box(43, 234, 577, 61)}>
          <div className="cpa-m-text cpa-m-text--short" style={box(14, 5, 311, 35)}>
            {segunda.texto}
          </div>
          <EtiquetaStatus status={segunda.status} style={{ right: u(10), top: u(19) }} />
        </div>

        <div className="cpa-m-item" style={box(43, 299, 577, 60)}>
          <div className="cpa-m-text cpa-m-text--short" style={box(14, 5, 311, 35)}>
            {terceira.texto}
          </div>
          <EtiquetaStatus status={terceira.status} style={{ right: u(10), top: u(19) }} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
