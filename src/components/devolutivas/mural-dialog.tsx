import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EtiquetaCategoria } from "@/components/devolutivas/etiqueta-categoria";
import { RespostaDialog } from "@/components/devolutivas/resposta-dialog";
import { box, u } from "@/lib/cpa-box";
import {
  categoriaPorId,
  rotuloPublicoDevolutiva,
  type Devolutiva,
  type OpcaoStatusFormulario,
} from "@/lib/devolutivas-data";

type Props = {
  ano: number;
  devolutivas?: Devolutiva[];
  isAdmin?: boolean;
  exibirPublico?: boolean;
  areas?: string[];
  categorias?: OpcaoStatusFormulario[];
  trigger: React.ReactElement;
};

export function MuralDialog({
  ano,
  devolutivas = [],
  isAdmin = false,
  exibirPublico = false,
  areas = [],
  categorias = [],
  trigger,
}: Props) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="cpa-modal translate-x-0 translate-y-0">
        <DialogTitle
          className="cpa-m-title"
          style={box(43, 15, 576, 53, { fontSize: u(18) })}
        >
          Mural de Devolutivas · {ano}
        </DialogTitle>
        <DialogDescription className="cpa-sr">
          Devolutivas da instituição em {ano}, com categoria e justificativa.
        </DialogDescription>

        <div className="cpa-m-list" style={box(43, 82, 576, 272)}>
          {devolutivas.map((item) => (
            <div key={item.id} className="cpa-m-item">
              <div className="cpa-m-text" title={item.titulo}>
                {item.titulo}
              </div>

              <div
                className="cpa-m-actions"
                style={{ position: "static", flex: "none" }}
              >
                {exibirPublico && (
                  <span
                    className="cpa-m-pub"
                    title="Público-alvo da devolutiva"
                    aria-label={`Público-alvo: ${rotuloPublicoDevolutiva(item.perfisPermitidos)}`}
                  >
                    {rotuloPublicoDevolutiva(item.perfisPermitidos)}
                  </span>
                )}
                <RespostaDialog
                  devolutiva={item}
                  isAdmin={isAdmin}
                  areas={areas}
                  categorias={categorias}
                />
                <EtiquetaCategoria categoria={categoriaPorId(item.categoria)} />
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}