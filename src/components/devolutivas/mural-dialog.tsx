import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EtiquetaCategoria } from "@/components/devolutivas/etiqueta-categoria";
import { RespostaDialog } from "@/components/devolutivas/resposta-dialog";
import { DEVOLUTIVAS_EXEMPLO, categoriaPorId } from "@/lib/devolutivas-data";
import { box, u } from "@/lib/cpa-box";

/**
 * Modal "Mural de Devolutivas". O `trigger` é o elemento (um <button>) que abre o modal.
 * As coordenadas internas são relativas ao modal (662 × 370 no mockup).
 * Cada item é uma devolutiva (resposta da instituição): título, botão "Ver resposta" (abre a
 * justificativa) e etiqueta da categoria (Resolvido, Inapto, Impertinente), com texto e cor do banco.
 * Só devolutivas com resposta aparecem no Mural (registro 0017).
 * PROTÓTIPO VISUAL: mostra sempre as mesmas 3 devolutivas de exemplo.
 * TODO (implementação): carregar as devolutivas do ano e permitir expandir/recolher cada uma.
 */
export function MuralDialog({ ano, trigger }: { ano: number; trigger: React.ReactElement }) {
  const [primeira, segunda, terceira] = DEVOLUTIVAS_EXEMPLO;

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      {/* translate-x-0 translate-y-0 (ajuste do usuário, reg. 0015): anula o translate de centralização do shadcn/Tailwind v4; o cpa.css centraliza com inset:0 + margin:auto */}
      <DialogContent className="cpa-modal translate-x-0 translate-y-0">
        <DialogTitle className="cpa-m-title" style={box(43, 15, 577, 53, { fontSize: u(18) })}>
          Mural de Devolutivas
        </DialogTitle>
        <DialogDescription className="cpa-sr">
          Devolutivas da instituição em {ano}, com a categoria e a justificativa de cada uma.
        </DialogDescription>
        <div className="cpa-m-scroll" aria-hidden style={box(632, 56, 18, 60)} />

        {/* Devolutiva em destaque (caixa grande) */}
        <div className="cpa-m-item" style={box(43, 92, 577, 135)}>
          <div className="cpa-m-text" style={box(22, 13, 544, 85)}>
            {primeira.titulo}
            <span className="cpa-m-scroll" aria-hidden style={box(518, 8, 18, 60)} />
          </div>
          <div className="cpa-m-actions" style={{ right: u(10), bottom: u(6) }}>
            <RespostaDialog devolutiva={primeira} />
            <EtiquetaCategoria categoria={categoriaPorId(primeira.categoria)} />
          </div>
        </div>

        {/* Devolutivas recolhidas (linha única) */}
        <div className="cpa-m-item" style={box(43, 234, 577, 61)}>
          <div className="cpa-m-text cpa-m-text--short" style={box(14, 5, 250, 35)}>
            {segunda.titulo}
          </div>
          <div className="cpa-m-actions" style={{ right: u(10), top: u(19) }}>
            <RespostaDialog devolutiva={segunda} />
            <EtiquetaCategoria categoria={categoriaPorId(segunda.categoria)} />
          </div>
        </div>

        <div className="cpa-m-item" style={box(43, 299, 577, 60)}>
          <div className="cpa-m-text cpa-m-text--short" style={box(14, 5, 250, 35)}>
            {terceira.titulo}
          </div>
          <div className="cpa-m-actions" style={{ right: u(10), top: u(19) }}>
            <RespostaDialog devolutiva={terceira} />
            <EtiquetaCategoria categoria={categoriaPorId(terceira.categoria)} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
