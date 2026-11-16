import "@/app/cpa-resposta.css";
import { EtiquetaCategoria } from "@/components/devolutivas/etiqueta-categoria";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { categoriaPorId, type Devolutiva } from "@/lib/devolutivas-data";
import { box, u } from "@/lib/cpa-box";

/**
 * Botão "Ver resposta" + janela com a justificativa dada pela área responsável.
 * O botão fica ao lado da etiqueta da categoria, em cada item do Mural (todo item do Mural tem resposta).
 * Coordenadas internas relativas à janela (560 × 330 no mockup).
 * PROTÓTIPO VISUAL: mostra a devolutiva de exemplo recebida por `devolutiva`.
 * TODO (implementação): buscar a devolutiva (título, área, categoria, justificativa) no banco.
 */
export function RespostaDialog({ devolutiva }: { devolutiva: Devolutiva }) {
  const categoria = categoriaPorId(devolutiva.categoria);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          className="cpa-m-ver"
          style={{ height: u(22), lineHeight: u(20), fontSize: u(16) }}
        >
          Ver resposta
        </Button>
      </DialogTrigger>

      <DialogContent className="cpa-modal cpa-modal--resposta translate-x-0 translate-y-0">
        <DialogTitle className="cpa-m-title" style={box(30, 14, 500, 44, { fontSize: u(18) })}>
          Resposta da Devolutiva
        </DialogTitle>
        <DialogDescription className="cpa-sr">
          Justificativa dada por {devolutiva.area} a esta devolutiva.
        </DialogDescription>

        <div className="cpa-m-item" style={box(30, 72, 500, 232)}>
          <span className="cpa-m-label" style={{ left: u(18), top: u(9) }}>
            Título
          </span>
          <div className="cpa-m-text cpa-m-text--short" style={box(16, 26, 468, 30)}>
            {devolutiva.titulo}
          </div>

          <span className="cpa-m-label" style={{ left: u(18), top: u(65) }}>
            Área responsável
          </span>
          <div className="cpa-m-text cpa-m-text--short" style={box(16, 82, 300, 30)}>
            {devolutiva.area}
          </div>
          <EtiquetaCategoria categoria={categoria} style={{ right: u(16), top: u(86) }} />

          <span className="cpa-m-label" style={{ left: u(18), top: u(122) }}>
            Justificativa
          </span>
          <div className="cpa-m-text cpa-m-text--scroll" style={box(16, 139, 468, 80)}>
            {devolutiva.justificativa}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
